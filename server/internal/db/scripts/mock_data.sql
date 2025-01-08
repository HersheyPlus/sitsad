USE hackathon2025;

-- Insert mock-up data into buildings table
INSERT INTO buildings (name, created_at, updated_at) VALUES
('Building A', NOW(), NOW()),
('Building B', NOW(), NOW()),
('Building C', NOW(), NOW());

-- Insert mock-up data into rooms table
INSERT INTO rooms (building_id, name, created_at, updated_at) VALUES
(1, 'Room 101', NOW(), NOW()),
(1, 'Room 102', NOW(), NOW()),
(2, 'Room 201', NOW(), NOW()),
(2, 'Room 202', NOW(), NOW()),
(3, 'Room 301', NOW(), NOW());

-- Insert mock-up data into tables table
INSERT INTO tables (room_id, is_free, created_at, updated_at) VALUES
(1, TRUE, NOW(), NOW()),
(1, FALSE, NOW(), NOW()),
(2, TRUE, NOW(), NOW()),
(3, TRUE, NOW(), NOW()),
(3, FALSE, NOW(), NOW());

-- Insert mock-up data into toilets table
INSERT INTO toilets (floor, building_id, toilet_number, gender, is_free, created_at, updated_at) VALUES
(1, 1, 1, 'male', TRUE, NOW(), NOW()),
(1, 1, 2, 'female', TRUE, NOW(), NOW()),
(2, 2, 1, 'female', FALSE, NOW(), NOW()),
(2, 2, 2, 'male', TRUE, NOW(), NOW()),
(3, 3, 1, 'female', TRUE, NOW(), NOW());

-- Insert mock-up data into car_parks table
INSERT INTO parking_warning (license_plate, building_id, amount_of_warnings, created_at, updated_at) VALUES
('AB123CD', 1, 0, NOW(), NOW()),
('EF456GH', 2, 1, NOW(), NOW()),
('IJ789KL', 2, 0, NOW(), NOW()),
('MN012OP', 3, 2, NOW(), NOW()),
('QR345ST', 1, 1, NOW(), NOW());

