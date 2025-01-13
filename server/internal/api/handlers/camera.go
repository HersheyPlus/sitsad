package handlers

import (
    "github.com/gofiber/fiber/v2"
    res "server/internal/utils"
)

type Camera struct {
    Name  string `json:"name"`
    URL   string `json:"url"`
    Topic string `json:"topic"`
}

func (h *Handler) GetCameraInfo(c *fiber.Ctx) error {
    cameras := []Camera{
        {
            Name:  "cam A",
            URL:   "http://10.4.25.239:81/stream",
            Topic: "table/bld_001/rm_001/tbl_001",
        },
    }
    
    return res.GetSuccess(c, "Camera info retrieved successfully", cameras)
}