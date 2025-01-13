package handlers

import (
	"server/internal/models"
	res "server/internal/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

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
		Debug(). // To see the SQL query being generated
		Table("rooms").
		Select("rooms.*").
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

	if rooms == nil {
		rooms = make([]models.Room, 0)
	}

	return res.GetSuccess(c, "Rooms retrieved", rooms)
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
	var req CreateRoomRequest
	if err := c.BodyParser(&req); err != nil {
		return res.BadRequest(c, err.Error())
	}

	// Manual validation
	if req.RoomID == "" || req.RoomName == "" || req.BuildingID == "" || req.Floor == 0 || req.ImageURL == "" {
		return res.BadRequest(c, "room_id, room_name, floor, building_id, image_url are required")
	}

	// Create room model from request
	// Start transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if building exists within transaction
	if err := h.ExistingBuilding(tx, c, req.BuildingID); err != nil {
		tx.Rollback()
		return res.NotFound(c, "Building", err)
	}

	room := models.NewRoom(
		req.RoomID,
		req.BuildingID,
		req.RoomName,
		req.Description,
		req.ImageURL,
		req.Floor,
	)

	if err := tx.Create(&room).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}

	if err := tx.Commit().Error; err != nil {
		return res.InternalServerError(c, err)
	}
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
	if updateData.Floor != 0 {
		updates["floor"] = updateData.Floor
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
