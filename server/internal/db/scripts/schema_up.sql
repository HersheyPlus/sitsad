
-- Create Tables with corrected data types
CREATE TABLE IF NOT EXISTS buildings (
    building_id VARCHAR(30) NOT NULL PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id VARCHAR(30) NOT NULL PRIMARY KEY,
    building_id VARCHAR(30) NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    description TEXT,
    floor INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
);

CREATE TABLE IF NOT EXISTS items (
    item_id VARCHAR(30) PRIMARY KEY,
    type VARCHAR(10) NOT NULL,
    building_id VARCHAR(30),
    room_id VARCHAR(30),
    name VARCHAR(100) NOT NULL,
    available BOOLEAN DEFAULT true,
    position_x FLOAT,
    position_y FLOAT,
    width FLOAT,
    height FLOAT,
    floor INT,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
);



CREATE TABLE IF NOT EXISTS booking_time_periods (
    booking_time_period_id VARCHAR(100) NOT NULL PRIMARY KEY,
    item_id VARCHAR(30),
    phone_number VARCHAR(20) NOT NULL,
    started_booking_time TIMESTAMP NOT NULL,
    ended_booking_time TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE IF NOT EXISTS forgot_items (
    forgot_item_id VARCHAR(30) PRIMARY KEY,
    image_url TEXT,
    date TIMESTAMP NOT NULL,
    table_id VARCHAR(30) NOT NULL,
    building_name VARCHAR(100),
    room_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES items(item_id)
);

CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    building_id VARCHAR(30) NOT NULL,
    room_id VARCHAR(30) NOT NULL,
    type VARCHAR(20) NOT NULL,
    web_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(building_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);