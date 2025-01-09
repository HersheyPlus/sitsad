package handler

import (
	"server/internal/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	res "server/internal/utils"
)


func (h *Handler) GetListItems(c *fiber.Ctx) error {
	var items []model.Item
	if err := h.db.Find(&items).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "List of items", items)
}

func (h *Handler) GetListTables(c *fiber.Ctx) error {
	var tables []model.Item
	if err := h.db.Where("type = ?", "table").Find(&tables).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "List of toilets", tables)
}

func (h *Handler) GetListToilets(c *fiber.Ctx) error {
	var toilets []model.Item
	if err := h.db.Where("type = ?", "toilet").Find(&toilets).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "List of toilets", toilets)
}

func (h *Handler) GetTable(c *fiber.Ctx) error {
	id := c.Params("id")
	var table model.Item
	result :=  h.db.Where("type = ?", "table").First(&table, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Table", result.Error)
		}
	}
	return res.GetSuccess(c, "Table found", table)
}
func (h *Handler) GetToilet(c *fiber.Ctx) error {
	id := c.Params("id")
	var toilet model.Item
	result :=  h.db.Where("type = ?", "toilet").First(&toilet, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Toilet", result.Error)
		}
	}
	return res.GetSuccess(c, "Toilet found", toilet)
}


func (h *Handler) CreateTable(c *fiber.Ctx) error {
    var req CreateTableRequest
    if err := c.BodyParser(&req); err != nil {
        return res.BadRequest(c, "Invalid request body")
    }

	if req.PositionX < 0 || req.PositionY < 0 || req.Width < 0 || req.Height < 0 || req.RoomID == 0 {
		return res.BadRequest(c, "position_x, position_y, width, height and room_id are required and must be greater than 0")
	}


    table := model.NewTable(
        req.RoomID,
        req.PositionX,
        req.PositionY,
        req.Width,
        req.Height,
    )

    if err := h.db.First(&model.Room{}, req.RoomID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Room", err)
        }
        return res.InternalServerError(c, err)
    }

    if err := h.db.Create(table).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    if err := h.db.Preload("Room").First(table, table.ItemID).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, table)
}

// CreateToilet handles the creation of a new toilet
func (h *Handler) CreateToilet(c *fiber.Ctx) error {
	var req CreateToiletRequest
	if err := c.BodyParser(&req); err != nil {
		return res.BadRequest(c, "Invalid request body")
	}

    if req.BuildingID == 0 || req.Floor == 0 || req.Number == 0 || (req.Gender != "female" && req.Gender != "male") || req.PositionX < 0 || req.PositionY < 0 {
		return res.BadRequest(c, "building_id, floor, number, gender (female or male), position_x, position_y are required and must be greater than 0")
	}

	toilet := model.NewToilet(
		req.BuildingID,
		req.Floor,
		req.Number,
		req.Gender,
		req.PositionX,
		req.PositionY,
	)

	if err := h.db.First(&model.Building{}, req.BuildingID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return res.NotFound(c, "Building", err)
        }
        return res.InternalServerError(c, err)
    }

    if err := h.db.Create(toilet).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    if err := h.db.Preload("Building").First(toilet, toilet.ItemID).Error; err != nil {
        return res.InternalServerError(c, err)
    }

    return res.CreatedSuccess(c, toilet)

}

func (h *Handler) UpdateItemAvailable(c *fiber.Ctx) error {
	id := c.Params("id")
	var item model.Item
	result := h.db.First(&item, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Item", result.Error)
		}
	}
	if item.Available {
		item.Available = false
	} else {
		item.Available = true
	}

	if err := h.db.Save(&item).Error; err != nil {
		return res.InternalServerError(c, err)
	}

	return res.GetSuccess(c, "Item's availability updated", item)
}

func (h *Handler) DeleteItem(c *fiber.Ctx) error {
	id := c.Params("id")
	var item model.Item
	result := h.db.First(&item, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return res.NotFound(c, "Item", result.Error)
		}
	}
	if err := h.db.Delete(&item).Error; err != nil {
		return res.InternalServerError(c, err)
	}
	return res.GetSuccess(c, "Item deleted", item)
}

