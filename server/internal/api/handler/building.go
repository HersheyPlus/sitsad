package handler

import (
	"server/internal/api/res"
	"server/internal/model"
	"github.com/gofiber/fiber/v2"
)

func (h *Handler) HandleGetBuildings(c *fiber.Ctx) error {
	buildings := []model.Building{}
	err := h.db.Select(&buildings, "SELECT * FROM buildings")
	if err != nil {
		res := res.NewResponse(false, "Failed to fetch buildings", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Buildings fetched successfully", buildings)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleGetBuildingByID(c *fiber.Ctx) error {
	id := c.Params("id")
	building := model.Building{}
	err := h.db.Get(&building, "SELECT * FROM buildings WHERE id = ?", id)

	if err != nil {
		res := res.NewResponse(false, "Building not found", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Building fetched successfully", building)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleCreateBuilding(c *fiber.Ctx) error {
    building := &model.Building{}
    c.Accepts("application/json", "json")

    if err := c.BodyParser(building); err != nil {
        res := res.NewResponse(false, "Invalid input", nil)
        return c.Status(fiber.StatusBadRequest).JSON(res)
    }

    if building.Name == "" {
        res := res.NewResponse(false, "Building name is required", nil)
        return c.Status(fiber.StatusBadRequest).JSON(res)
    }

    building.Name = "Building " + building.Name

    var existingName string
    query := "SELECT name FROM buildings WHERE name = ?"
    err := h.db.QueryRow(query, building.Name).Scan(&existingName)
    if err == nil {
        res := res.NewResponse(false, "Building already exists", nil)
        return c.Status(fiber.StatusConflict).JSON(res)
    }

    insertQuery := "INSERT INTO buildings (name) VALUES (?)"
    _, err = h.db.Exec(insertQuery, building.Name)
    if err != nil {
        res := res.NewResponse(false, "Failed to create building", building)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

    res := res.NewResponse(true, "Building created successfully", building)
    return c.Status(fiber.StatusCreated).JSON(res)
}

func (h *Handler) HandleUpdateBuilding(c *fiber.Ctx) error {
    id := c.Params("id")
    updatedBuilding := &model.Building{}
    c.Accepts("application/json", "json")

    if err := c.BodyParser(updatedBuilding); err != nil {
        res := res.NewResponse(false, "Invalid input", nil)
        return c.Status(fiber.StatusBadRequest).JSON(res)
    }

    query := "SELECT * FROM buildings WHERE name = ? AND id != ?"
    err := h.db.Get(query, updatedBuilding.Name, id)
    if err == nil {
		res := res.NewResponse(false, "Building's name already exists", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

    updateQuery := "UPDATE buildings SET name = ?, updated_at = NOW() WHERE id = ?"
    _, err = h.db.Exec(updateQuery, updatedBuilding.Name, id)
    if err != nil {
        res := res.NewResponse(false, "Failed to update building", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

    res := res.NewResponse(true, "Building updated successfully", updatedBuilding)
    return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleDeleteBuilding(c *fiber.Ctx) error {
	id := c.Params("id")
	query := "DELETE FROM buildings WHERE id = ?"
	_, err := h.db.Exec(query, id)
	if err != nil {
		res := res.NewResponse(false, "Failed to delete building", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Building deleted successfully", nil)
	return c.Status(fiber.StatusOK).JSON(res)
}