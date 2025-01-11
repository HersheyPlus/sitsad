package handlers

import (
	"server/internal/ws"

	"gorm.io/gorm"
)

type Handler struct {
	db    *gorm.DB
	wsHub *ws.Hub
}

type CreateTableRequest struct {
	RoomID    int     `json:"room_id" validate:"required"`
	PositionX float64 `json:"position_x" validate:"required"`
	PositionY float64 `json:"position_y" validate:"required"`
	Width     float64 `json:"width" validate:"required"`
	Height    float64 `json:"height" validate:"required"`
	Name      string  `json:"name" validate:"required"`
}

type CreateToiletRequest struct {
	BuildingID int     `json:"building_id" validate:"required"`
	Floor      int     `json:"floor" validate:"required"`
	Gender     string  `json:"gender" validate:"required,oneof=Male Female Unisex"`
	PositionX  float64 `json:"position_x" validate:"required"`
	PositionY  float64 `json:"position_y" validate:"required"`
	Name       string  `json:"name" validate:"required"`
}

func NewHandler(db *gorm.DB, wsHub *ws.Hub) *Handler {
	return &Handler{
		db:    db,
		wsHub: wsHub,
	}
}
