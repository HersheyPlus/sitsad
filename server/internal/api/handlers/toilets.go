package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
    "strings"
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

// Find all toilets by building ID
func (h *Handler) FindAllToiletsByBuildingId(c *fiber.Ctx) error {
    buildingId := c.Query("building_id")
    if buildingId == "" {
        return res.BadRequest(c, "building_id is required")
    }

    var toilets []models.Item
    if err := h.db.Where("building_id = ? AND items.type = ?", buildingId, models.ItemTypeToilet).
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
            BuildingID: toilet.Room.Building.BuildingID,  // Add BuildingID from joined Building
            Available:  toilet.Available,
            Name:       toilet.Name,
            PositionX:  getFloatValue(toilet.PositionX, 0),
            PositionY:  getFloatValue(toilet.PositionY, 0),
            Floor:      toilet.Floor,
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
                    Floor:       toilet.Room.Floor,
                },
            },
        }

        if toilet.Width != nil {
            resp.Width = *toilet.Width
        }
        if toilet.Height != nil {
            resp.Height = *toilet.Height
        }

        response = append(response, resp)
    }

    if response == nil {
        response = make([]ItemResponse, 0)
    }

    return res.GetSuccess(c, "Toilets retrieved", response)
}
// Create toilet
func (h *Handler) CreateToilet(c *fiber.Ctx) error {
    var req CreateToiletRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    // Manual validation
    if req.Floor == 0 || req.Name == "" || req.PositionX < 0 || req.PositionY < 0 || req.Width <= 0 || req.Height <= 0 {
        return res.BadRequest(c, "floor, name, position_x, position_y, width, height are required and must be valid")
    }

    // Normalize and validate gender
    req.Gender = strings.ToLower(req.Gender)
    if req.Gender != "male" && req.Gender != "female" && req.Gender != "unisex" {
        return res.BadRequest(c, "gender must be 'male', 'female', or 'unisex'")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Check if room exists if roomID is provided
    if req.RoomID != "" {
        if err := h.ExistingRoom(tx, c, req.RoomID); err != nil {
            tx.Rollback()
            return res.NotFound(c, "Room", err)
        }
    }

    toilet := models.NewToilet(
        req.Floor,
        &req.RoomID,
        req.Gender,
        req.Name,
        req.PositionX,
        req.PositionY,
        req.Width,
        req.Height,
    )

    if err := tx.Create(toilet).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Preload("Building").Preload("Room").First(toilet, toilet.ItemID).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    h.wsHub.BroadcastNewItem(toilet, "toilet")
    return res.CreatedSuccess(c, toilet)
}

// Update toilet
func (h *Handler) UpdateToilet(c *fiber.Ctx) error {
    id := c.Params("id")
    var req UpdateToiletRequest

    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Find existing item and verify it's a toilet
    var item models.Item
    result := tx.Where("item_id = ? AND type = ?", id, models.ItemTypeToilet).First(&item)
    if result.Error != nil {
        tx.Rollback()
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Toilet", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    // Build updates map with validations
    updates := make(map[string]interface{})
    
    if req.Name != nil {
        if *req.Name == "" {
            return res.BadRequest(c, "name cannot be empty")
        }
        updates["name"] = *req.Name
    }

    if req.Floor != nil {
        if *req.Floor <= 0 {
            return res.BadRequest(c, "floor must be greater than 0")
        }
        updates["floor"] = *req.Floor
    }

    if req.Gender != nil {
        gender := strings.ToLower(*req.Gender)
        if gender != "male" && gender != "female" && gender != "unisex" {
            return res.BadRequest(c, "gender must be 'male', 'female', or 'unisex'")
        }
        updates["gender"] = gender
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

    // Perform update if there are any changes
    if len(updates) > 0 {
        if err := tx.Model(&item).Updates(updates).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    // Fetch updated item with relationships
    var updatedItem models.Item
    if err := h.db.
        Preload("Room").
        Preload("Room.Building").
        Where("item_id = ?", id).
        First(&updatedItem).Error; err != nil {
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