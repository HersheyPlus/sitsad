package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
)

// Find all tables
func (h * Handler) FindAllTables(c *fiber.Ctx) error {
    var tables []models.Item
    if err := h.db.Preload("Room").Where("type = ?", models.ItemTypeTable).Find(&tables).Error; err != nil {
        return res.InternalServerError(c, err)
    }
    return res.GetSuccess(c, "Tables retrieved", tables)
}



func (h *Handler) FindTableByID(c *fiber.Ctx) error {
    id := c.Params("id")
    var table models.Item
    if err := h.db.Preload("Room").Where("item_id = ? AND type = 'table' ", id).First(&table).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Table", err)
        }
        return res.InternalServerError(c, err)
    }
    return res.GetSuccess(c, "Table retrieved", table)
}

func (h *Handler) FindTablesByRoomId(c *fiber.Ctx) error {
    roomId := c.Params("roomId")
    if roomId == "" {
        return res.BadRequest(c, "roomId is required")
    }

    var tables []models.Item
    // Simplified query focusing on proper preloading
    if err := h.db.Debug().
        Model(&models.Item{}).
        Preload("Room").           // Preload room
        Preload("Room.Building").  // Preload building through room
        Where("type = ? AND room_id = ?", models.ItemTypeTable, roomId).
        Find(&tables).Error; err != nil {
        return res.InternalServerError(c, err)
    }


    var response []ItemResponse
    for _, table := range tables {
        if table.Room == nil || table.Room.Building.BuildingID == "" {
            continue
        }

        resp := ItemResponse{
            ItemID:     table.ItemID,
            Type:       table.Type,
            BuildingID: table.Room.BuildingID,
            Available:  table.Available,
            PositionX:  *table.PositionX,
            PositionY:  *table.PositionY,
            Width:      *table.Width,
            Height:     *table.Height,
            Floor:      table.Floor,
            Name:       table.Name,
            Location: LocationResponse{
                Building: BuildingResponse{
                    BuildingID:   table.Room.Building.BuildingID,
                    BuildingName: table.Room.Building.BuildingName,
                    Description:  table.Room.Building.Description,
                    ImageURL:     table.Room.Building.ImageURL,
                },
                Room: RoomResponse{
                    RoomID:      table.Room.RoomID,
                    BuildingID:  table.Room.BuildingID,
                    RoomName:    table.Room.RoomName,
                    Description: table.Room.Description,
                    ImageURL:    table.Room.ImageURL,
                    Floor:       table.Room.Floor,
                },
            },
        }
        response = append(response, resp)
    }

    if response == nil {
        response = make([]ItemResponse, 0)
    }

    return res.GetSuccess(c, "Tables retrieved", response)
}

// Creat table
func (h *Handler) CreateTable(c *fiber.Ctx) error {
    var req CreateTableRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if req.PositionX < 0 || req.PositionY < 0 || req.Width < 0 || req.Height < 0 || req.RoomID == "" || req.Name == "" {
        return res.BadRequest(c, "room_id, name, position_x, position_y, width, height are required")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Check if room exists
    if err := h.ExistingRoom(tx, c, req.RoomID); err != nil {
        tx.Rollback()
        return res.NotFound(c, "Room", err)
    }

    table := models.NewTable(
        req.RoomID,
        req.PositionX,
        req.PositionY,
        req.Width,
        req.Height,
        req.Name,
    )

    if err := tx.Create(table).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Preload("Room").First(table, table.ItemID).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    h.wsHub.BroadcastNewItem(table, "table")
    return res.CreatedSuccess(c, table)
}

// Update table
func (h *Handler) UpdateTable(c *fiber.Ctx) error {
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

    // Find existing item and verify it's a table
    result := tx.Where("item_id = ? AND type = ?", id, models.ItemTypeTable).First(&item)
    if result.Error != nil {
        tx.Rollback()
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Table", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    // Parse update data
    if err := c.BodyParser(&updateData); err != nil {
        tx.Rollback()
        return res.BadRequest(c, err.Error())
    }

    // If room ID is provided and different, verify it exists
    if updateData.RoomID != nil {
        var room models.Room
        if err := tx.Where("room_id = ?", *updateData.RoomID).First(&room).Error; err != nil {
            tx.Rollback()
            if err == gorm.ErrRecordNotFound {
                return res.BadRequest(c, "New room does not exist")
            }
            return res.InternalServerError(c, err)
        }
        // Update room_id
        if err := tx.Model(&item).Update("room_id", updateData.RoomID).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    // Update individual fields if provided
    if updateData.Name != "" {
        if err := tx.Model(&item).Update("name", updateData.Name).Error; err != nil {
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

    if updateData.Width != nil {
        if err := tx.Model(&item).Update("width", updateData.Width).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if updateData.Height != nil {
        if err := tx.Model(&item).Update("height", updateData.Height).Error; err != nil {
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

