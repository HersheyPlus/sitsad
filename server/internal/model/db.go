package model

import (
	"time"
)

type Building struct {
	ID        int       `db:"id" json:"id"`
	Name      string    `db:"name" json:"building_name"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type Room struct {
	ID           int       `db:"id" json:"id"`
	BuildingID int    `db:"building_id" json:"building_id"`
	Name         string    `db:"name" json:"room_name"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type Table struct {
	ID        int       `db:"id" json:"id"`
	RoomID    int       `db:"room_id" json:"room_id"`
	IsFree    bool      `db:"is_free" json:"is_free"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type Toilet struct {
	ID           int       `db:"id" json:"id"`
	Floor        int       `db:"floor" json:"floor"`
	BuildingID int    `db:"building_id" json:"building_id"`
	ToiletNumber int       `db:"toilet_number" json:"toilet_number"`
	Gender       string    `db:"gender" json:"gender"`
	IsFree       bool      `db:"is_free" json:"is_free"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type ParkingWarning struct {
	LicensePlate     string    `db:"license_plate" json:"license_plate"`
	BuildingID     int    `db:"building_id" json:"building_id"`
	AmountOfWarnings int       `db:"amount_of_warnings" json:"amount_of_warnings"`
	CreatedAt        time.Time `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time `db:"updated_at" json:"updated_at"`
}
