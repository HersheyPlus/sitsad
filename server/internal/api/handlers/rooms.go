package handlers

import (
	"server/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
)

func (h *Handler) GetListRooms(c *fiber.Ctx) error {
	var rooms []models.Room
	if err := h.db.Find(&rooms).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "List of rooms", rooms)
}

func (h *Handler) GetRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
	result := h.db.First(&room, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
	}
	return res.GetSuccess(c, "Room found", room)
}

func (h *Handler) CreateRoom(c *fiber.Ctx) error {
    var req CreateRoomRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, err.Error())
    }

    // Manual validation
    if req.RoomID == "" ||req.RoomName == "" || req.BuildingID == 0 || req.Floor == 0 || req.ImageURL == "" {
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

 func (h *Handler) UpdateRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
 
	// Start transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
 
	result := tx.First(&room, id)
	if result.Error != nil {
		tx.Rollback()
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
		return res.InternalServerError(c, result.Error)
	}
 
	if err := c.BodyParser(&room); err != nil {
		tx.Rollback()
		return res.BadRequest(c, err.Error())
	}
 
	// If building ID is changed, verify the new building exists
	if room.BuildingID != 0 {
		var building models.Building
		if err := tx.First(&building, room.BuildingID).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				return res.BadRequest(c, "New building does not exist")
			}
			return res.InternalServerError(c, err)
		}
	}
 
	if err := tx.Save(&room).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}
 
	if err := tx.Commit().Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.UpdatedSuccess(c, room)
 }
 
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
 
	result := tx.First(&room, id)
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

 func (h *Handler) ExistingRoom(tx *gorm.DB, c *fiber.Ctx, roomId string) error {
    var room models.Room
    if err := tx.Where("room_id = ?", roomId).First(&room).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return err
        }
    }
    return nil
}