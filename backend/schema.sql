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
    prep_time TEXT NOT NULL,
    cook_time TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
    user_id VARCHAR(255) NOT NULL,
    recipe_id INT NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);

DROP TABLE IF EXISTS ratings;
-- Create ratings table
CREATE TABLE ratings (
    rating_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    recipe_id BIGINT UNSIGNED NOT NULL,
    rating INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN dietary_preferences VARCHAR(255);

CREATE USER IF NOT EXISTS 'mealmatcher'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mealmatcher.* TO 'mealmatcher'@'localhost';
FLUSH PRIVILEGES;
