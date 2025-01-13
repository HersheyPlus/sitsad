package handlers

import (
	"server/internal/models"
	res "server/internal/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"server/internal/utils/uuid"
	"path/filepath"
	"fmt"
	"os"
	"time"
)

// Find All Buildings
func (h *Handler) FindAllBuildings(c *fiber.Ctx) error {
	var buildings []models.Building
	query := h.db.Distinct().Table("buildings").Select("buildings.*")

	if err := query.Find(&buildings).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	return res.GetSuccess(c, "Buildings retrieved", buildings)
}

// Find All Buildings
func (h *Handler) FindAllBuildingByItemType(c *fiber.Ctx) error {
	itemType := c.Query("itemType")
	keyword := c.Query("keyword")

	var buildings []models.Building
	query := h.db.Distinct().Table("buildings").Select("buildings.*")

	// Base join for all cases since all items are now connected through rooms
	query = query.
		Joins("INNER JOIN rooms ON buildings.building_id = rooms.building_id").
		Joins("INNER JOIN items ON rooms.room_id = items.room_id")

	// Handle item type filtering
	switch itemType {
	case "": // No itemType specified - return all buildings with any type of items
		// No additional type filter needed

	case "table", "toilet":
		query = query.Where("items.type = ?", itemType)

	default:
		return res.BadRequest(c, "invalid itemType. Must be 'table' or 'toilet'")
	}

	// Add keyword search if provided
	if keyword != "" {
		query = query.Where("(buildings.building_name LIKE ? OR buildings.description LIKE ?)",
			"%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Find(&buildings).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	return res.GetSuccess(c, "Buildings retrieved", buildings)
}

// Find Building By ID
func (h *Handler) FindBuildingById(c *fiber.Ctx) error {
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

// Create
func (h *Handler) CreateBuilding(c *fiber.Ctx) error {
    // Get form fields from multipart form
    buildingName := c.FormValue("building_name")
    description := c.FormValue("description")

    // Validate required fields
    if buildingName == "" || description == "" {
        return res.BadRequest(c, "building_name and description are required")
    }

    // Handle file upload
    file, err := c.FormFile("image")
    if err != nil {
        return res.BadRequest(c, "Image file is required")
    }

    // Generate unique filename
    ext := filepath.Ext(file.Filename)
    filename := fmt.Sprintf("buildings/%s%s", time.Now().Format("20060102150405"), ext)
    uploadPath := fmt.Sprintf("uploads/%s", filename)

    // Create uploads/buildings directory if it doesn't exist
    if err := os.MkdirAll("uploads/buildings", 0755); err != nil {
        return res.InternalServerError(c, fmt.Errorf("failed to create upload directory: %v", err))
    }

    // Save the file
    if err := c.SaveFile(file, uploadPath); err != nil {
        return res.InternalServerError(c, fmt.Errorf("failed to save file: %v", err))
    }

    // Start transaction
    tx := h.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            // Clean up uploaded file if transaction fails
            os.Remove(uploadPath)
        }
    }()

    building := models.NewBuilding(
        uuid.GenerateUUID(),
        buildingName,
        description,
        filename, // Store relative path in database
    )

    if err := tx.Create(&building).Error; err != nil {
        tx.Rollback()
        // Clean up uploaded file
        os.Remove(uploadPath)
        return res.InternalServerError(c, err)
    }

    if err := tx.Commit().Error; err != nil {
        // Clean up uploaded file
        os.Remove(uploadPath)
        return res.InternalServerError(c, err)
    }

    // Add full URL to response
    building.ImageURL = fmt.Sprintf("/uploads/%s", building.ImageURL)
    return res.CreatedSuccess(c, building)
}
// Update
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

// Delete
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

// Existing Building
func (h *Handler) ExistingBuilding(tx *gorm.DB, c *fiber.Ctx, buildingId string) error {
	var building models.Building
	if err := tx.Where("building_id = ?", buildingId).First(&building).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return err
		}
	}
	return nil
}
