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
	var room models.Room
	if err := c.BodyParser(&room); err != nil {
		return res.BadRequest(c, err.Error())
	}
	if (room.RoomName == "" || room.BuildingID == 0 || room.Floor == 0 || room.ImageURL == "") {
		return res.BadRequest(c, "room_name, floor, building_id, image_url, are required")
	}

	if (!h.ExistingBuilding(c, room.BuildingID)) {
		return res.BadRequest(c, "Building does not exist")
	}


	if err := h.db.Create(&room).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.CreatedSuccess(c, room)
}

func (h *Handler) UpdateRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
	result := h.db.First(&room, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
	}
	if err := c.BodyParser(&room); err != nil {
		return res.BadRequest(c, err.Error())
	}

	if err := h.db.Save(&room).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.UpdatedSuccess(c, room)
}

func (h *Handler) DeleteRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
	result := h.db.First(&room, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Room", result.Error)
		}
	}
	if err := h.db.Delete(&room).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.DeleteSuccess(c)
}

func (h *Handler) ExistingRoom(c *fiber.Ctx, roomId uint64) bool {
	var room models.Room
	result := h.db.First(&room, roomId)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return false
		}
	}
	return true
}