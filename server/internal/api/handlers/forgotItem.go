package handlers

import (
	"server/internal/models"
	res "server/internal/utils"
	"time"
	"github.com/gofiber/fiber/v2"
	"server/internal/utils/uuid"
	"gorm.io/gorm"
)

// FindAllForgotItems retrieves all forgot items
func (h *Handler) FindAllForgotItems(c *fiber.Ctx) error {
	var items []models.ForgotItem
	if result := h.db.Find(&items); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.GetSuccess(c, "Forgot items retrieved successfully", items)
}

// FindForgotItemById retrieves a forgot item by ID
func (h *Handler) FindForgotItemById(c *fiber.Ctx) error {
	id := c.Params("id")
	var item models.ForgotItem
	
	if result := h.db.First(&item, "forgot_item_id = ?", id); result.Error != nil {
		return res.NotFound(c, "Forgot item", result.Error)
	}
	return res.GetSuccess(c, "Forgot item retrieved successfully", item)
}

// FindForgotItemsByDateRange retrieves forgot items within a date range
func (h *Handler) FindForgotItemsByDateRange(c *fiber.Ctx) error {
	startTime := c.Query("startTime")
	endTime := c.Query("endTime")
	
	startTimestamp, err := time.Parse(time.RFC3339, startTime)
	if err != nil {
		return res.BadRequest(c, "Invalid start time format")
	}
	
	endTimestamp, err := time.Parse(time.RFC3339, endTime)
	if err != nil {
		return res.BadRequest(c, "Invalid end time format")
	}
	
	var items []models.ForgotItem
	if result := h.db.Where("date BETWEEN ? AND ?", startTimestamp, endTimestamp).Find(&items); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.GetSuccess(c, "Forgot items retrieved successfully", items)
}

// CreateForgotItem creates a new forgot item
func (h *Handler) CreateForgotItem(c *fiber.Ctx) error {
    var req CreateForgotItemRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

    // Validate required fields
	if req.ImageURL == "" || req.TableID == "" || req.BuildingName == "" || req.RoomName == "" {
        return res.BadRequest(c, "image_url, table_id, building_name, room_name are required")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Check if table exists
    var table models.Item
    if err := tx.Where("item_id = ? AND type = ?", req.TableID, models.ItemTypeTable).First(&table).Error; err != nil {
        tx.Rollback()
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Table", err)
        }
        return res.InternalServerError(c, err)
    }

    forgotItem := models.NewForgotItem(
        uuid.GenerateUUID(),
        req.ImageURL,
        req.Date,
        req.TableID,
        req.BuildingName,
        req.RoomName,
    )

    if err := tx.Create(forgotItem).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    // Fetch the created item with relationships
    if err := tx.Preload("Table").First(forgotItem).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, forgotItem)
}
// UpdateForgotItem updates an existing forgot item
func (h *Handler) UpdateForgotItem(c *fiber.Ctx) error {
	id := c.Params("id")
	item := new(models.ForgotItem)
	
	// Check if item exists
	var existingItem models.ForgotItem
	if result := h.db.First(&existingItem, "forgot_item_id = ?", id); result.Error != nil {
		return res.NotFound(c, "Forgot item", result.Error)
	}
	
	if err := c.BodyParser(item); err != nil {
		return res.BadRequest(c, "Invalid request body")
	}
	
	if result := h.db.Model(&existingItem).Updates(item); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.UpdatedSuccess(c, item)
}

// DeleteForgotItem deletes a forgot item
func (h *Handler) DeleteForgotItem(c *fiber.Ctx) error {
	id := c.Params("id")
	
	// Check if item exists
	var item models.ForgotItem
	if result := h.db.First(&item, "forgot_item_id = ?", id); result.Error != nil {
		return res.NotFound(c, "Forgot item", result.Error)
	}
	
	if result := h.db.Delete(&item); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.DeleteSuccess(c)
}