-- Insert data into buildings
INSERT INTO buildings (building_id, building_name, description, image_url)
VALUES
    ('B1', 'Main Building', 'The main administrative building.', 'https://example.com/images/main-building.jpg'),
    ('B2', 'Library', 'A large library with various resources.', 'https://example.com/images/library.jpg'),
    ('B3', 'Gym', 'A modern gym with state-of-the-art equipment.', 'https://example.com/images/gym.jpg'),
    ('B4', 'Science Center', 'Building with labs and research facilities.', 'https://example.com/images/science-center.jpg');

-- Insert data into rooms
INSERT INTO rooms (room_id, building_id, room_name, description, image_url)
VALUES
    ('R1', 'B1', 'Conference Room', 'Spacious conference room with seating for 20.', 'https://example.com/images/conference-room.jpg'),
    ('R2', 'B2', 'Reading Room', 'Quiet room with comfortable seating.', 'https://example.com/images/reading-room.jpg'),
    ('R3', 'B3', 'Fitness Room', 'Equipped with treadmills and weights.', 'https://example.com/images/fitness-room.jpg'),
    ('R4', 'B4', 'Chemistry Lab', 'Lab with modern chemistry equipment.', 'https://example.com/images/chem-lab.jpg'),
    ('R5', 'B4', 'Physics Lab', 'Lab equipped for physics experiments.', 'https://example.com/images/physics-lab.jpg'),
    ('R6', 'B1', 'Auditorium', 'Large auditorium for events.', 'https://example.com/images/auditorium.jpg'),
    ('R7', 'B2', 'Computer Room', 'Room with computers for public use.', 'https://example.com/images/computer-room.jpg');

-- Insert data into devices
INSERT INTO devices (device_id, name, topic, building_id, room_id, type, web_url)
VALUES
    ('D1', 'Thermostat', 'climate_control', 'B1', 'R1', 'Sensor', 'https://example.com/devices/thermostat'),
    ('D2', 'Projector', 'presentation', 'B1', 'R6', 'Camera', 'https://example.com/devices/projector'),
    ('D3', 'Light Control', 'lighting', 'B2', 'R7', 'Sensor', 'https://example.com/devices/light-control'),
    ('D4', 'Security Camera', 'security', 'B4', 'R4', 'Camera', 'https://example.com/devices/security-camera');

-- Insert data into items
-- Insert data into items
INSERT INTO items (item_id, type, room_id, name, available, position_x, position_y, width, height, gender, device_id)
VALUES
    ('I1', 'table', 'R1', 'Office Table', true, 10.5, 20.3, 100, 100, NULL, 'D1'),
    ('I2', 'table', 'R2', 'Study Table', true, 15.0, 25.0, 3.0, 5.0, NULL, 'D2'),
    ('I3', 'toilet', 'R3', 'Men’s Toilet', true, 5.0, 10.0, 100, 100, 'Male', 'D3'),
    ('I4', 'toilet', 'R3', 'Women’s Toilet', true, 3.0, 5.0, 100, 100, 'Female', 'D3'),
    ('I5', 'table', 'R4', 'Lab Table', true, 8.0, 12.0, 100, 100, NULL, 'D4'),
    ('I6', 'table', 'R6', 'Speaker Table', true, 2.0, 2.0, 100, 100, NULL, 'D2'),
    ('I7', 'toilet', 'R5', 'Unisex Toilet', true, 1.0, 1.5, 100, 100, NULL, 'D3'),
    ('I8', 'table', 'R6', 'Projector Table', true, 4.0, 6.0, 100, 100, NULL, 'D2'),
    ('I9', 'toilet', 'R1', 'Accessible Toilet', true, 6.0, 8.0, 100, 100, NULL, 'D1'),
    ('I10', 'table', 'R7', 'Computer Table', true, 5.0, 9.0, 100, 100, NULL, 'D2');


-- Insert data into forgot_items
INSERT INTO forgot_items (forgot_item_id, image_url, date, table_id, building_name, room_name)
VALUES
    ('FI1', 'https://example.com/images/forgotten-bag.jpg', '2025-01-13', 'I2', 'Library', 'Reading Room'),
    ('FI2', 'https://example.com/images/forgotten-coat.jpg', '2025-01-12', 'I1', 'Main Building', 'Conference Room'),
    ('FI3', 'https://example.com/images/forgotten-glasses.jpg', '2025-01-10', 'I9', 'Main Building', 'Conference Room');

-- Insert data into booking_time_periods
INSERT INTO booking_time_periods (booking_time_period_id, item_id, phone_number, started_booking_time, ended_booking_time)
VALUES
    ('BTP1', 'I1', '1234567890', '2025-01-14 08:00:00', '2025-01-14 09:00:00'),
    ('BTP2', 'I2', '0987654321', '2025-01-14 10:00:00', '2025-01-14 11:00:00'),
    ('BTP3', 'I3', '1122334455', '2025-01-14 12:00:00', '2025-01-14 13:00:00'),
    ('BTP4', 'I5', '9988776655', '2025-01-14 14:00:00', '2025-01-14 15:00:00'),
    ('BTP5', 'I7', '5566778899', '2025-01-14 16:00:00', '2025-01-14 17:00:00'),
    ('BTP6', 'I9', '6677889900', '2025-01-14 18:00:00', '2025-01-14 19:00:00');
