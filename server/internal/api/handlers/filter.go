package handlers

import (
	"github.com/gofiber/fiber/v2"
	"server/internal/models"
	res "server/internal/utils"
	// "gorm.io/gorm"
	"strconv"
	"fmt"
)

// find building by item type

func (h *Handler) FindBuildingByItemType(c *fiber.Ctx) error {
    queries := c.Queries()
    buildingIDStr := queries["building_id"]
    itemType := queries["type"]

    // Convert buildingID to integer
    buildingID, _ := strconv.Atoi(buildingIDStr)

	var err error
    var items []models.Item

	if itemType == "table" {
        err = h.db.
            Joins("JOIN rooms ON items.room_id = rooms.room_id").
            Where("rooms.building_id = ? AND items.type = ?", buildingID, models.ItemTypeTable).
            Preload("Room").
            Find(&items).Error
    } else if itemType == "toilet" {
        err = h.db.
            Where("building_id = ? AND type = ?", buildingID, models.ItemTypeToilet).
            Find(&items).Error
    } else {
        return res.BadRequest(c, "Invalid item type")
    }

    if err != nil {
        return res.InternalServerError(c, err)
    }

    return res.GetSuccess(c, fmt.Sprintf("List of %ss in building id %d",itemType, buildingID), items)
}

// find all rooms by building id

func (h *Handler) FindRoomsByBuildingID(c *fiber.Ctx) error {
	buildingIDStr := c.Params("building_id")
	buildingID, _ := strconv.Atoi(buildingIDStr)

	var rooms []models.Room
	var building models.Building

	if err := h.db.First(&building, buildingID).Error; err != nil {
		return res.NotFound(c, "Building", err)
	}

	if err := h.db.
		Where("building_id = ?", buildingID).
		Find(&rooms).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	return res.GetSuccess(c, "List of rooms", rooms)
}

// find building and room

// find all items by building id

// find all items by room id (only tables)

