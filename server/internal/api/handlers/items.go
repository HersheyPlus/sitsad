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

// Delete table or toilet
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
    if err := tx.Where("item_id = ?", id).First(&item).Error; err != nil {
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

    // Delete the item
    if err := tx.Delete(&item).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.DeleteSuccess(c)
}

