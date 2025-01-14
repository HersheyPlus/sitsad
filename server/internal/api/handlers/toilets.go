package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
    "server/internal/utils/uuid"
)

// Find all toilets
func (h *Handler) FindAllToilets(c *fiber.Ctx) error {
    var toilets []models.Item
    if err := h.db.
        Preload("Building").
        Preload("Room").
        Where("type = ?", models.ItemTypeToilet).
        Find(&toilets).Error; err != nil {
        return res.InternalServerError(c, err)
    }
    return res.GetSuccess(c, "Toilets retrieved", toilets)
}


// Find toilet by ID
func (h *Handler) FindToiletByID(c *fiber.Ctx) error {
    id := c.Params("id")
    var toilet models.Item
    if err := h.db.
        Preload("Building").
        Preload("Room").
        Where("item_id = ? AND type = 'toilet'", id).
        First(&toilet).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Toilet", err)
        }
        return res.InternalServerError(c, err)
    }
    return res.GetSuccess(c, "Toilet retrieved", toilet)
}

func (h *Handler) FindToiletsByRoomId(c *fiber.Ctx) error {
    roomId := c.Params("roomId")
    if roomId == "" {
        return res.BadRequest(c, "roomId is required")
    }

    var toilets []models.Item
    if err := h.db.
        Model(&models.Item{}).
        Preload("Room").
        Preload("Room.Building").
        Preload("Device").
        Joins("LEFT JOIN rooms ON items.room_id = rooms.room_id").
        Joins("LEFT JOIN buildings ON rooms.building_id = buildings.building_id").
        Where("items.type = ? AND items.room_id = ?", models.ItemTypeToilet, roomId).
        Find(&toilets).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    var response []ItemResponse
    for _, toilet := range toilets {
        if toilet.Room == nil || toilet.Room.Building.BuildingID == "" {
            continue
        }

        resp := ItemResponse{
            ItemID:     toilet.ItemID,
            Type:       toilet.Type,
            BuildingID: toilet.Room.Building.BuildingID,
            Available:  toilet.Available,
            PositionX:  getFloatValue(toilet.PositionX, 0),
            PositionY:  getFloatValue(toilet.PositionY, 0),
            Width:      getFloatValue(toilet.Width, 0),
            Height:     getFloatValue(toilet.Height, 0),
            Name:       toilet.Name,
            Location: LocationResponse{
                Building: BuildingResponse{
                    BuildingID:   toilet.Room.Building.BuildingID,
                    BuildingName: toilet.Room.Building.BuildingName,
                    Description:  toilet.Room.Building.Description,
                    ImageURL:     toilet.Room.Building.ImageURL,
                },
                Room: RoomResponse{
                    RoomID:      toilet.Room.RoomID,
                    BuildingID:  toilet.Room.BuildingID,
                    RoomName:    toilet.Room.RoomName,
                    Description: toilet.Room.Description,
                    ImageURL:    toilet.Room.ImageURL,
                },
            },
            Device: DeviceResponse{},
        }

        // Set device information if available
        if toilet.Device != nil {
            resp.Device = DeviceResponse{
                DeviceID:   toilet.Device.ID,
                Name:       toilet.Device.Name,
                Topic:      toilet.Device.Topic,
                BuildingID: toilet.Device.BuildingID,
                RoomID:     toilet.Device.RoomID,
            }
        }

        response = append(response, resp)
    }

    if response == nil {
        response = make([]ItemResponse, 0)
    }

    return res.GetSuccess(c, "Toilets retrieved", response)
}

