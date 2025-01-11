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
	if itemType == "" {
		if err := h.db.Find(&items).Error; err != nil {
			return res.InternalServerError(c, err)
		}
		return res.GetSuccess(c, "List of items", items)
	}

    if itemType != "table" && itemType != "toilet" {
        return res.BadRequest(c, "Invalid item type")
    }
	if err := h.db.Where("type = ?", itemType).Find(&items).Error; err != nil {
		return res.InternalServerError(c, err)
	}


	return res.GetSuccess(c, fmt.Sprintf("List of items (%s)",itemType), items)
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

    if req.BuildingID == 0 || req.Floor == 0 || req.Name == "" || (req.Gender != "female" && req.Gender != "male") || req.PositionX < 0 || req.PositionY < 0 {
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
    
    var item models.Item
    result := h.db.First(&item, id)
    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Item", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    tx := h.db.Begin()
    if tx.Error != nil {
        return res.InternalServerError(c, tx.Error)
    }

    // Toggle availability
    newAvailability := !item.Available
    
    if !newAvailability {
        // Item becoming unavailable
        now := time.Now()
        bookingTimePeriod := &models.BookingTimePeriod{
            ItemID:           item.ItemID,
            StartedBookingTime: now,
        }

        if err := tx.Create(bookingTimePeriod).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    } else {
        // Item becoming available
        now := time.Now()
        if err := tx.Model(&models.BookingTimePeriod{}).
            Where("item_id = ? AND ended_booking_time IS NULL", item.ItemID).
            Update("ended_booking_time", now).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }
    }

    // Update item availability
    item.Available = newAvailability
    if err := tx.Save(&item).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    // Broadcast update through WebSocket
    h.wsHub.BroadcastItemUpdate(ws.ItemAvailabilityUpdate{
        ItemID:    item.ItemID,
        Available: item.Available,
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