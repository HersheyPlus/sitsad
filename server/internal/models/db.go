package models

import (
	"time"
)

type Building struct {
	BuildingID   string    `gorm:"primaryKey;column:building_id;" json:"building_id"`
	BuildingName string    `gorm:"column:building_name;type:varchar(100);not null" json:"building_name"`
	Description  string    `gorm:"column:description;type:text" json:"description"`
	ImageURL     string    `gorm:"column:image_url;type:text" json:"image_url"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Rooms []Room `gorm:"foreignKey:BuildingID" json:"rooms,omitempty"`
	Items []Item `gorm:"foreignKey:BuildingID" json:"items,omitempty"`
}

type Room struct {
	RoomID      string    `gorm:"primaryKey;column:room_id;not null" json:"room_id"`
	BuildingID  string    `gorm:"column:building_id;not null" json:"building_id"`
	RoomName    string    `gorm:"column:room_name;type:varchar(100);not null" json:"room_name"`
	Description string    `gorm:"column:description;type:text" json:"description"`
	Floor       int       `gorm:"column:floor;not null" json:"floor"`
	ImageURL    string    `gorm:"column:image_url;type:text" json:"image_url"`
	CreatedAt   time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Building Building `gorm:"foreignKey:BuildingID;references:BuildingID" json:"building,omitempty"`
	Items    []Item   `gorm:"foreignKey:RoomID" json:"items,omitempty"`
}

type ItemType string

const (
	ItemTypeTable  ItemType = "table"
	ItemTypeToilet ItemType = "toilet"
)

type Item struct {
	ItemID     string    `gorm:"primaryKey;column:item_id;" json:"item_id"`
	Type       ItemType  `gorm:"column:type;type:varchar(10);not null" json:"type"`
	BuildingID *string   `gorm:"column:building_id" json:"building_id,omitempty"`
	RoomID     *string   `gorm:"column:room_id" json:"room_id,omitempty"`
	Available  bool      `gorm:"column:available;default:true" json:"available"`
	PositionX  *float64  `gorm:"column:position_x" json:"position_x,omitempty"`
	PositionY  *float64  `gorm:"column:position_y" json:"position_y,omitempty"`
	Width      *float64  `gorm:"column:width" json:"width,omitempty"`
	Height     *float64  `gorm:"column:height" json:"height,omitempty"`
	Floor      *int      `gorm:"column:floor" json:"floor,omitempty"`
	Name       string    `gorm:"column:name;not null" json:"name"`
	Gender     *string   `gorm:"column:gender;type:varchar(10)" json:"gender,omitempty"`
	CreatedAt  time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// Relationships
	Building *Building           `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	Room     *Room               `gorm:"foreignKey:RoomID;references:RoomID" json:"room,omitempty"`
	Bookings []BookingTimePeriod `gorm:"foreignKey:ItemID" json:"bookings,omitempty"`
}

type BookingTimePeriod struct {
	BookingTimePeriodID string    `gorm:"primaryKey;column:booking_time_period_id;" json:"booking_time_period_id"`
	ItemID              string    `gorm:"column:item_id;not null" json:"item_id"`
	PhoneNumber         string    `gorm:"column:phone_number;type:varchar(20);not null" json:"phone_number"`
	StartedBookingTime  time.Time `gorm:"column:started_booking_time;not null" json:"started_booking_time"`
	EndedBookingTime    time.Time `gorm:"column:ended_booking_time;default:null" json:"ended_booking_time"`
	Item                Item      `gorm:"foreignKey:ItemID;references:ItemID" json:"item"`
}

type ForgotItem struct {
    ID           string    `gorm:"primaryKey;column:forgot_item_id" json:"id"`
    ImageURL     string    `gorm:"column:image_url;type:text" json:"imageUrl"`
    Date         time.Time `gorm:"column:date;not null" json:"date"`
    TableID      string    `gorm:"column:table_id;not null" json:"tableId"`
    CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"createdAt"`
    UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updatedAt"`
    // Relations
    Table        Item      `gorm:"foreignKey:TableID" json:"-"`
    BuildingName string    `gorm:"column:building_name;type:varchar(100)" json:"building_name"`
    RoomName     string    `gorm:"column:room_name;type:varchar(100)" json:"room_name"`
}

type DeviceType string

const (
    DeviceTypeCamera DeviceType = "camera"
    // Add other device types here as needed
)


type Device struct {
    ID         string     `gorm:"primaryKey;column:device_id" json:"id"`
    Name       string     `gorm:"column:name;type:varchar(100);not null" json:"name"`
    Topic      string     `gorm:"column:topic;type:varchar(100);not null" json:"topic"`
    BuildingID string     `gorm:"column:building_id;not null" json:"building_id"`
    RoomID     string     `gorm:"column:room_id;not null" json:"room_id"`
    Type       DeviceType `gorm:"column:type;type:varchar(20);not null" json:"type"`
    WebURL     string     `gorm:"column:web_url;type:text" json:"webUrl"`
    CreatedAt  time.Time  `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"createdAt"`
    UpdatedAt  time.Time  `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updatedAt"`
    // Relations
    Building   Building   `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
    Room       Room       `gorm:"foreignKey:RoomID" json:"room,omitempty"`
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

func (ForgotItem) TableName() string {
    return "forgot_items"
}

func (Device) TableName() string {
    return "devices"
}

func (i *Item) IsTable() bool {
	return i.Type == ItemTypeTable
}

func (i *Item) IsToilet() bool {
	return i.Type == ItemTypeToilet
}
func NewBuilding(buildingId, name, description, imageURL string) *Building {
	return &Building{
		BuildingID:   buildingId,
		BuildingName: name,
		Description:  description,
		ImageURL:     imageURL,
	}
}

func NewRoom(roomId string, buildingID string, roomName, description, imageURL string, floor int) *Room {
	return &Room{
		RoomID:      roomId,
		BuildingID:  buildingID,
		RoomName:    roomName,
		Description: description,
		ImageURL:    imageURL,
		Floor:       floor,
	}
}

func NewTable(roomID string, posX, posY, width, height float64, name string) *Item {
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

func NewToilet(buildingID string, roomID *string, floor int, gender, name string, posX, posY float64) *Item {
	return &Item{
		Type:       ItemTypeToilet,
		BuildingID: &buildingID,
		RoomID:     roomID, // Add optional RoomID
		Floor:      &floor,
		Name:       name,
		Gender:     &gender,
		PositionX:  &posX,
		PositionY:  &posY,
		Available:  true,
	}
}

func NewForgotItem(id, imageURL string, date time.Time, tableID, buildingName, roomName string) *ForgotItem {
    return &ForgotItem{
        ID:           id,
        ImageURL:     imageURL,
        Date:         date,
        TableID:      tableID,
        BuildingName: buildingName,
        RoomName:     roomName,
    }
}

func NewDevice(id, name, topic, buildingID, roomID string, deviceType DeviceType, webURL string) *Device {
    return &Device{
        ID:         id,
        Name:       name,
        Topic:      topic,
        BuildingID: buildingID,
        RoomID:     roomID,
        Type:       deviceType,
        WebURL:     webURL,
    }
}