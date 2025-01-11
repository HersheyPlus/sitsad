package handlers

import (
	"github.com/gofiber/fiber/v2"
	"server/internal/models"
	res "server/internal/utils"
    "fmt"
)

func (h *Handler) GetBookingTimePeriods(c *fiber.Ctx) error {
    var bookings []models.BookingTimePeriod

    result := h.db.
        Joins("LEFT JOIN items ON booking_time_periods.item_id = items.item_id").
        Joins("LEFT JOIN rooms ON items.room_id = rooms.room_id").
        Joins("LEFT JOIN buildings ON items.building_id = buildings.building_id OR rooms.building_id = buildings.building_id").
        Preload("Item").
        Preload("Item.Room").
        Preload("Item.Building").
        Preload("Item.Room.Building").
        Select("DISTINCT booking_time_periods.*").
        Order("booking_time_periods.started_booking_time DESC").
        Find(&bookings)

    if result.Error != nil {
        return res.InternalServerError(c, result.Error)
    }

    // Debug print to check data
    fmt.Printf("Found %d bookings\n", len(bookings))
    if len(bookings) > 0 {
        fmt.Printf("First booking: %+v\n", bookings[0])
        if bookings[0].Item.ItemID != "" {
            fmt.Printf("Item data: %+v\n", bookings[0].Item)
        }
    }

    if len(bookings) == 0 {
        return res.GetSuccess(c, "No booking time periods found", []models.BookingTimePeriod{})
    }

    return res.GetSuccess(c, "List of booking time periods", bookings)
}


func (h *Handler) GetBookingTimePeriodsByItemType(c *fiber.Ctx) error {
    itemType := c.Query("type")
    
    if itemType != "table" && itemType != "toilet" {
        return res.BadRequest(c, "Invalid item type. Must be 'table' or 'toilet'")
    }
    
    var bookings []models.BookingTimePeriod
 
    result := h.db.
        Joins("LEFT JOIN items ON booking_time_periods.item_id = items.item_id").
        Joins("LEFT JOIN rooms ON items.room_id = rooms.room_id").
        Joins("LEFT JOIN buildings ON items.building_id = buildings.building_id OR rooms.building_id = buildings.building_id").
        Preload("Item").
        Preload("Item.Room").
        Preload("Item.Building"). 
        Preload("Item.Room.Building").
        Select("DISTINCT booking_time_periods.*").
        Where("items.type = ?", itemType).
        Order("booking_time_periods.started_booking_time DESC").
        Find(&bookings)
 
    if result.Error != nil {
        return res.InternalServerError(c, result.Error)
    }
 
    if len(bookings) == 0 {
        return res.GetSuccess(c, fmt.Sprintf("No booking time periods found for %s", itemType), []models.BookingTimePeriod{})
    }
 
    return res.GetSuccess(c, fmt.Sprintf("List of booking time periods for %s", itemType), bookings)
 }