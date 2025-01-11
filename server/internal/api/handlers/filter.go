package handlers

import (
	"github.com/gofiber/fiber/v2"
	"server/internal/models"
	res "server/internal/utils"
	"fmt"
    "gorm.io/gorm"
)

// find building by item type

func (h *Handler) FindBuildingByItemType(c *fiber.Ctx) error {
    queries := c.Queries()
    buildingID := queries["building_id"]
    itemType := queries["type"]

    // Validate required parameters
    if buildingID == "" {
        return res.BadRequest(c, "building_id is required")
    }
    if itemType == "" {
        return res.BadRequest(c, "type is required")
    }

    var items []models.Item

    // Verify building exists first
    var building models.Building
    if err := h.db.Where("building_id = ?", buildingID).First(&building).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Building", err)
        }
        return res.InternalServerError(c, err)
    }

    var err error
    if itemType == "table" {
        err = h.db.
            Joins("JOIN rooms ON items.room_id = rooms.room_id").
            Where("rooms.building_id = ? AND items.type = ?", buildingID, models.ItemTypeTable).
            Preload("Room").
            Preload("Room.Building").  // Add building details
            Find(&items).Error
    } else if itemType == "toilet" {
        err = h.db.
            Where("building_id = ? AND type = ?", buildingID, models.ItemTypeToilet).
            Preload("Building").  // Add building details for toilets
            Find(&items).Error
    } else {
        return res.BadRequest(c, "Invalid item type. Must be 'table' or 'toilet'")
    }

    if err != nil {
        return res.InternalServerError(c, err)
    }

    if len(items) == 0 {
        return res.NotFound(c, fmt.Sprintf("No %ss found in building %s", itemType, buildingID), nil)
    }

    return res.GetSuccess(c, fmt.Sprintf("List of %ss in building id %s", itemType, buildingID), items)
}
// find all rooms by building id

func (h *Handler) FindRoomsByBuildingID(c *fiber.Ctx) error {
    buildingID := c.Query("building_id")
    
    if buildingID == "" {
        return res.BadRequest(c, "building_id is required")
    }

    var rooms []models.Room
    
    if err := h.db.
        Where("building_id = ?", buildingID).
        Preload("Building").  // Add this if you want building details
        Find(&rooms).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    if len(rooms) == 0 {
        return res.NotFound(c, fmt.Sprintf("No rooms found for building %s", buildingID), nil)
    }

    return res.GetSuccess(c, fmt.Sprintf("List of rooms (building id %s)", buildingID), rooms)
}

// find building and room

// find all items by building id

// find all items by room id (only tables)

