package handler


import (
	"github.com/gofiber/fiber/v2"
	"server/internal/models"
	res "server/internal/utils"
	"gorm.io/gorm"
)

func (h *Handler) GetListBuildings(c *fiber.Ctx) error {
	var buildings []models.Building
	if err := h.db.Find(&buildings).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "List of buildings", buildings)
}

func (h *Handler) GetBuilding(c *fiber.Ctx) error {
	id := c.Params("id")
	var building models.Building
	result := h.db.First(&building, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Building", result.Error)
		}
	}
	return res.GetSuccess(c, "Building found", building)
}

func (h *Handler) CreateBuilding(c *fiber.Ctx) error {
	var building models.Building
	if err := c.BodyParser(&building); err != nil {
		return res.BadRequest(c, err.Error())
	}
	if (building.BuildingName == "") {
		return res.BadRequest(c, "building_name is required")
	}
	if err := h.db.Create(&building).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.CreatedSuccess(c, building)
}

func (h *Handler) UpdateBuilding(c *fiber.Ctx) error {
	id := c.Params("id")
	var building models.Building
	result := h.db.First(&building, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Building", result.Error)
		}
	}
	if err := c.BodyParser(&building); err != nil {
		return res.BadRequest(c, err.Error())
	}

	if err := h.db.Save(&building).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.UpdatedSuccess(c, building)
}

func (h *Handler) DeleteBuilding(c *fiber.Ctx) error {
	id := c.Params("id")
	var building models.Building
	result := h.db.First(&building, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Building", result.Error)
		}
	}
	if err := h.db.Delete(&building).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.DeleteSuccess(c)
}

func (h *Handler) ExistingBuilding(c *fiber.Ctx, buildingId int) bool {
	var building models.Building
	result := h.db.First(&building, buildingId)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return false
		}
	}
	return true
}