func (h *Handler) CreateToilet(c *fiber.Ctx) error {
    var req CreateToiletRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if req.PositionX < 0 || req.PositionY < 0 || req.Width <= 0 || req.Height <= 0 ||
        req.RoomID == "" || req.Name == "" {
        return res.BadRequest(c, "room_id, name, position_x, position_y, width, height are required and must be valid")
    }

    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    if err := h.ExistingRoom(tx, c, req.RoomID); err != nil {
        tx.Rollback()
        return res.NotFound(c, "Room", err)
    }

    var roomIDPtr *string
    if req.RoomID != "" {
        if err := h.ExistingRoom(tx, c, req.RoomID); err != nil {
            tx.Rollback()
            return res.NotFound(c, "Room", err)
        }
        roomIDPtr = &req.RoomID
    }

    itemID := uuid.GenerateUUID()
    toilet := models.NewToilet(
        itemID,      // itemId string
        roomIDPtr,   // roomID *string
        req.Name,    // name string
        req.PositionX, // posX float64
        req.PositionY, // posY float64
        req.Width,     // width float64
        req.Height,    // height float64
        req.DeviceID,  // deviceId *string
    )

    if err := tx.Create(toilet).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    var createToilet models.Item
    query := tx.Preload("Room").Preload("Room.Building")
    
    // Only preload Device if DeviceID was provided
    if req.DeviceID != nil {
        query = query.Preload("Device")
    }
    
    if err := query.Where("item_id = ?", itemID).First(&createToilet).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    response := ItemResponse{
        ItemID:      createToilet.ItemID,
        Type:        createToilet.Type,
        BuildingID:  createToilet.Room.Building.BuildingID,
        Available:   createToilet.Available,
        PositionX:   *createToilet.PositionX,
        PositionY:   *createToilet.PositionY,
        Width:       *createToilet.Width,
        Height:      *createToilet.Height,
        Name:        createToilet.Name,
        Description: nil,
        Location: LocationResponse{
            Building: BuildingResponse{
                BuildingID:   createToilet.Room.Building.BuildingID,
                BuildingName: createToilet.Room.Building.BuildingName,
                Description:  createToilet.Room.Building.Description,
                ImageURL:     createToilet.Room.Building.ImageURL,
            },
            Room: RoomResponse{
                RoomID:      createToilet.Room.RoomID,
                BuildingID:  createToilet.Room.BuildingID,
                RoomName:    createToilet.Room.RoomName,
                Description: createToilet.Room.Description,
                ImageURL:    createToilet.Room.ImageURL,
            },
        },
    }

    // Only include Device in response if it exists
    if createToilet.Device != nil {
        response.Device = DeviceResponse{
            DeviceID:   createToilet.Device.ID,
            Name:       createToilet.Device.Name,
            Topic:      createToilet.Device.Topic,
            BuildingID: createToilet.Device.BuildingID,
            RoomID:     createToilet.Device.RoomID,
        }
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, response)
}

// Update table
func (h *Handler) UpdateToilet(c *fiber.Ctx) error {
    id := c.Params("id")
    var req UpdateToiletRequest

    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var item models.Item
    result := tx.Where("item_id = ? AND type = ?", id, models.ItemTypeToilet).First(&item)
    if result.Error != nil {
        tx.Rollback()
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Table", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    updates := make(map[string]interface{})

    if req.RoomID != nil {
        if *req.RoomID == "" {
            return res.BadRequest(c, "room_id cannot be empty")
        }
        if err := h.ExistingRoom(tx, c, *req.RoomID); err != nil {
            tx.Rollback()
            return res.NotFound(c, "Room", err)
        }
        updates["room_id"] = req.RoomID
    }

    if req.Name != nil {
        if *req.Name == "" {
            return res.BadRequest(c, "name cannot be empty")
        }
        updates["name"] = *req.Name
    }

    if req.PositionX != nil {
        if *req.PositionX < 0 {
            return res.BadRequest(c, "position_x must be non-negative")
        }
        updates["position_x"] = *req.PositionX
    }

    if req.PositionY != nil {
        if *req.PositionY < 0 {
            return res.BadRequest(c, "position_y must be non-negative")
        }
        updates["position_y"] = *req.PositionY
    }

    if req.Width != nil {
        if *req.Width <= 0 {
            return res.BadRequest(c, "width must be greater than 0")
        }
        updates["width"] = *req.Width
    }

    if req.Height != nil {
        if *req.Height <= 0 {
            return res.BadRequest(c, "height must be greater than 0")
        }
        updates["height"] = *req.Height
    }

    // Handle DeviceID update
    if req.DeviceID != nil {
        updates["device_id"] = req.DeviceID
    }

    if len(updates) > 0 {
        if err := tx.Model(&item).Updates(updates).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    var updatedItem models.Item
    query := h.db.Preload("Room").Preload("Room.Building")
    
    // Only preload Device if it exists
    if item.DeviceID != nil {
        query = query.Preload("Device")
    }
    
    if err := query.Where("item_id = ?", id).First(&updatedItem).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.UpdatedSuccess(c, updatedItem)
}


func getFloatValue(ptr *float64, defaultValue float64) float64 {
    if ptr == nil {
        return defaultValue
    }
    return *ptr
}