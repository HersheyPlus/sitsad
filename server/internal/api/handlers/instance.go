package handlers

import (
	"server/internal/ws"
	"server/internal/models"
	"gorm.io/gorm"
    "time"
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

type CreateDeviceRequest struct {
    DeviceID   string            `json:"device_id"`
    Name       string            `json:"name"`
    Topic      string            `json:"topic"`
    BuildingID string            `json:"building_id"`
    RoomID     string            `json:"room_id"`
    Type       models.DeviceType `json:"type"`
    WebUrl     string            `json:"webUrl"`
}

type CreateForgotItemRequest struct {
    TableID      string    `form:"table_id"`
    BuildingName string    `form:"building_name"`
    RoomName     string    `form:"room_name"`
    Date         time.Time `form:"date"`
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
    RoomID     string  `json:"room_id"`
    Gender     string  `json:"gender" validate:"required,oneof=Male Female Unisex"`
    PositionX  float64 `json:"position_x" validate:"required"`
    PositionY  float64 `json:"position_y" validate:"required"`
    Width      float64 `json:"width" validate:"required"`
    Height     float64 `json:"height" validate:"required"`
    Name       string  `json:"name" validate:"required"`
}

type UpdateToiletRequest struct {
    Gender    *string  `json:"gender"`
    PositionX *float64 `json:"position_x"`
    PositionY *float64 `json:"position_y"`
    Width     *float64 `json:"width"`
    Height    *float64 `json:"height"`
    Name      *string  `json:"name"`
}

type CreateBuildingRequest struct {
	BuildingName string `json:"building_name" validate:"required"`
	Description  string `json:"description" validate:"required"`
}

type CreateRoomRequest struct {
	BuildingID   string `json:"building_id" validate:"required"`
	RoomName    string `json:"room_name" validate:"required"`
	Description string `json:"description"`
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
}




func NewHandler(db *gorm.DB, wsHub *ws.Hub) *Handler {
    return &Handler{
        db:    db,
        wsHub: wsHub,
    }
}