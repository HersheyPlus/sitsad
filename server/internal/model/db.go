package model

import (
	"time"
)

type Building struct {
	BuildingID   int       `gorm:"primaryKey;column:building_id;autoIncrement" json:"building_id"`
	BuildingName string    `gorm:"column:building_name;type:varchar(100);not null" json:"building_name"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Rooms        []Room           `gorm:"foreignKey:BuildingID" json:"rooms,omitempty"`
	Items        []Item          `gorm:"foreignKey:BuildingID" json:"items,omitempty"`
	Warnings     []ParkingWarning `gorm:"foreignKey:BuildingID" json:"warnings,omitempty"`
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
	Building    Building  `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	Items       []Item    `gorm:"foreignKey:RoomID" json:"items,omitempty"`
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
	Number     *int      `gorm:"column:number" json:"number,omitempty"`
	Gender     *string   `gorm:"column:gender;type:varchar(10)" json:"gender,omitempty"`
	CreatedAt  time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Building   *Building `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	Room       *Room     `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	Bookings   []BookingTimePeriod `gorm:"foreignKey:ItemID" json:"bookings,omitempty"`
}

type ParkingWarning struct {
	LicensePlate     string    `gorm:"primaryKey;column:license_plate;type:varchar(20)" json:"license_plate"`
	BuildingID       int       `gorm:"column:building_id;not null" json:"building_id"`
	AmountOfWarnings int       `gorm:"column:amount_of_warnings;default:0" json:"amount_of_warnings"`
	CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Building         Building  `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
}

type BookingTimePeriod struct {
	BookingTimePeriodID int       `gorm:"primaryKey;column:booking_time_period_id;autoIncrement" json:"booking_time_period_id"`
	ItemID              int       `gorm:"column:item_id" json:"item_id"`
	StartBookingTime    time.Time `gorm:"column:started_booking_time;not null" json:"started_booking_time"`
	EndBookingTime      time.Time `gorm:"column:ended_booking_time;not null" json:"ended_booking_time"`
	CreatedAt           time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt           time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Item               Item      `gorm:"foreignKey:ItemID" json:"item,omitempty"`
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

func (ParkingWarning) TableName() string {
	return "parking_warnings"
}

func (BookingTimePeriod) TableName() string {
	return "booking_time_periods"
}

// Validate methods for each struct
func (i *Item) IsTable() bool {
	return i.Type == ItemTypeTable
}

func (i *Item) IsToilet() bool {
	return i.Type == ItemTypeToilet
}

// Helper method for table creation
func NewTable(roomID int, posX, posY, width, height float64) *Item {
	return &Item{
		Type:      ItemTypeTable,
		RoomID:    &roomID,
		Available: true,
		PositionX: &posX,
		PositionY: &posY,
		Width:     &width,
		Height:    &height,
	}
}

// Helper method for toilet creation
func NewToilet(buildingID, floor, number int, gender string, posX, posY float64) *Item {
	return &Item{
		Type:       ItemTypeToilet,
		BuildingID: &buildingID,
		Floor:      &floor,
		Number:     &number,
		Gender:     &gender,
		PositionX: &posX,
		PositionY: &posY,
		Available:  true,
	}
}