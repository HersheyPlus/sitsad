package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	res "server/internal/utils"
)

func (h *Handler) FindAllHistoryItemByRoomId(c *fiber.Ctx) error {
    roomID := c.Params("roomId")
    if roomID == "" {
        return res.BadRequest(c, "Room ID is required")
    }

    var bookingPeriods []models.BookingTimePeriod
    
    err := h.db.Joins("JOIN items ON booking_time_periods.item_id = items.item_id").
           Where("items.room_id = ?", roomID).
           Preload("Item"). 
           Find(&bookingPeriods).Error
    
    if err != nil {
        return res.InternalServerError(c, err)
    }

    return res.GetSuccess(c, "History retrieved", bookingPeriods)
}

func (h *Handler) FindHistoryById(c *fiber.Ctx) error {
    id := c.Params("id")
    if id == "" {
        return res.BadRequest(c, "History ID is required")
    }

    var history models.BookingTimePeriod
    if err := h.db.Preload("Item").First(&history, "booking_time_period_id = ?", id).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.GetSuccess(c, "History found", history)
}

// FindHistoryByItemId gets all booking history for a specific item
func (h *Handler) FindHistoryByItemId(c *fiber.Ctx) error {
    itemID := c.Params("itemId")
    if itemID == "" {
        return res.BadRequest(c, "Item ID is required")
    }

    var histories []models.BookingTimePeriod
    if err := h.db.Preload("Item").Where("item_id = ?", itemID).Find(&histories).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.GetSuccess(c, "Histories retrieved", histories)
}

// CreateHistory creates a new booking history
func (h *Handler) CreateHistory(c *fiber.Ctx) error {
    var history models.BookingTimePeriod
    if err := c.BodyParser(&history); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if err := h.db.Create(&history).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, history)
}

// UpdateHistory updates an existing booking history
func (h *Handler) UpdateHistory(c *fiber.Ctx) error {
    id := c.Params("id")
    if id == "" {
        return res.BadRequest(c, "History ID is required")
    }

    var history models.BookingTimePeriod
    if err := c.BodyParser(&history); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    if err := h.db.Where("booking_time_period_id = ?", id).Updates(&history).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.UpdatedSuccess(c, history)
}

// DeleteHistory deletes a booking history
func (h *Handler) DeleteHistory(c *fiber.Ctx) error {
    id := c.Params("id")
    if id == "" {
        return res.BadRequest(c, "History ID is required")
    }

    if err := h.db.Delete(&models.BookingTimePeriod{}, "booking_time_period_id = ?", id).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.DeleteSuccess(c)
}