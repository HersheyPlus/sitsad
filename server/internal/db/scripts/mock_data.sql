-- Insert Buildings
INSERT INTO buildings (building_id, building_name, description, image_url) VALUES
('bld_001', 'Engineering Building', 'Main engineering faculty building with modern facilities', 'https://example.com/eng.jpg'),
('bld_002', 'Library', 'Central university library with study spaces', 'https://example.com/lib.jpg'),
('bld_003', 'Student Center', 'Multi-purpose student activities building', 'https://example.com/student.jpg');

-- Insert Rooms
INSERT INTO rooms (room_id, building_id, room_name, description,image_url) VALUES
('rm_001', 'bld_001', 'Engineering Lab 101', 'Computer engineering laboratory', 'https://example.com/lab101.jpg'),
('rm_002', 'bld_001', 'Study Room 201', 'Quiet study space', 'https://example.com/study201.jpg'),
('rm_003', 'bld_002', 'Reading Room A', 'Main reading area','https://example.com/reading_a.jpg'),
('rm_004', 'bld_002', 'Group Study B', 'Collaborative study space', 'https://example.com/group_b.jpg'),
('rm_005', 'bld_003', 'Cafeteria', 'Main dining area', 'https://example.com/cafeteria.jpg');

-- Insert Items (Tables)
INSERT INTO items (item_id, type, room_id, name, available, position_x, position_y, width, height) VALUES
('tbl_001', 'table', 'rm_001', 'Lab Table 1', true, 10.5, 20.0, 60.0, 30.0),
('tbl_002', 'table', 'rm_001', 'Lab Table 2', true, 80.5, 20.0, 60.0, 30.0),
('tbl_003', 'table', 'rm_003', 'Reading Table 1', true, 15.0, 25.0, 50.0, 25.0),
('tbl_004', 'table', 'rm_004', 'Group Table 1', true, 30.0, 40.0, 80.0, 40.0);

-- Insert Items (Toilets)
INSERT INTO items (item_id, type, room_id, name, available, position_x, position_y, gender, width, height) VALUES
('tlt_001', 'toilet', 'rm_001', 'Men''s Room 1F', true, 100.0, 150.0,'male', 100,100),
('tlt_002', 'toilet', 'rm_001', 'Women''s Room 1F', true, 100.0, 200.0, 'female',100,100),
('tlt_003', 'toilet', 'rm_002', 'Men''s Room 2F', true, 120.0, 150.0, 'male',100,100);

-- Insert Booking Time Periods
INSERT INTO booking_time_periods (booking_time_period_id, item_id, phone_number, started_booking_time, ended_booking_time) VALUES
('bk_001', 'tbl_001', '+1234567890', '2024-01-13 09:00:00', '2024-01-13 11:00:00'),
('bk_002', 'tbl_003', '+1987654321', '2024-01-13 13:00:00', '2024-01-13 15:00:00'),
('bk_003', 'tbl_004', '+1122334455', '2024-01-13 14:00:00', NULL);

-- Insert Forgot Items
INSERT INTO forgot_items (forgot_item_id, image_url, date, table_id, building_name, room_name) VALUES
('fgt_001', 'https://example.com/items/notebook.jpg', '2024-01-12 15:30:00', 'tbl_001', 'Engineering Building', 'Engineering Lab 101'),
('fgt_002', 'https://example.com/items/umbrella.jpg', '2024-01-13 10:45:00', 'tbl_003', 'Library', 'Reading Room A');

-- Insert Devices (Cameras)
INSERT INTO devices (device_id, name, topic, building_id, room_id, type, web_url) VALUES
('dev_001', 'Lab Camera 1', 'cameras/lab101', 'bld_001', 'rm_001', 'camera', 'https://example.com/camera/1'),
('dev_002', 'Library Camera 1', 'cameras/lib1', 'bld_002', 'rm_003', 'camera', 'https://example.com/camera/2'),
('dev_003', 'Cafeteria Camera 1', 'cameras/cafe1', 'bld_003', 'rm_005', 'camera', 'https://example.com/camera/3');