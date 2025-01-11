USE hackathon2025;
-- Insert mock buildings
INSERT INTO buildings (building_name, description, image_url) VALUES
('Engineering Building', 'Main engineering faculty building', 'https://example.com/eng.jpg'),
('Science Center', 'Science and research facility', 'https://example.com/science.jpg'),
('Library', 'Central university library', 'https://example.com/library.jpg');

-- Insert mock rooms
INSERT INTO rooms (building_id, room_name, description, floor, image_url) VALUES
(1, 'E101', 'Computer Lab', 1, 'https://example.com/e101.jpg'),
(1, 'E201', 'Study Room', 2, 'https://example.com/e201.jpg'),
(2, 'S101', 'Physics Lab', 1, 'https://example.com/s101.jpg'),
(2, 'S202', 'Chemistry Lab', 2, 'https://example.com/s202.jpg'),
(3, 'L101', 'Reading Room', 1, 'https://example.com/l101.jpg');

-- Insert mock items (tables and toilets)
INSERT INTO items (building_id, room_id, name, type, available, position_x, position_y, width, height, floor, gender) VALUES
-- Tables in rooms
(NULL, 1, 'Study Table 1', 'table', true, 10.5, 20.5, 60.0, 120.0, NULL, NULL),
(NULL, 1, 'Study Table 2', 'table', true, 80.5, 20.5, 60.0, 120.0, NULL, NULL),
(NULL, 2, 'Study Table 3', 'table', true, 10.5, 20.5, 60.0, 120.0, NULL, NULL),
(NULL, 3, 'Lab Table 1', 'table', true, 30.0, 40.0, 80.0, 160.0, NULL, NULL),
(NULL, 4, 'Lab Table 2', 'table', true, 120.0, 40.0, 80.0, 160.0, NULL, NULL),

-- Toilets in buildings
(1, NULL, 'Engineering F1 Female', 'toilet', true, 150.0, 200.0, NULL, NULL, 1, 'female'),
(1, NULL, 'Engineering F1 Male', 'toilet', true, 180.0, 200.0, NULL, NULL, 1, 'male'),
(2, NULL, 'Science F1 Female', 'toilet', true, 100.0, 150.0, NULL, NULL, 1, 'female'),
(2, NULL, 'Science F1 Male', 'toilet', true, 130.0, 150.0, NULL, NULL, 1, 'male'),
(3, NULL, 'Library F1 Female', 'toilet', true, 90.0, 120.0, NULL, NULL, 1, 'female'),
(3, NULL, 'Library F1 Male', 'toilet', true, 120.0, 120.0, NULL, NULL, 1, 'male');

-- Insert mock booking time periods
INSERT INTO booking_time_periods (item_id, phone_number, started_booking_time, ended_booking_time) VALUES
(1,"08148148141" ,'2025-01-10 09:00:00', '2025-01-10 11:00:00'),
(1, "08148148141" ,'2025-01-10 14:00:00', '2025-01-10 16:00:00'),
(2, "08148148141",'2025-01-10 10:00:00', '2025-01-10 12:00:00'),
(4, "08148148141",'2025-01-10 13:00:00', '2025-01-10 15:00:00'),
(6, "08148148141",'2025-01-10 09:30:00', '2025-01-10 09:35:00'),
(8, "08148148141" ,'2025-01-10 10:45:00', '2025-01-10 10:50:00');