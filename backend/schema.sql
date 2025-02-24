DROP DATABASE IF EXISTS mealmatcher;
CREATE DATABASE mealmatcher;

USE mealmatcher;

DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(60) NOT NULL,  -- bcrypt hashes are always 60 characters
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
