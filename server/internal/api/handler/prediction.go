package handler

import (
	"github.com/gofiber/fiber/v2"
	"server/internal/models"
	res "server/internal/utils"
)

func (h *Handler) GetListBookingTimePeriods(c *fiber.Ctx) error {
    var bookings []models.BookingTimePeriod
    if err := h.db.Preload("Item").
        Preload("Item.Building").
        Preload("Item.Room").
        Find(&bookings).Error; err != nil {
        return res.InternalServerError(c, err)
    }
    
    return res.GetSuccess(c, "List of booking time periods", bookings)
}

func (h *Handler) GetBookingTimePeriodsByItemType(c *fiber.Ctx) error {
    itemType := c.Query("type")
    
    if itemType != "table" && itemType != "toilet" {
        return res.BadRequest(c, "Invalid item type. Must be 'table' or 'toilet'")
    }
    
    var bookings []models.BookingTimePeriod
    
    if err := h.db.
        Joins("JOIN items ON items.item_id = booking_time_periods.item_id").
        Preload("Item").
        Preload("Item.Building").
        Preload("Item.Room").
        Where("items.type = ?", itemType).
        Find(&bookings).Error; err != nil {
        return res.InternalServerError(c, err)
    }
    
    return res.GetSuccess(c, "List of booking time periods", bookings)
}

