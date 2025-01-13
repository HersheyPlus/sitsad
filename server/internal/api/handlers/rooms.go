package handlers

import (
	"server/internal/models"
	res "server/internal/utils"
	"server/internal/utils/uuid"
	"time"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"log"
	"os"
	"path/filepath"
	"fmt"
)

// Find all rooms
func (h *Handler) FindAllRooms(c *fiber.Ctx) error {
	var rooms []models.Room
	if err := h.db.
		Preload("Building").
		Find(&rooms).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	var response []RoomResponse
	for _, room := range rooms {
		resp := RoomResponse{
			RoomID:      room.RoomID,
			BuildingID:  room.BuildingID,
			RoomName:    room.RoomName,
			Description: room.Description,
			ImageURL:    room.ImageURL,
		}
		response = append(response, resp)
	}

	if response == nil {
		response = make([]RoomResponse, 0)
	}

	return res.GetSuccess(c, "Rooms retrieved", response)
}

// Find all rooms
func (h *Handler) FindRoomsBySearchParams(c *fiber.Ctx) error {
	keyword := c.Query("keyword")
	itemType := c.Query("itemType")
	buildingId := c.Query("buildingId")

	if buildingId == "" {
		return res.BadRequest(c, "buildingId is required")
	}
	if itemType == "" {
		return res.BadRequest(c, "itemType is required")
	}

	var rooms []models.Room

	query := h.db.
		Debug().
		Table("rooms").
		Select("DISTINCT rooms.*"). // Added DISTINCT to prevent duplicates
		Joins("JOIN buildings ON buildings.building_id = rooms.building_id").
		Joins("JOIN items ON items.room_id = rooms.room_id").
		Where("items.type = ? AND buildings.building_id = ?", itemType, buildingId)

	if keyword != "" {
		query = query.Where("(rooms.room_id LIKE ? OR rooms.room_name LIKE ?)",
			"%"+keyword+"%", "%"+keyword+"%")
	}

	// Execute query with preloads
	if err := query.
		Preload("Building").
		Preload("Items", "type = ?", itemType).
		Group("rooms.room_id").
		Find(&rooms).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	// Convert to response format
	var response []RoomResponse
	for _, room := range rooms {
		resp := RoomResponse{
			RoomID:      room.RoomID,
			BuildingID:  room.BuildingID,
			RoomName:    room.RoomName,
			Description: room.Description,
			ImageURL:    room.ImageURL,
		}
		response = append(response, resp)
	}

	if response == nil {
		response = make([]RoomResponse, 0)
	}

	return res.GetSuccess(c, "Rooms retrieved", response)
}

// Find rooms by id
func (h *Handler) FindRoomById(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
	result := h.db.Where("room_id = ?", id).First(&room)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
	}
	return res.GetSuccess(c, "Room found", room)
}

// Create a new room
func (h *Handler) CreateRoom(c *fiber.Ctx) error {
    log.Printf("Received room creation request")
    
    // Get form fields
    buildingID := c.FormValue("building_id")
    roomName := c.FormValue("room_name")
    description := c.FormValue("description")
    
    log.Printf("Form values - Building ID: %s, Room Name: %s", buildingID, roomName)

    // Validate required fields
    if buildingID == "" || roomName == "" {
        log.Printf("Missing required fields")
        return res.BadRequest(c, "building_id and room_name are required")
    }

    // Handle file upload
    file, err := c.FormFile("image")
    if err != nil {
        log.Printf("Error getting form file: %v", err)
        return res.BadRequest(c, "Image file is required")
    }
    log.Printf("Received file: %s, Size: %d", file.Filename, file.Size)

    // Generate unique filename
    ext := filepath.Ext(file.Filename)
    filename := fmt.Sprintf("rooms/%s%s", time.Now().Format("20060102150405"), ext)
    uploadPath := fmt.Sprintf("uploads/%s", filename)
    
    log.Printf("Generated upload path: %s", uploadPath)

    // Create uploads/rooms directory if it doesn't exist
    if err := os.MkdirAll("uploads/rooms", 0755); err != nil {
        log.Printf("Error creating directory: %v", err)
        return res.InternalServerError(c, fmt.Errorf("failed to create upload directory: %v", err))
    }

    // Save the file
    if err := c.SaveFile(file, uploadPath); err != nil {
        log.Printf("Error saving file: %v", err)
        return res.InternalServerError(c, fmt.Errorf("failed to save file: %v", err))
    }
    log.Printf("File saved successfully to: %s", uploadPath)

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            os.Remove(uploadPath)
            log.Printf("Transaction rolled back due to panic: %v", r)
        }
    }()

    // Check if building exists within transaction
    if err := h.ExistingBuilding(tx, c, buildingID); err != nil {
        tx.Rollback()
        os.Remove(uploadPath)
        log.Printf("Building not found: %v", err)
        return res.NotFound(c, "Building", err)
    }

    room := models.NewRoom(
        uuid.GenerateUUID(),
        buildingID,
        roomName,
        description,
        filename, // Store relative path
    )

    if err := tx.Create(&room).Error; err != nil {
        tx.Rollback()
        os.Remove(uploadPath)
        log.Printf("Error creating room record: %v", err)
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        os.Remove(uploadPath)
        log.Printf("Error committing transaction: %v", err)
        return res.InternalServerError(c, err)
    }

    log.Printf("Room created successfully with ID: %s", room.RoomID)
    
    // Add full URL to response
    room.ImageURL = fmt.Sprintf("/uploads/%s", room.ImageURL)
    return res.CreatedSuccess(c, room)
}

