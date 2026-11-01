-- Banana Math Game Database Schema
-- Run: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS banana_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banana_game;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar VARCHAR(10) DEFAULT '🍌',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB;

-- Refresh tokens (httpOnly cookie token hashes stored here)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB;

-- Game sessions (solution stored server-side ONLY, never sent to client)
CREATE TABLE IF NOT EXISTS game_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  question_image_url TEXT NOT NULL,
  solution TINYINT UNSIGNED NOT NULL COMMENT 'Digit 0-9, never exposed to client',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answered_at TIMESTAMP NULL,
  is_correct BOOLEAN NULL,
  answer_given TINYINT UNSIGNED NULL,
  time_taken_ms INT NULL,
  score_earned INT DEFAULT 0,
  hints_used TINYINT UNSIGNED DEFAULT 0,
  is_expired BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_started_at (started_at),
  INDEX idx_answered_at (answered_at)
) ENGINE=InnoDB;

-- Aggregate user statistics (denormalized for fast leaderboard queries)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id INT PRIMARY KEY,
  total_score BIGINT DEFAULT 0,
  total_games INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  total_time_ms BIGINT DEFAULT 0,
  last_played TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
