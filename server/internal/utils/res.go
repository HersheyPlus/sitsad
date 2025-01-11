package utils

import (
	"github.com/gofiber/fiber/v2"
	"fmt"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func GetSuccess(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func CreatedSuccess(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(Response{
		Success: true,
		Message: "Created successfully",
		Data:    data,
	})
}

func UpdatedSuccess(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(Response{
		Success: true,
		Message: "Updated successfully",
		Data:    data,
	})
}

func DeleteSuccess(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(Response{
		Success: true,
		Message: "Deleted successfully",
	})
}


func BadRequest(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusBadRequest).JSON(Response{
		Success: false,
		Error:   message,
	})
}

func NotFound(c *fiber.Ctx, message string, err error) error {
	return c.Status(fiber.StatusNotFound).JSON(Response{
		Success: false,
		Error:  err.Error(),
		Message: fmt.Sprintf("%s not found", message),
	})
}

func InternalServerError(c *fiber.Ctx, err error) error {
	return c.Status(fiber.StatusInternalServerError).JSON(Response{
		Success: false,
		Error:   "Internal server error",
	})
}
