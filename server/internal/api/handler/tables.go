package handler

import (
	"github.com/gofiber/fiber/v2"
	"server/internal/api/res"
	"server/internal/model"
)

func (h *Handler) HandleGetTables(c *fiber.Ctx) error {
	tables := []model.Table{}
	err := h.db.Select(&tables, "SELECT * FROM tables")
	if err != nil {
		res := res.NewResponse(false, "Failed to fetch tables", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Tables fetched successfully", tables)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleGetTableByID(c *fiber.Ctx) error {
	c.Accepts("application/json", "json")
	id := c.Params("id")
	table := model.Table{}
	err := h.db.Get(&table, "SELECT * FROM tables WHERE id = ?", id)

	if err != nil {
		res := res.NewResponse(false, "Table not found", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Table fetched successfully", table)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleCreateTable(c *fiber.Ctx) error {
	table := model.Table{}
	if err := c.BodyParser(&table); err != nil {
		res := res.NewResponse(false, "Failed to parse request body", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	if table.RoomID == 0 {
		res := res.NewResponse(false, "Room ID is required", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}
	if table.PositionX == 0 || table.PositionY == 0 {
		res := res.NewResponse(false, "Position X and Y are required", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	var existingRoom model.Room
	err := h.db.Get(&existingRoom, "SELECT * FROM rooms WHERE id = ?", table.RoomID)
	if err != nil {
		res := res.NewResponse(false, "Room does not exist", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	insertQuery := "INSERT INTO tables (room_id, position_x, position_y, is_free) VALUES (?, ?, ?, 0)"
	_, err = h.db.Exec(insertQuery, table.RoomID, table.PositionX, table.PositionY)
	if err != nil {
		res := res.NewResponse(false, "Failed to create table", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Table created successfully", nil)
	return c.Status(fiber.StatusCreated).JSON(res)
}

func (h *Handler) HandleUpdateIsFreeTable(c *fiber.Ctx) error {
	updatedTable := model.Table{}
	id := c.Params("id")
	c.Accepts("application/json", "json")
	if err := c.BodyParser(&updatedTable); err != nil {
		res := res.NewResponse(false, "Failed to parse request body", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	_, err := h.db.Exec("UPDATE tables SET is_free = ?, updated_at = NOW() WHERE id = ?", updatedTable.IsFree, id)
	if err != nil {
		res := res.NewResponse(false, "Failed to update table", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	var table model.Table
	err = h.db.Get(&table, "SELECT * FROM tables WHERE id = ?", id)
	if err != nil {
		res := res.NewResponse(false, "Failed to fetch updated table", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Table updated successfully", table)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleUpdatePositionTable(c *fiber.Ctx) error {
	updatedTable := model.Table{}
	id := c.Params("id")
	c.Accepts("application/json", "json")
	if err := c.BodyParser(&updatedTable); err != nil {
		res := res.NewResponse(false, "Failed to parse request body", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	_, err := h.db.Exec("UPDATE tables SET position_x = ?, position_y = ?, updated_at = NOW() WHERE id = ?", updatedTable.PositionX, updatedTable.PositionY, id)
	if err != nil {
		res := res.NewResponse(false, "Failed to update table", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	var table model.Table
	err = h.db.Get(&table, "SELECT * FROM tables WHERE id = ?", id)
	if err != nil {
		res := res.NewResponse(false, "Failed to fetch updated table", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Table updated successfully", table)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleDeleteTable(c *fiber.Ctx) error {
	id := c.Params("id")
	table := &model.Table{}
	err := h.db.Get(table, "SELECT * FROM tables WHERE id = ?", id)
	if err != nil {
		res := res.NewResponse(false, "Table not found", nil)
		return c.Status(fiber.StatusNotFound).JSON(res)
	}
	_, err = h.db.Exec("DELETE FROM tables WHERE id = ?", id)
	if err != nil {
		res := res.NewResponse(false, "Failed to delete table", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Table deleted successfully", nil)
	return c.Status(fiber.StatusOK).JSON(res)
}
