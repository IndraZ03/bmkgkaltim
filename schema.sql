CREATE DATABASE IF NOT EXISTS bmkg_kaltim_db;
USE bmkg_kaltim_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Admin User (Password: admin123)
-- Hash generated using bcryptjs
INSERT INTO users (name, email, password, role) 
VALUES ('Administrator', 'admin@bmkg.go.id', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cL8.J/k.f.q/x.q.x.q.x.', 'admin')
ON DUPLICATE KEY UPDATE email=email;
