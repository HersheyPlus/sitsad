package handlers


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
    
    result := h.db.Where("building_id = ?", id).First(&building)
    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Building", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }
    
    return res.GetSuccess(c, "Building found", building)
}

func (h *Handler) CreateBuilding(c *fiber.Ctx) error {
    var req CreateBuildingRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, err.Error())
    }
    if req.BuildingName == "" || req.ImageURL == "" || req.Description == "" || req.BuildingID == "" {
        return res.BadRequest(c, "building_id, building_name, image_url, description are required")
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    building := models.NewBuilding(
        req.BuildingID,
        req.BuildingName,
        req.Description,
        req.ImageURL,
    )

    if err := tx.Create(&building).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }
    return res.CreatedSuccess(c, building)
}

func (h *Handler) UpdateBuilding(c *fiber.Ctx) error {
    id := c.Params("id")
    var building models.Building

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Use Where clause for string ID
    result := tx.Where("building_id = ?", id).First(&building)
    if result.Error != nil {
        tx.Rollback()
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Building", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    // Store the original ID
    originalID := building.BuildingID

    if err := c.BodyParser(&building); err != nil {
        tx.Rollback()
        return res.BadRequest(c, err.Error())
    }

    // Ensure ID doesn't change
    building.BuildingID = originalID

    if err := tx.Save(&building).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }
    return res.UpdatedSuccess(c, building)
}
func (h *Handler) DeleteBuilding(c *fiber.Ctx) error {
    id := c.Params("id")
    var building models.Building

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    result := tx.Where("building_id = ?", id).First(&building)
    if result.Error != nil {
        tx.Rollback()
        if result.Error == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Building", result.Error)
        }
        return res.InternalServerError(c, result.Error)
    }

    // Check for related records before deletion
    var relatedRooms int64
    if err := tx.Model(&models.Room{}).Where("building_id = ?", id).Count(&relatedRooms).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    var relatedItems int64
    if err := tx.Model(&models.Item{}).Where("building_id = ?", id).Count(&relatedItems).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if relatedRooms > 0 || relatedItems > 0 {
        tx.Rollback()
        return res.BadRequest(c, "Cannot delete building with existing rooms or items")
    }

    if err := tx.Delete(&building).Error; err != nil {
        tx.Rollback()
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        return res.InternalServerError(c, err)
    }
    return res.DeleteSuccess(c)
}


func (h *Handler) ExistingBuilding(tx *gorm.DB, c *fiber.Ctx, buildingId string) error {
    var building models.Building
    if err := tx.Where("building_id = ?", buildingId).First(&building).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return err
        }
    }
    return nil
}