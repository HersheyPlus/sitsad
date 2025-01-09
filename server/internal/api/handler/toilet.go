package handler

import (
	"encoding/json"
	"log"
	"server/internal/api/res"
	"server/internal/model"
	ws "server/internal/ws"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
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

func (h *Handler) HandleToiletWebSocket(c *websocket.Conn) {
    clientID := uuid.New().String()

    client := &ws.Client{
        ID:   clientID,
        Conn: c,
    }

    // Register the new client
    h.hub.Register(client)

    // Clean up on disconnect
    defer func() {
        h.hub.Unregister(clientID)
    }()

    for {
        messageType, message, err := c.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                log.Printf("error: %v", err)
            }
            break
        }

        if messageType == websocket.TextMessage {
            var update model.Toilet
            if err := json.Unmarshal(message, &update); err != nil {
                log.Printf("error unmarshaling message: %v", err)
                continue
            }

            // Update toilet status in database
            _, err := h.db.Exec("UPDATE toilets SET is_free = ? WHERE id = ?", update.IsFree, update.ID)
            if err != nil {
                log.Printf("error updating toilet status: %v", err)
                continue
            }

            // Broadcast the update to all connected clients
            h.hub.Broadcast(message)
        }
    }
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

func (h *Handler) HandlerUpdateIsFreeToilet(c *fiber.Ctx) error {
	updatedToilet := model.Toilet{}
	id := c.Params("id")
	c.Accepts("application/json", "json")
	if err := c.BodyParser(&updatedToilet); err != nil {
		res := res.NewResponse(false, "Failed to parse request body", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}

	updateQuery := "UPDATE toilets SET is_free = ? WHERE id = ?"
	_, err := h.db.Exec(updateQuery, updatedToilet.IsFree, id)
	if err != nil {
		res := res.NewResponse(false, "Failed to update toilet", nil)
		return c.Status(fiber.StatusInternalServerError).JSON(res)
	}
	res := res.NewResponse(true, "Toilet updated successfully", nil)
	return c.Status(fiber.StatusOK).JSON(res)
}