package handler

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
	"time"
	"fmt"
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


func (h *Handler) GetTable(c *fiber.Ctx) error {
	id := c.Params("id")
	var table models.Item
	result :=  h.db.Where("type = ?", "table").First(&table, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Table", result.Error)
		}
	}
	return res.GetSuccess(c, "Table found", table)
}
func (h *Handler) GetToilet(c *fiber.Ctx) error {
	id := c.Params("id")
	var toilet models.Item
	result :=  h.db.Where("type = ?", "toilet").First(&toilet, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Toilet", result.Error)
		}
	}
	return res.GetSuccess(c, "Toilet found", toilet)
}


func (h *Handler) CreateTable(c *fiber.Ctx) error {
    var req CreateTableRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

	if req.PositionX < 0 || req.PositionY < 0 || req.Width < 0 || req.Height < 0 || req.RoomID == 0 {
		return res.BadRequest(c, "position_x, position_y, width, height and room_id are required and must be greater than 0")
	}


    table := models.NewTable(
        req.RoomID,
        req.PositionX,
        req.PositionY,
        req.Width,
        req.Height,
    )

    if err := h.db.First(&models.Room{}, req.RoomID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Room", err)
        }
        return res.InternalServerError(c, err)
    }

    if err := h.db.Create(table).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    if err := h.db.Preload("Room").First(table, table.ItemID).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, table)
}

// CreateToilet handles the creation of a new toilet
func (h *Handler) CreateToilet(c *fiber.Ctx) error {
	var req CreateToiletRequest
	if err := c.BodyParser(&req); err != nil {
		return res.BadRequest(c, "Invalid request body")
	}

    if req.BuildingID == 0 || req.Floor == 0 || req.Number == 0 || (req.Gender != "female" && req.Gender != "male") || req.PositionX < 0 || req.PositionY < 0 {
		return res.BadRequest(c, "building_id, floor, number, gender (female or male), position_x, position_y are required and must be greater than 0")
	}

	toilet := models.NewToilet(
		req.BuildingID,
		req.Floor,
		req.Number,
		req.Gender,
		req.PositionX,
		req.PositionY,
	)

	if err := h.db.First(&models.Building{}, req.BuildingID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Building", err)
        }
        return res.InternalServerError(c, err)
    }

    if err := h.db.Create(toilet).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    if err := h.db.Preload("Building").First(toilet, toilet.ItemID).Error; err != nil {
        return res.InternalServerError(c, err)
    }

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
    }

    tx := h.db.Begin()
    if tx.Error != nil {
        return res.InternalServerError(c, tx.Error)
    }

    if item.Available {
        now := time.Now()
        bookingTimePeriod := &models.BookingTimePeriod{
            ItemID:           item.ItemID,
            StartBookingTime: now,
        }

        if err := tx.Create(bookingTimePeriod).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }

        item.Available = false
    } else {
        now := time.Now()
        if err := tx.Model(&models.BookingTimePeriod{}).
            Where("item_id = ? AND ended_booking_time IS NULL", item.ItemID).
            Update("ended_booking_time", now).Error; err != nil {
            tx.Rollback()
            return res.InternalServerError(c, err)
        }

        item.Available = true
    }

    if err := tx.Save(&item).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.GetSuccess(c, "Item's availability updated", item)
}

func (h *Handler) DeleteItem(c *fiber.Ctx) error {
	id := c.Params("id")
	var item models.Item
	result := h.db.First(&item, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Item", result.Error)
		}
	}
	if err := h.db.Delete(&item).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "Item deleted", item)
}

