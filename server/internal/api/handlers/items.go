package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
	"time"
	"fmt"
    "server/internal/ws"
)


func (h *Handler) GetListItems(c *fiber.Ctx) error {
    itemType := c.Query("type")
    var items []models.Item
    query := h.db

    if itemType != "" {
        if itemType != "table" && itemType != "toilet" {
            return res.BadRequest(c, "Invalid item type")
        }
        query = query.Where("type = ?", itemType)
    }

    // Add preload based on type
    if itemType == "table" {
        query = query.Preload("Room")
    } else if itemType == "toilet" {
        query = query.Preload("Building")
    } else {
        query = query.Preload("Room").Preload("Building")
    }

    if err := query.Find(&items).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    message := "List of items"
    if itemType != "" {
        message = fmt.Sprintf("List of items (%s)", itemType)
    }

    return res.GetSuccess(c, message, items)
}


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
func (h *Handler) CreateToilet(c *fiber.Ctx) error {
    var req CreateToiletRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if req.BuildingID == "" || req.Floor == 0 || req.Name == "" || (req.Gender != "female" && req.Gender != "male") || req.PositionX < 0 || req.PositionY < 0 {
        return res.BadRequest(c, "building_id, floor, name, gender (female or male), position_x, position_y, name are required")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    if err := h.ExistingBuilding(tx, c, req.BuildingID); err != nil {
        tx.Rollback()
        return res.NotFound(c, "Building", err)
    }

    toilet := models.NewToilet(
        req.BuildingID,
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

    if err := tx.Preload("Building").First(toilet, toilet.ItemID).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    h.wsHub.BroadcastNewItem(toilet, "toilet")
    return res.CreatedSuccess(c, toilet)
}

func (h *Handler) UpdateItemAvailable(c *fiber.Ctx) error {
    id := c.Params("id")
    
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    
    var item models.Item
    if err := tx.Where("item_id = ?", id).First(&item).Error; err != nil {
        tx.Rollback()
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Item", err)
        }
        return res.InternalServerError(c, err)
    }

    newAvailability := !item.Available
    now := time.Now()
    
    if newAvailability {
        // Item becoming available - update end time of current booking
        if err := tx.Model(&models.BookingTimePeriod{}).
            Where("item_id = ? AND ended_booking_time IS NULL", item.ItemID).
            Update("ended_booking_time", now).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    } else {
        bookingID := fmt.Sprintf("KMUTT-%s-XX%s", now.Format("20060102-150405"), id)
        newBooking := &models.BookingTimePeriod{
            BookingTimePeriodID: bookingID,
            ItemID:             item.ItemID,
            PhoneNumber:        "system",
            StartedBookingTime: now,
        }
        
        if err := tx.Create(newBooking).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    // Update item availability
    if err := tx.Model(&item).Update("available", newAvailability).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    // Broadcast update through WebSocket
    h.wsHub.BroadcastItemUpdate(ws.ItemAvailabilityUpdate{
        ItemID:    item.ItemID,
        Available: newAvailability,
        Type:      string(item.Type),
    })

    return res.GetSuccess(c, "Item's availability updated", item)
}

func (h *Handler) DeleteItem(c *fiber.Ctx) error {
    id := c.Params("id")
    
    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var item models.Item
    if err := tx.First(&item, id).Error; err != nil {
        tx.Rollback()
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Item", err)
        }
        return res.InternalServerError(c, err)
    }

    // Check for related booking periods
    var bookingsCount int64
    if err := tx.Model(&models.BookingTimePeriod{}).Where("item_id = ?", id).Count(&bookingsCount).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    // Delete related booking periods first if they exist
    if bookingsCount > 0 {
        if err := tx.Where("item_id = ?", id).Delete(&models.BookingTimePeriod{}).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    if err := tx.Delete(&item).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.DeleteSuccess(c)
}

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