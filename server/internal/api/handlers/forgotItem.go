package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"server/internal/models"
	res "server/internal/utils"
	"server/internal/utils/uuid"
	"time"

	"github.com/gofiber/fiber/v2"
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

    // Parse JSON body
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request format")
    }

    // Set default date if not provided
    if req.Date.IsZero() {
        req.Date = time.Now()
    }

    // Validate required fields
    if req.TableID == "" || req.BuildingName == "" || req.RoomName == "" {
        return res.BadRequest(c, "table_id, building_name, and room_name are required")
    }

    // Initialize filename
    var filename string

    // Handle optional file upload
    if file, err := c.FormFile("image"); err == nil {
        // Validate file type
        ext := filepath.Ext(file.Filename)
        allowedExt := map[string]bool{".jpg": true, ".jpeg": true, ".png": true}
        if !allowedExt[ext] {
            return res.BadRequest(c, "Only .jpg, .jpeg, and .png files are allowed")
        }

        // Generate unique filename
        filename = fmt.Sprintf("forgot-items/%s%s", time.Now().Format("20060102150405"), ext)
        uploadPath := fmt.Sprintf("uploads/%s", filename)

        // Create directory if it doesn't exist
        if err := os.MkdirAll("uploads/forgot-items", 0755); err != nil {
            return res.InternalServerError(c, fmt.Errorf("failed to create upload directory: %v", err))
        }

        // Save the file
        if err := c.SaveFile(file, uploadPath); err != nil {
            return res.InternalServerError(c, fmt.Errorf("failed to save file: %v", err))
        }
    }

    // Start database transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            if filename != "" {
                os.Remove(fmt.Sprintf("uploads/%s", filename))
            }
        }
    }()

    // Check if table exists
    var table models.Item
    if err := tx.Where("item_id = ? AND type = ?", req.TableID, models.ItemTypeTable).First(&table).Error; err != nil {
        tx.Rollback()
        if filename != "" {
            os.Remove(fmt.Sprintf("uploads/%s", filename))
        }
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Table not found", err)
        }
        return res.InternalServerError(c, err)
    }

    // Create forgot item
    forgotItem := models.NewForgotItem(
        uuid.GenerateUUID(),
        filename,
        req.Date,
        req.TableID,
        req.BuildingName,
        req.RoomName,
    )

    // Save to database
    if err := tx.Create(forgotItem).Error; err != nil {
        tx.Rollback()
        if filename != "" {
            os.Remove(fmt.Sprintf("uploads/%s", filename))
        }
        return res.InternalServerError(c, err)
    }

    // Load relationships
    if err := tx.Preload("Table").First(forgotItem).Error; err != nil {
        tx.Rollback()
        if filename != "" {
            os.Remove(fmt.Sprintf("uploads/%s", filename))
        }
        return res.InternalServerError(c, err)
    }

    // Commit transaction
    if err := tx.Commit().Error; err != nil {
        if filename != "" {
            os.Remove(fmt.Sprintf("uploads/%s", filename))
        }
        return res.InternalServerError(c, err)
    }

    // Add full URL to response if image was uploaded
    if filename != "" {
        forgotItem.ImageURL = fmt.Sprintf("/uploads/%s", forgotItem.ImageURL)
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
