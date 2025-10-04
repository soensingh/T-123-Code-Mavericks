-- GuardAid MySQL Database Setup Queries
-- Run these commands in MySQL Workbench or MySQL Command Line

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS guardaid_db;

-- 2. Use the database
USE guardaid_db;

-- 3. Create safety_zones table
CREATE TABLE IF NOT EXISTS safety_zones (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('safe', 'danger') NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    radius INT NOT NULL,
    total_ratings INT DEFAULT 1,
    incidents INT DEFAULT 0,
    volunteers INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(100) DEFAULT 'anonymous',
    rating_history JSON
);

-- 4. Create dropped_pins table
CREATE TABLE IF NOT EXISTS dropped_pins (
    id BIGINT PRIMARY KEY,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100) DEFAULT 'anonymous'
);

-- 5. Create users table (for future use)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Verify tables were created
SHOW TABLES;

-- 7. Check table structures
DESCRIBE safety_zones;
DESCRIBE dropped_pins;
DESCRIBE users;

-- 8. Insert sample data (optional)
INSERT INTO safety_zones (id, type, lat, lng, name, rating, radius, total_ratings, incidents, volunteers, user_id, rating_history) VALUES
('sample-safe-1', 'safe', 31.326016, 75.576180, 'Sample Safe Zone - City Center', 4, 200, 5, 0, 2, 'system', '[]'),
('sample-danger-1', 'danger', 31.320000, 75.580000, 'Sample Danger Zone - Construction Area', 2, 150, 3, 2, 0, 'system', '[]');

-- 9. Verify data insertion
SELECT * FROM safety_zones;
SELECT * FROM dropped_pins;

-- 10. Grant permissions (if using specific user)
-- Replace 'your_username' with your actual MySQL username
-- GRANT ALL PRIVILEGES ON guardaid_db.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;