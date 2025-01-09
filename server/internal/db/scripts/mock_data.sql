USE hackathon2025;

-- Populate `buildings`
INSERT INTO buildings (building_name) VALUES
('Main Building'),
('Annex Building');

-- Populate `rooms`
INSERT INTO rooms (building_id, room_name, description, floor, image_url) VALUES
(1, 'Conference Room', 'Spacious room for meetings', 1, 'http://example.com/conference_room.jpg'),
(1, 'Restroom', 'Clean restroom with all facilities', 1, 'http://example.com/restroom.jpg'),
(2, 'Study Room', 'Quiet space for study', 2, 'http://example.com/study_room.jpg');

-- Populate `items` with type `table`
INSERT INTO items (type, building_id, room_id, available, position_x, position_y, width, height, floor, number) VALUES
('table', 1, 1, true, 10.5, 20.3, 1.5, 1.0, 1, 1),
('table', 1, 1, true, 11.5, 21.3, 1.5, 1.0, 1, 2),
('table', 2, 3, true, 15.0, 25.0, 1.5, 1.0, 2, 3);

-- Populate `items` with type `table` and `toilet`
INSERT INTO items (type, building_id, available, position_x, position_y, width, height, floor, number, gender) VALUES
('toilet', 1, true, 5.0, 10.0, 2.0, 1.5, 1, 3, 'Male'),
('toilet', 1, true, 6.0, 11.0, 2.0, 1.5, 1, 4, 'Female'),
('toilet', 2, true, 12.0, 15.0, 2.0, 1.5, 2, 5, 'Unisex');

-- Populate `parking_warnings`
INSERT INTO parking_warnings (license_plate, building_id, amount_of_warnings) VALUES
('ABC1234', 1, 2),
('XYZ5678', 2, 1);

-- Populate `booking_time_periods` (assuming a `tables` table exists)
INSERT INTO booking_time_periods (item_id, started_booking_time, ended_booking_time) VALUES
(1, '2025-01-09 10:00:00', '2025-01-09 12:00:00'),
(2, '2025-01-10 14:00:00', '2025-01-10 16:00:00'),
(3, '2025-01-11 18:00:00', '2025-01-11 20:00:00');
