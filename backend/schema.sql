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

DROP TABLE IF EXISTS recipes;

-- Create recipes table
CREATE TABLE recipes (
    recipe_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL, -- Foreign key to associate recipes with users
    name VARCHAR(255) NOT NULL,
    ingredients TEXT NOT NULL, -- Store ingredients as a JSON or comma-separated string
    instructions TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE DATABASE IF NOT EXISTS mealmatcher;
CREATE USER 'mealmatcher'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mealmatcher.* TO 'mealmatcher'@'localhost';
FLUSH PRIVILEGES;
