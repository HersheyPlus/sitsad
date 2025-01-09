CREATE DATABASE IF NOT EXISTS hackathon2025;
USE hackathon2025;

-- Create Tables with corrected data types
CREATE TABLE buildings (
    building_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    room_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    building_id INTEGER NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    description TEXT,
    floor INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
);

CREATE TABLE items (
    item_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(10) NOT NULL,
    building_id INTEGER,
    room_id INTEGER,
    available BOOLEAN DEFAULT true,
    position_x FLOAT,
    position_y FLOAT,
    width FLOAT,
    height FLOAT,
    floor INT,
    number INT,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

CREATE TABLE parking_warnings (
    license_plate VARCHAR(20) PRIMARY KEY,
    building_id INTEGER NOT NULL,
    amount_of_warnings INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
);

CREATE TABLE booking_time_periods (
    booking_time_period_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item_id INTEGER,
    started_booking_time TIMESTAMP NOT NULL,
    ended_booking_time TIMESTAMP NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);