package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
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
        Where("type = ? AND room_id = ?", models.ItemTypeToilet, roomId).
        Find(&toilets).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    var response []ItemResponse
    for _, toilet := range toilets {
        if toilet.Room == nil || toilet.Room.Building.BuildingID == "" {
            continue
        }

        // Initialize response with required fields
        resp := ItemResponse{
            ItemID:     toilet.ItemID,
            Type:       toilet.Type,
            BuildingID: toilet.Room.BuildingID,
            Available:  toilet.Available,
            Name:       toilet.Name,
            // Handle optional pointer fields safely
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

        // Add optional Width and Height only if they exist
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

// Helper function to safely get float value from pointer
func getFloatValue(ptr *float64, defaultValue float64) float64 {
    if ptr == nil {
        return defaultValue
    }
    return *ptr
}
// Create toilet
func (h *Handler) CreateToilet(c *fiber.Ctx) error {
    var req CreateToiletRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if req.BuildingID == "" || req.Floor == 0 || req.Name == "" || 
       (req.Gender != "female" && req.Gender != "male") || 
       req.PositionX < 0 || req.PositionY < 0 {
        return res.BadRequest(c, "building_id, floor, name, gender (female or male), position_x, position_y are required")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Check if building exists
    if err := h.ExistingBuilding(tx, c, req.BuildingID); err != nil {
        tx.Rollback()
        return res.NotFound(c, "Building", err)
    }

    // Check if room exists if roomID is provided
    if req.RoomID != "" {
        if err := h.ExistingRoom(tx, c, req.RoomID); err != nil {
            tx.Rollback()
            return res.NotFound(c, "Room", err)
        }
    }

    toilet := models.NewToilet(
        req.BuildingID,
        &req.RoomID,    // Pass the optional roomID
        req.Floor,
        req.Gender,
        req.Name,
        req.PositionX,
        req.PositionY,
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
    var item models.Item
    var updateData models.Item

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Find existing item and verify it's a toilet
    result := tx.Where("item_id = ? AND type = ?", id, models.ItemTypeToilet).First(&item)
    if result.Error != nil {
        tx.Rollback()
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Toilet", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    // Parse update data
    if err := c.BodyParser(&updateData); err != nil {
        tx.Rollback()
        return res.BadRequest(c, err.Error())
    }

    // If building ID is provided, verify it exists
    if updateData.BuildingID != nil {
        var building models.Building
        if err := tx.Where("building_id = ?", *updateData.BuildingID).First(&building).Error; err != nil {
            tx.Rollback()
            if err == gorm.ErrRecordNotFound {
                return res.BadRequest(c, "New building does not exist")
            }
            return res.InternalServerError(c, err)
        }
        // Update building_id
        if err := tx.Model(&item).Update("building_id", updateData.BuildingID).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    // Update each field individually if provided
    if updateData.Name != "" {
        if err := tx.Model(&item).Update("name", updateData.Name).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if updateData.Floor != nil {
        if err := tx.Model(&item).Update("floor", updateData.Floor).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if updateData.Gender != nil {
        if err := tx.Model(&item).Update("gender", updateData.Gender).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if updateData.PositionX != nil {
        if err := tx.Model(&item).Update("position_x", updateData.PositionX).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if updateData.PositionY != nil {
        if err := tx.Model(&item).Update("position_y", updateData.PositionY).Error; err != nil {
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
        Preload("Building").
        Where("item_id = ?", id).
        First(&updatedItem).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.UpdatedSuccess(c, updatedItem)
}
