package handlers

import (
	"server/internal/models"
	res "server/internal/utils"
	"github.com/gofiber/fiber/v2"
)

// FindAllDevices retrieves all devices
func (h *Handler) FindAllDevices(c *fiber.Ctx) error {
	var devices []models.Device
	if result := h.db.Find(&devices); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.GetSuccess(c, "Devices retrieved successfully", devices)
}

// FindDeviceById retrieves a device by ID
func (h *Handler) FindDeviceById(c *fiber.Ctx) error {
	id := c.Params("id")
	var device models.Device

	if result := h.db.First(&device, "device_id = ?", id); result.Error != nil {
		return res.NotFound(c, "Device", result.Error)
	}
	return res.GetSuccess(c, "Device retrieved successfully", device)
}

// FindDevicesByKeyword searches devices by name
func (h *Handler) FindDevicesByKeyword(c *fiber.Ctx) error {
	keyword := c.Query("keyword")
	var devices []models.Device

	query := h.db
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	if result := query.Find(&devices); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.GetSuccess(c, "Devices found successfully", devices)
}

// FindDeviceByTopic retrieves a device by topic
func (h *Handler) FindDeviceByTopic(c *fiber.Ctx) error {
	topic := c.Params("topic")
	var device models.Device

	if result := h.db.First(&device, "topic = ?", topic); result.Error != nil {
		return res.NotFound(c, "Device", result.Error)
	}
	return res.GetSuccess(c, "Device retrieved successfully", device)
}

// CreateDevice creates a new device
func (h *Handler) CreateDevice(c *fiber.Ctx) error {
	var req CreateDeviceRequest
	if err := c.BodyParser(&req); err != nil {
		return res.BadRequest(c, "Invalid request body")
	}

	// Validate required fields
	if req.Name == "" || req.Topic == "" || req.BuildingID == "" || req.RoomID == "" || req.DeviceID == ""{
		return res.BadRequest(c, "name, topic, building_id, room_id, device_id are required")
	}
	
	if req.WebUrl == "" {
		req.WebUrl = ""
	}

	// Convert type string to DeviceType
	if string(req.Type) != string(models.DeviceTypeCamera) {
		return res.BadRequest(c, "Invalid device type")
	}

	// Start transaction
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if building exists
	if err := h.ExistingBuilding(tx, c, req.BuildingID); err != nil {
		tx.Rollback()
		return res.NotFound(c, "Building", err)
	}

	// Check if room exists
	if err := h.ExistingRoom(tx, c, req.RoomID); err != nil {
		tx.Rollback()
		return res.NotFound(c, "Room", err)
	}

	device := models.NewDevice(
		req.DeviceID,
		req.Name,
		req.Topic,
		req.BuildingID,
		req.RoomID,
		req.Type, // Using the constant directly
		req.WebUrl,
	)

	if err := tx.Create(device).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}

	// Fetch the created device with relationships
	if err := tx.Preload("Building").Preload("Room").First(device).Error; err != nil {
		tx.Rollback()
		return res.InternalServerError(c, err)
	}

	if err := tx.Commit().Error; err != nil {
		return res.InternalServerError(c, err)
	}

	return res.CreatedSuccess(c, device)
}

// UpdateDevice updates an existing device
func (h *Handler) UpdateDevice(c *fiber.Ctx) error {
	id := c.Params("id")
	device := new(models.Device)

	// Check if device exists
	var existingDevice models.Device
	if result := h.db.First(&existingDevice, "device_id = ?", id); result.Error != nil {
		return res.NotFound(c, "Device", result.Error)
	}

	if err := c.BodyParser(device); err != nil {
		return res.BadRequest(c, "Invalid request body")
	}

	if result := h.db.Model(&existingDevice).Updates(device); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.UpdatedSuccess(c, device)
}

// DeleteDevice deletes a device
func (h *Handler) DeleteDevice(c *fiber.Ctx) error {
	id := c.Params("id")

	// Check if device exists
	var device models.Device
	if result := h.db.First(&device, "device_id = ?", id); result.Error != nil {
		return res.NotFound(c, "Device", result.Error)
	}

	if result := h.db.Delete(&device); result.Error != nil {
		return res.InternalServerError(c, result.Error)
	}
	return res.DeleteSuccess(c)
}
