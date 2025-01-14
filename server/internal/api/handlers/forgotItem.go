package handlers

import (
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"server/internal/models"
	res "server/internal/utils"
	"server/internal/utils/uuid"
	"strings"
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

	// Check content type
	contentType := c.Get("Content-Type")
	isJSON := strings.Contains(contentType, "application/json")

	if isJSON {
		if err := c.BodyParser(&req); err != nil {
			return res.BadRequest(c, "Invalid JSON format")
		}
	} else {
		// Handle form data
		req = CreateForgotItemRequest{
			TableID:      c.FormValue("table_id"),
			BuildingName: c.FormValue("building_name"),
			RoomName:     c.FormValue("room_name"),
		}

		// Parse date from form
		if dateStr := c.FormValue("date"); dateStr != "" {
			parsedDate, err := time.Parse(time.RFC3339, dateStr)
			if err != nil {
				return res.BadRequest(c, "Invalid date format. Use RFC3339 format")
			}
			req.Date = parsedDate
		}
	}

	// Set default date if not provided
	if req.Date.IsZero() {
		req.Date = time.Now()
	}

	log.Printf("📋 Request values - Table ID: %s, Building: %s, Room: %s",
		req.TableID, req.BuildingName, req.RoomName)

	// Validate required fields
	if req.TableID == "" || req.BuildingName == "" || req.RoomName == "" {
		return res.BadRequest(c, "table_id, building_name, and room_name are required")
	}

	// Handle file upload
	var file *multipart.FileHeader
	var err error

	if isJSON {
		// For JSON requests, expect file in a subsequent request or handle base64
		// You might need to modify this based on your frontend implementation
		return res.BadRequest(c, "File upload not supported in JSON format. Please use multipart/form-data")
	} else {
		file, err = c.FormFile("image")
		if err != nil {
			return res.BadRequest(c, "Image file is required")
		}
	}

	log.Printf("📁 Received file: %s, Size: %d", file.Filename, file.Size)

	// Validate file type
	ext := filepath.Ext(file.Filename)
	allowedExt := map[string]bool{".jpg": true, ".jpeg": true, ".png": true}
	if !allowedExt[ext] {
		log.Printf("❌ Invalid file type: %s", ext)
		return res.BadRequest(c, "Only .jpg, .jpeg, and .png files are allowed")
	}

	// Generate unique filename
	filename := fmt.Sprintf("forgot-items/%s%s", time.Now().Format("20060102150405"), ext)
	uploadPath := fmt.Sprintf("uploads/%s", filename)

	// Create uploads/forgot-items directory if it doesn't exist
	if err := os.MkdirAll("uploads/forgot-items", 0755); err != nil {
		log.Printf("❌ Error creating directory: %v", err)
		return res.InternalServerError(c, fmt.Errorf("failed to create upload directory: %v", err))
	}

	// Save the file
	if err := c.SaveFile(file, uploadPath); err != nil {
		log.Printf("❌ Error saving file: %v", err)
		return res.InternalServerError(c, fmt.Errorf("failed to save file: %v", err))
	}

	// Database transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			os.Remove(uploadPath)
		}
	}()

	// Check if table exists
	var table models.Item
	if err := tx.Where("item_id = ? AND type = ?", req.TableID, models.ItemTypeTable).First(&table).Error; err != nil {
		tx.Rollback()
		os.Remove(uploadPath)
		if err == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Table not found", err)
		}
		return res.InternalServerError(c, err)
	}

	forgotItem := models.NewForgotItem(
		uuid.GenerateUUID(),
		filename,
		req.Date,
		req.TableID,
		req.BuildingName,
		req.RoomName,
	)

	if err := tx.Create(forgotItem).Error; err != nil {
		tx.Rollback()
		os.Remove(uploadPath)
		return res.InternalServerError(c, err)
	}

	if err := tx.Preload("Table").First(forgotItem).Error; err != nil {
		tx.Rollback()
		os.Remove(uploadPath)
		return res.InternalServerError(c, err)
	}

	if err := tx.Commit().Error; err != nil {
		os.Remove(uploadPath)
		return res.InternalServerError(c, err)
	}

	forgotItem.ImageURL = fmt.Sprintf("/uploads/%s", forgotItem.ImageURL)
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
