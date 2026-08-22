-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `dayflow_db`;
USE `dayflow_db`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL DEFAULT 'password123',
  `role` ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
  `department` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NOT NULL,
  `salary` DECIMAL(12, 2) NULL,
  `avatar` VARCHAR(500) NULL,
  `join_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance Table
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present', 'absent', 'half-day', 'leave') NOT NULL DEFAULT 'present',
  `check_in` DATETIME NULL,
  `check_out` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('paid', 'sick', 'unpaid') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `remarks` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_comment` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
