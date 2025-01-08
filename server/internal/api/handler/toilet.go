package handler

import (
	"server/internal/model"
	"github.com/gofiber/fiber/v2"
	"server/internal/api/res"
)


func (h *Handler) HandleGetToilets(c *fiber.Ctx) error {
	toilets := []model.Toilet{}
	err := h.db.Select(&toilets, "SELECT * FROM toilets")
	if err != nil {
        res := res.NewResponse(false, "Failed to fetch buildings", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }
	res := res.NewResponse(true, "Toilets fetched successfully", toilets)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleGetToiletByID(c *fiber.Ctx) error {
	c.Accepts("application/json", "json")
	id := c.Params("id")
	toilet := model.Toilet{}
	err := h.db.Get(&toilet, "SELECT * FROM toilets WHERE id = ?", id)

	if err != nil {
		res := res.NewResponse(false, "Toilet not found", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Toilet fetched successfully", toilet)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleCreateToilet(c *fiber.Ctx) error {
	toilet := model.Toilet{}
	if err := c.BodyParser(&toilet); err != nil {
		res := res.NewResponse(false, "Invalid request", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}
	if toilet.Floor == 0 || toilet.BuildingID == 0 || toilet.ToiletNumber == 0 || toilet.Gender == "" {
		res := res.NewResponse(false, "Invalid request, required: floor, building_id, toilet_number, gender", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	if toilet.Gender != "female" && toilet.Gender != "male" {
		res := res.NewResponse(false, "Gender must be female or male", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	var existingBuilding model.Building
	err := h.db.Get(&existingBuilding, "SELECT * FROM buildings WHERE id = ?", toilet.BuildingID)
	if err != nil {
		res := res.NewResponse(false, "Building does not exist", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	insertQuery := "INSERT INTO toilets (floor, building_id, toilet_number, gender, is_free) VALUES (?, ?, ?, ?, 0)"
	_, err = h.db.Exec(insertQuery, toilet.Floor, toilet.BuildingID, toilet.ToiletNumber, toilet.Gender)

	if err != nil {
		res := res.NewResponse(false, "Failed to create toilet", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Toilet created successfully", nil)
	return c.Status(fiber.StatusCreated).JSON(res)
}

func (h *Handler) HandlerDeleteToilet(c *fiber.Ctx) error {
	id := c.Params("id")
	deleteQuery := "DELETE FROM toilets WHERE id = ?"
	_, err := h.db.Exec(deleteQuery, id)
	if err != nil {
		res := res.NewResponse(false, "Failed to delete toilet", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Toilet deleted successfully", nil)
	return c.Status(fiber.StatusOK).JSON(res)
}