// Update room
func (h *Handler) UpdateRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
	var updateData models.Room

	// Start transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find existing room
	result := tx.Where("room_id = ?", id).First(&room)
	if result.Error != nil {
		tx.Rollback()
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
		return res.InternalServerError(c, result.Error)
	}

	// Store original values
	originalBuildingID := room.BuildingID

	// Parse update data
	if err := c.BodyParser(&updateData); err != nil {
		tx.Rollback()
		return res.BadRequest(c, err.Error())
	}

	// If building ID is provided and different from original, verify it exists
	if updateData.BuildingID != "" && updateData.BuildingID != originalBuildingID {
		var building models.Building
		if err := tx.Where("building_id = ?", updateData.BuildingID).First(&building).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				return res.BadRequest(c, "New building does not exist")
			}
			return res.InternalServerError(c, err)
		}
	} else {
		// Keep the original building ID if not provided
		updateData.BuildingID = originalBuildingID
	}

	// Update only non-empty fields
	updates := map[string]interface{}{
		"building_id": updateData.BuildingID, // This will be the original ID if not provided
		"updated_at":  time.Now(),
	}

	if updateData.RoomName != "" {
		updates["room_name"] = updateData.RoomName
	}
	if updateData.Description != "" {
		updates["description"] = updateData.Description
	}
	if updateData.ImageURL != "" {
		updates["image_url"] = updateData.ImageURL
	}

	if err := tx.Model(&room).Updates(updates).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}

	if err := tx.Commit().Error; err != nil {
		return res.InternalServerError(c, err)
	}

	// Fetch the updated room with relationships
	var updatedRoom models.Room
	if err := h.db.Preload("Building").Where("room_id = ?", id).First(&updatedRoom).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	return res.UpdatedSuccess(c, updatedRoom)
}

// Delete room
func (h *Handler) DeleteRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room

	// Start transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	result := tx.Where("room_id = ?", id).First(&room)
	if result.Error != nil {
		tx.Rollback()
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
		return res.InternalServerError(c, result.Error)
	}

	// Check for related items before deletion
	var relatedItems int64
	if err := tx.Model(&models.Item{}).Where("room_id = ?", id).Count(&relatedItems).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}

	if relatedItems > 0 {
		tx.Rollback()
		return res.BadRequest(c, "Cannot delete room with existing items")
	}

	if err := tx.Delete(&room).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}

	if err := tx.Commit().Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.DeleteSuccess(c)
}

// ExistingRoom checks if a room exists
func (h *Handler) ExistingRoom(tx *gorm.DB, c *fiber.Ctx, roomId string) error {
	var room models.Room
	if err := tx.Where("room_id = ?", roomId).First(&room).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return err
		}
	}
	return nil
}

func (h *Handler) FindAllRoomByBuildingId(c *fiber.Ctx) error {
	buildingId := c.Params("buildingId")
	if buildingId == "" {
		return res.BadRequest(c, "buildingId is required")
	}

	var rooms []models.Room
	if err := h.db.
		Preload("Building").
		Where("building_id = ?", buildingId).
		Find(&rooms).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	var response []RoomResponse
	for _, room := range rooms {
		resp := RoomResponse{
			RoomID:      room.RoomID,
			BuildingID:  room.BuildingID,
			RoomName:    room.RoomName,
			Description: room.Description,
			ImageURL:    room.ImageURL,
		}
		response = append(response, resp)
	}

	if response == nil {
		response = make([]RoomResponse, 0)
	}

	return res.GetSuccess(c, "Rooms retrieved successfully", response)
}
