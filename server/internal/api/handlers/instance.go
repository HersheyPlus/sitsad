package handlers

import (
	"server/internal/ws"
	"server/internal/models"
	"gorm.io/gorm"
)

type Handler struct {
	db    *gorm.DB
	wsHub *ws.Hub
}

type CreateTableRequest struct {
	RoomID    string     `json:"room_id" validate:"required"`
	Name      string  `json:"name" validate:"required"`
	PositionX float64 `json:"position_x" validate:"required"`
	PositionY float64 `json:"position_y" validate:"required"`
	Width     float64 `json:"width" validate:"required"`
	Height    float64 `json:"height" validate:"required"`
}

type UpdateTableRequest struct {
    RoomID    *string  `json:"room_id"`
    Name      *string  `json:"name"`
    PositionX *float64 `json:"position_x"`
    PositionY *float64 `json:"position_y"`
    Width     *float64 `json:"width"`
    Height    *float64 `json:"height"`
}


type CreateToiletRequest struct {
    Floor      int     `json:"floor" validate:"required"`
    RoomID     string  `json:"room_id"`
    Gender     string  `json:"gender" validate:"required,oneof=Male Female Unisex"`
    PositionX  float64 `json:"position_x" validate:"required"`
    PositionY  float64 `json:"position_y" validate:"required"`
    Width      float64 `json:"width" validate:"required"`
    Height     float64 `json:"height" validate:"required"`
    Name       string  `json:"name" validate:"required"`
}

type UpdateToiletRequest struct {
    Floor     *int     `json:"floor"`
    Gender    *string  `json:"gender"`
    PositionX *float64 `json:"position_x"`
    PositionY *float64 `json:"position_y"`
    Width     *float64 `json:"width"`
    Height    *float64 `json:"height"`
    Name      *string  `json:"name"`
}

type CreateBuildingRequest struct {
	BuildingID   string `json:"building_id" validate:"required"`
	BuildingName string `json:"building_name" validate:"required"`
	Description  string `json:"description" validate:"required"`
	ImageURL     string `json:"image_url" validate:"required"`
}

type CreateRoomRequest struct {
	RoomID	string `json:"room_id" validate:"required"`
	BuildingID   string `json:"building_id" validate:"required"`
	RoomName    string `json:"room_name" validate:"required"`
	Description string `json:"description"`
	Floor       int    `json:"floor" validate:"required"`
	ImageURL    string `json:"image_url"`
}

type ItemResponse struct {
    ItemID      string          `json:"item_id"`
    Type        models.ItemType `json:"type"`
    BuildingID  string          `json:"building_id"`
    Available   bool            `json:"available"`
    PositionX   float64         `json:"position_x"`
    PositionY   float64         `json:"position_y"`
    Width       float64         `json:"width"`
    Height      float64         `json:"height"`
    Floor       *int            `json:"floor,omitempty"`
    Name        string          `json:"name"`
    Description *string         `json:"description,omitempty"`
    Location    LocationResponse `json:"location"`
}

type LocationResponse struct {
    Building BuildingResponse `json:"building"`
    Room     RoomResponse    `json:"room"`
}

type BuildingResponse struct {
    BuildingID   string  `json:"building_id"`
    BuildingName string  `json:"building_name"`
    Description  string  `json:"description"`
    ImageURL     string  `json:"imageURL"`
}

type RoomResponse struct {
    RoomID      string  `json:"room_id"`
    BuildingID  string  `json:"building_id"`
    RoomName    string  `json:"room_name"`
    Description string  `json:"description"`
    ImageURL    string  `json:"imageURL"`
    Floor       int     `json:"floor"`
}


func NewHandler(db *gorm.DB, wsHub *ws.Hub) *Handler {
	return &Handler{
		db:    db,
		wsHub: wsHub,
	}
}
