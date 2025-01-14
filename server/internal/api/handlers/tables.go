package handlers

import (
	"server/internal/models"
	res "server/internal/utils"
	"server/internal/utils/uuid"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// Find all tables
func (h *Handler) FindAllTables(c *fiber.Ctx) error {
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
    if err := h.db.Debug().
        Model(&models.Item{}).
        Preload("Room").
        Preload("Room.Building").
        Preload("Device").
        Joins("LEFT JOIN rooms ON items.room_id = rooms.room_id").
        Joins("LEFT JOIN buildings ON rooms.building_id = buildings.building_id").
        Where("items.type = ? AND items.room_id = ?", models.ItemTypeTable, roomId).
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
            BuildingID: table.Room.Building.BuildingID,
            Available:  table.Available,
            PositionX:  *table.PositionX,
            PositionY:  *table.PositionY,
            Width:      *table.Width,
            Height:     *table.Height,
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
                },
            },
            Device: DeviceResponse{},
        }

        // Set device information if available
        if table.Device != nil {
            resp.Device = DeviceResponse{
                DeviceID:   table.Device.ID,
                Name:       table.Device.Name,
                Topic:      table.Device.Topic,
                BuildingID: table.Device.BuildingID,
                RoomID:     table.Device.RoomID,
            }
        }

        response = append(response, resp)
    }

    // Initialize empty slice if no results found
    if response == nil {
        response = make([]ItemResponse, 0)
    }

    return res.GetSuccess(c, "Tables retrieved", response)
}

func (h *Handler) CreateTable(c *fiber.Ctx) error {
    var req CreateTableRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if req.PositionX < 0 || req.PositionY < 0 || req.Width <= 0 || req.Height <= 0 ||
        req.RoomID == "" || req.Name == "" || req.DeviceID == "" {
        return res.BadRequest(c, "room_id, name, position_x, position_y, width, height, device_id are required and must be valid")
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

    itemID := uuid.GenerateUUID()
    table := models.NewTable(
        itemID,
        req.RoomID,
        req.PositionX,
        req.PositionY,
        req.Width,
        req.Height,
        req.Name,
        req.DeviceID,
    )

    if err := tx.Create(table).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    var createdTable models.Item
    if err := tx.
        Preload("Room").
        Preload("Room.Building").
        Preload("Device").
        Where("item_id = ?", itemID).
        First(&createdTable).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    response := ItemResponse{
        ItemID:      createdTable.ItemID,
        Type:        createdTable.Type,
        BuildingID:  createdTable.Room.Building.BuildingID,
        Available:   createdTable.Available,
        PositionX:   *createdTable.PositionX,
        PositionY:   *createdTable.PositionY,
        Width:       *createdTable.Width,
        Height:      *createdTable.Height,
        Name:        createdTable.Name,
        Description: nil,
        Location: LocationResponse{
            Building: BuildingResponse{
                BuildingID:   createdTable.Room.Building.BuildingID,
                BuildingName: createdTable.Room.Building.BuildingName,
                Description:  createdTable.Room.Building.Description,
                ImageURL:     createdTable.Room.Building.ImageURL,
            },
            Room: RoomResponse{
                RoomID:      createdTable.Room.RoomID,
                BuildingID:  createdTable.Room.BuildingID,
                RoomName:    createdTable.Room.RoomName,
                Description: createdTable.Room.Description,
                ImageURL:    createdTable.Room.ImageURL,
            },
        },
    }

    if createdTable.Device != nil {
        response.Device = DeviceResponse{
            DeviceID:   createdTable.Device.ID,
            Name:       createdTable.Device.Name,
            Topic:      createdTable.Device.Topic,
            BuildingID: createdTable.Device.BuildingID,
            RoomID:     createdTable.Device.RoomID,
        }
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, response)
}

// Update table
func (h *Handler) UpdateTable(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateTableRequest

	// Parse request body
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

	// Find existing item and verify it's a table
	var item models.Item
	result := tx.Where("item_id = ? AND type = ?", id, models.ItemTypeTable).First(&item)
	if result.Error != nil {
		tx.Rollback()
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Table", result.Error)
		}
		return res.InternalServerError(c, result.Error)
	}

	// Build updates map with validations
	updates := make(map[string]interface{})

	if req.RoomID != nil {
		if *req.RoomID == "" {
			return res.BadRequest(c, "room_id cannot be empty")
		}
		// Verify new room exists
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
