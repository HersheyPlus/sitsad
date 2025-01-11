package models

import (
	"time"
)

type Building struct {
	BuildingID   int       `gorm:"primaryKey;column:building_id;autoIncrement" json:"building_id"`
	BuildingName string    `gorm:"column:building_name;type:varchar(100);not null" json:"building_name"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Rooms []Room `gorm:"foreignKey:BuildingID" json:"rooms,omitempty"`
	Items []Item `gorm:"foreignKey:BuildingID" json:"items,omitempty"`
}

type Room struct {
	RoomID      int       `gorm:"primaryKey;column:room_id;autoIncrement" json:"room_id"`
	BuildingID  int       `gorm:"column:building_id;not null" json:"building_id"`
	RoomName    string    `gorm:"column:room_name;type:varchar(100);not null" json:"room_name"`
	Description string    `gorm:"column:description;type:text" json:"description"`
	Floor       int       `gorm:"column:floor;not null" json:"floor"`
	ImageURL    string    `gorm:"column:image_url;type:text" json:"image_url"`
	CreatedAt   time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Building Building `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	Items    []Item   `gorm:"foreignKey:RoomID" json:"items,omitempty"`
}

type ItemType string

const (
	ItemTypeTable  ItemType = "table"
	ItemTypeToilet ItemType = "toilet"
)

type Item struct {
	ItemID     int       `gorm:"primaryKey;column:item_id;autoIncrement" json:"item_id"`
	Type       ItemType  `gorm:"column:type;type:varchar(10);not null" json:"type"`
	BuildingID *int      `gorm:"column:building_id" json:"building_id,omitempty"`
	RoomID     *int      `gorm:"column:room_id" json:"room_id,omitempty"`
	Available  bool      `gorm:"column:available;default:true" json:"available"`
	PositionX  *float64  `gorm:"column:position_x" json:"position_x,omitempty"`
	PositionY  *float64  `gorm:"column:position_y" json:"position_y,omitempty"`
	Width      *float64  `gorm:"column:width" json:"width,omitempty"`
	Height     *float64  `gorm:"column:height" json:"height,omitempty"`
	Floor      *int      `gorm:"column:floor" json:"floor,omitempty"`
	Name       string   `gorm:"column:name;not null" json:"name"`
	Gender     *string   `gorm:"column:gender;type:varchar(10)" json:"gender,omitempty"`
	CreatedAt  time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Building *Building           `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	Room     *Room               `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	Bookings []BookingTimePeriod `gorm:"foreignKey:ItemID" json:"bookings,omitempty"`
}

type BookingTimePeriod struct {
	BookingTimePeriodID int       `gorm:"primaryKey;column:booking_time_period_id;autoIncrement" json:"booking_time_period_id"`
	ItemID              int       `gorm:"column:item_id" json:"item_id"`
	StartBookingTime    time.Time `gorm:"column:started_booking_time;not null" json:"started_booking_time"`
	EndBookingTime      time.Time `gorm:"column:ended_booking_time;default:null" json:"ended_booking_time"`
	Item                Item      `gorm:"foreignKey:ItemID" json:"item,omitempty"`
}

// TableName methods
func (Building) TableName() string {
	return "buildings"
}

func (Room) TableName() string {
	return "rooms"
}

func (Item) TableName() string {
	return "items"
}

func (BookingTimePeriod) TableName() string {
	return "booking_time_periods"
}

func (i *Item) IsTable() bool {
	return i.Type == ItemTypeTable
}

func (i *Item) IsToilet() bool {
	return i.Type == ItemTypeToilet
}

func NewTable(roomID int, posX, posY, width, height float64, name string) *Item {
	return &Item{
		Type:      ItemTypeTable,
		RoomID:    &roomID,
		Available: true,
		PositionX: &posX,
		PositionY: &posY,
		Width:     &width,
		Height:    &height,
		Name:      name,
	}
}

func NewToilet(buildingID, floor int, gender, name string, posX, posY float64) *Item {
	return &Item{
		Type:       ItemTypeToilet,
		BuildingID: &buildingID,
		Floor:      &floor,
		Name:       name,
		Gender:     &gender,
		PositionX:  &posX,
		PositionY:  &posY,
		Available:  true,
	}
}
