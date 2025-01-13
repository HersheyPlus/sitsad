-- mock-up
USE hackathon2025;
-- Insert Buildings
INSERT INTO buildings (building_id, building_name, description, image_url) VALUES
('ENG-A', 'Engineering Building A', 'Main engineering building complex A', 'eng-a.jpg'),
('ENG-B', 'Engineering Building B', 'Secondary engineering building complex B', 'eng-b.jpg'),
('ENG-C', 'Engineering Building C', 'Research and development complex C', 'eng-c.jpg');

-- Insert Rooms (Adding specific restroom areas)
INSERT INTO rooms (room_id, building_id, room_name, description, floor, image_url) VALUES
-- Engineering Building A Rooms
('ENG-A-101', 'ENG-A', 'Study Room 101', 'Quiet study space with individual desks', 1, 'eng-a-101.jpg'),
('ENG-A-102', 'ENG-A', 'Study Room 102', 'Group study room with whiteboards', 1, 'eng-a-102.jpg'),
('ENG-A-REST1', 'ENG-A', 'Restroom Area 1F', 'First floor restroom area', 1, 'eng-a-rest1.jpg'),
('ENG-A-201', 'ENG-A', 'Study Room 201', 'Large study hall with projector', 2, 'eng-a-201.jpg'),
('ENG-A-202', 'ENG-A', 'Study Room 202', 'Small group discussion room', 2, 'eng-a-202.jpg'),
('ENG-A-REST2', 'ENG-A', 'Restroom Area 2F', 'Second floor restroom area', 2, 'eng-a-rest2.jpg'),

-- Engineering Building B Rooms
('ENG-B-101', 'ENG-B', 'Study Room 101', 'Open study space', 1, 'eng-b-101.jpg'),
('ENG-B-102', 'ENG-B', 'Study Room 102', 'Quiet reading room', 1, 'eng-b-102.jpg'),
('ENG-B-REST1', 'ENG-B', 'Restroom Area 1F', 'First floor restroom area', 1, 'eng-b-rest1.jpg'),

-- Engineering Building C Rooms
('ENG-C-101', 'ENG-C', 'Study Room 101', 'Computer lab with study spaces', 1, 'eng-c-101.jpg'),
('ENG-C-REST1', 'ENG-C', 'Restroom Area 1F', 'First floor restroom area', 1, 'eng-c-rest1.jpg'),
('ENG-C-201', 'ENG-C', 'Study Room 201', 'Research study room', 2, 'eng-c-201.jpg');


-- Buildings and Rooms remain the same as they are correct

-- Insert Items (Tables) - All fields included, width/height >= 50
INSERT INTO items (item_id, type, room_id, name, available, position_x, position_y, width, height, floor, gender) VALUES
-- Tables in ENG-A
('TBL-A101-1', 'table', 'ENG-A-101', 'Study Table 1', true, 10.0, 15.0, 120.0, 60.0, 1, null),
('TBL-A101-2', 'table', 'ENG-A-101', 'Study Table 2', true, 10.0, 85.0, 120.0, 60.0, 1, null),
('TBL-A102-1', 'table', 'ENG-A-102', 'Group Table 1', true, 15.0, 20.0, 180.0, 90.0, 1, null),
('TBL-A201-1', 'table', 'ENG-A-201', 'Study Table 1', true, 20.0, 25.0, 120.0, 60.0, 2, null),
('TBL-A201-2', 'table', 'ENG-A-201', 'Study Table 2', true, 20.0, 95.0, 120.0, 60.0, 2, null),

-- Tables in ENG-B
('TBL-B101-1', 'table', 'ENG-B-101', 'Study Desk 1', true, 12.0, 18.0, 120.0, 60.0, 1, null),
('TBL-B101-2', 'table', 'ENG-B-101', 'Study Desk 2', true, 12.0, 88.0, 120.0, 60.0, 1, null),

-- Tables in ENG-C
('TBL-C101-1', 'table', 'ENG-C-101', 'Computer Desk 1', true, 8.0, 12.0, 140.0, 70.0, 1, null),
('TBL-C101-2', 'table', 'ENG-C-101', 'Computer Desk 2', true, 8.0, 82.0, 140.0, 70.0, 1, null);

-- Insert Items (Toilets) - All fields included, width/height >= 50
INSERT INTO items (item_id, type, room_id, name, available, position_x, position_y, width, height, floor, gender) VALUES
-- Toilets in ENG-A
('TOI-A1-M', 'toilet', 'ENG-A-REST1', 'Male Restroom 1F', true, 5.0, 10.0, 80.0, 60.0, 1, 'male'),
('TOI-A1-F', 'toilet', 'ENG-A-REST1', 'Female Restroom 1F', true, 5.0, 30.0, 80.0, 60.0, 1, 'female'),
('TOI-A2-M', 'toilet', 'ENG-A-REST2', 'Male Restroom 2F', true, 5.0, 10.0, 80.0, 60.0, 2, 'male'),
('TOI-A2-F', 'toilet', 'ENG-A-REST2', 'Female Restroom 2F', true, 5.0, 30.0, 80.0, 60.0, 2, 'female'),

-- Toilets in ENG-B
('TOI-B1-M', 'toilet', 'ENG-B-REST1', 'Male Restroom 1F', true, 6.0, 12.0, 80.0, 60.0, 1, 'male'),
('TOI-B1-F', 'toilet', 'ENG-B-REST1', 'Female Restroom 1F', true, 6.0, 32.0, 80.0, 60.0, 1, 'female'),

-- Toilets in ENG-C
('TOI-C1-M', 'toilet', 'ENG-C-REST1', 'Male Restroom 1F', true, 4.0, 8.0, 80.0, 60.0, 1, 'male'),
('TOI-C1-F', 'toilet', 'ENG-C-REST1', 'Female Restroom 1F', true, 4.0, 28.0, 80.0, 60.0, 1, 'female');

-- Insert Bookings (for the year 2025)
INSERT INTO booking_time_periods (booking_time_period_id, item_id, phone_number, started_booking_time, ended_booking_time) VALUES
('BK-20250112-001', 'TBL-A101-1', '0812345678', '2025-01-12 09:00:00', '2025-01-12 12:00:00'),
('BK-20250112-002', 'TBL-A101-2', '0823456789', '2025-01-12 13:00:00', '2025-01-12 16:00:00'),
('BK-20250112-003', 'TBL-A201-1', '0834567890', '2025-01-12 14:00:00', '2025-01-12 17:00:00'),
('BK-20250113-001', 'TBL-B101-1', '0845678901', '2025-01-13 09:00:00', '2025-01-13 12:00:00'),
('BK-20250113-002', 'TBL-C101-1', '0856789012', '2025-01-13 13:00:00', '2025-01-13 16:00:00');