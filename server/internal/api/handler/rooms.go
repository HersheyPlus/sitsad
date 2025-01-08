package handler

import (
	"server/internal/api/res"
	"server/internal/model"
	"strconv"
	"github.com/gofiber/fiber/v2"
)


func (h *Handler) HandleGetRooms(c *fiber.Ctx) error {
	rooms := []model.Room{}
	err := h.db.Select(&rooms, "SELECT * FROM rooms")
	if err != nil {
        res := res.NewResponse(false, "Failed to fetch rooms", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }
	res := res.NewResponse(true, "Rooms fetched successfully", rooms)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleGetRoomByID(c *fiber.Ctx) error {
	c.Accepts("application/json", "json")
	id := c.Params("id")
	room := model.Room{}
	err := h.db.Get(&room, "SELECT * FROM rooms WHERE id = ?", id)

	if err != nil {
		res := res.NewResponse(false, "Room not found", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Room fetched successfully", room)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleCreateRoom(c *fiber.Ctx) error {
	room := model.Room{}
	
	if err := c.BodyParser(&room); err != nil {
		res := res.NewResponse(false, "Invalid input", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	if room.Name == "" {
		res := res.NewResponse(false, "Room name is required", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	var buildingExists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM buildings WHERE id = ?)", room.BuildingID).Scan(&buildingExists)
	if err != nil || !buildingExists {
		res := res.NewResponse(false, "Building does not exist", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

	// Check if room already exists
	var existingRoom model.Room
	err = h.db.Get(&existingRoom, "SELECT * FROM rooms WHERE name = ? AND building_id = ?", room.Name, room.BuildingID)
	if err == nil {
		res := res.NewResponse(false, "Room already exists", nil)
		return c.Status(fiber.StatusConflict).JSON(res)
	}

	// Insert new room
	insertQuery := "INSERT INTO rooms (building_id, name) VALUES (?, ?)"
	_, err = h.db.Exec(insertQuery, room.BuildingID, room.Name)
	if err != nil {
		res := res.NewResponse(false, "Failed to create room", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	var newRoom model.Room
	err = h.db.Get(&newRoom, "SELECT * FROM rooms WHERE name = ? AND building_id = ?", room.Name, room.BuildingID)
	if err != nil {
		res := res.NewResponse(false, "Failed to fetch created room", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Room created successfully", newRoom)
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleUpdateRoom(c *fiber.Ctx) error {
    id := c.Params("id")
    updatedRoom := &model.Room{}
    c.Accepts("application/json", "json")

    if err := c.BodyParser(updatedRoom); err != nil {
        res := res.NewResponse(false, "Invalid input", nil)
        return c.Status(fiber.StatusBadRequest).JSON(res)
    }

	if updatedRoom.Name == "" {
		res := res.NewResponse(false, "Room name is required", nil)
		return c.Status(fiber.StatusBadRequest).JSON(res)
	}

    existingRoom := model.Room{}
    err := h.db.Get(&existingRoom, "SELECT * FROM rooms WHERE id = ?", id)
    if err != nil {
        res := res.NewResponse(false, "Room not found", nil)
        return c.Status(fiber.StatusNotFound).JSON(res)
    }

    // Update the room's name
    updateQuery := "UPDATE rooms SET name = ?, updated_at = NOW() WHERE id = ?"
    _, err = h.db.Exec(updateQuery, updatedRoom.Name, id)
    if err != nil {
        res := res.NewResponse(false, "Failed to update room", nil)
        return c.Status(fiber.StatusInternalServerError).JSON(res)
    }

	updatedRoom.ID, _ = strconv.Atoi(id)
	updatedRoom.BuildingID = existingRoom.BuildingID
    res := res.NewResponse(true, "Room updated successfully", updatedRoom)
    return c.Status(fiber.StatusOK).JSON(res)
}

func (h *Handler) HandleDeleteRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	existingRoom := &model.Room{}
	err := h.db.Get(&existingRoom, "SELECT * FROM rooms WHERE id = ?", id)
	if err != nil {
		res := res.NewResponse(false, "Room not found", nil)
		return c.Status(fiber.StatusNotFound).JSON(res)
	}

	deleteQuery := "DELETE FROM rooms WHERE id = ?"
	_, err = h.db.Exec(deleteQuery, id)
	if err != nil {
		res := res.NewResponse(false, "Failed to delete room", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	res := res.NewResponse(true, "Room deleted successfully", nil)
	return c.Status(fiber.StatusOK).JSON(res)
}
