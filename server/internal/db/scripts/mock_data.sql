USE hackathon2025;
-- Insert Buildings
INSERT INTO buildings (building_id, building_name, description, image_url) VALUES
('ENG-A', 'Engineering Building A', 'Main engineering building with laboratories and classrooms', 'https://example.com/eng-a.jpg'),
('ENG-B', 'Engineering Building B', 'Advanced research labs and workshop spaces', 'https://example.com/eng-b.jpg'),
('SC-MAIN', 'Science Complex', 'Central science facility with modern equipment', 'https://example.com/sc-main.jpg');

-- Insert Rooms
INSERT INTO rooms (room_id, building_id, room_name, description, floor, image_url) VALUES
('A101', 'ENG-A', 'Computer Lab 1', 'Primary computer science laboratory', 1, 'https://example.com/a101.jpg'),
('A102', 'ENG-A', 'Computer Lab 2', 'Secondary computer lab with specialized software', 1, 'https://example.com/a102.jpg'),
('A201', 'ENG-A', 'Study Room', 'Quiet study space with individual desks', 2, 'https://example.com/a201.jpg'),
('B101', 'ENG-B', 'Workshop Room', 'Engineering workshop with workbenches', 1, 'https://example.com/b101.jpg'),
('B102', 'ENG-B', 'Research Lab', 'Research space for graduate students', 1, 'https://example.com/b102.jpg'),
('SC101', 'SC-MAIN', 'Physics Lab', 'General physics laboratory', 1, 'https://example.com/sc101.jpg');

-- Insert Items (Tables)
INSERT INTO items (item_id, type, room_id, name, available, position_x, position_y, width, height) VALUES
('TBL-A101-1', 'table', 'A101', 'Computer Desk 1', true, 10.5, 15.2, 120.0, 60.0),
('TBL-A101-2', 'table', 'A101', 'Computer Desk 2', true, 10.5, 25.2, 120.0, 60.0),
('TBL-A101-3', 'table', 'A101', 'Computer Desk 3', true, 10.5, 35.2, 120.0, 60.0),
('TBL-A201-1', 'table', 'A201', 'Study Table 1', true, 5.0, 8.0, 150.0, 75.0),
('TBL-A201-2', 'table', 'A201', 'Study Table 2', true, 5.0, 18.0, 150.0, 75.0),
('TBL-B101-1', 'table', 'B101', 'Workbench 1', true, 15.0, 10.0, 200.0, 90.0);

-- Insert Items (Toilets)
INSERT INTO items (item_id, building_id, type, floor, name, gender, position_x, position_y) VALUES
('TOI-ENGA-1M', 'ENG-A', 'toilet', 1, 'Male Restroom 1F', 'male', 2.0, 3.0),
('TOI-ENGA-1F', 'ENG-A', 'toilet', 1, 'Female Restroom 1F', 'female', 2.0, 8.0),
('TOI-ENGA-2M', 'ENG-A', 'toilet', 2, 'Male Restroom 2F', 'male', 2.0, 3.0),
('TOI-ENGA-2F', 'ENG-A', 'toilet', 2, 'Female Restroom 2F', 'female', 2.0, 8.0),
('TOI-ENGB-1M', 'ENG-B', 'toilet', 1, 'Male Restroom 1F', 'male', 3.0, 4.0),
('TOI-ENGB-1F', 'ENG-B', 'toilet', 1, 'Female Restroom 1F', 'female', 3.0, 9.0);

-- Insert Bookings (current date adjustments for 2025)
INSERT INTO booking_time_periods (booking_time_period_id, item_id, phone_number, started_booking_time, ended_booking_time) VALUES
('BK-20250111-001', 'TBL-A101-1', '0801234567', '2025-01-11 09:00:00', '2025-01-11 12:00:00'),
('BK-20250111-002', 'TBL-A101-2', '0809876543', '2025-01-11 13:00:00', '2025-01-11 16:00:00'),
('BK-20250111-003', 'TBL-A201-1', '0812345678', '2025-01-11 14:00:00', '2025-01-11 17:00:00'),
('BK-20250111-004', 'TBL-B101-1', '0823456789', '2025-01-11 10:00:00', '2025-01-11 15:00:00'),
('BK-20250112-001', 'TBL-A101-3', '0834567890', '2025-01-12 09:00:00', '2025-01-12 12:00:00'),
('BK-20250112-002', 'TBL-A201-2', '0845678901', '2025-01-12 13:00:00', '2025-01-12 16:00:00');