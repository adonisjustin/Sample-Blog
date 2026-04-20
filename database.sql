-- Database Schema for Blog System
-- Import this into your MySQL environment (Laragon / HeidiSQL)

CREATE DATABASE IF NOT EXISTS `blog_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `blog_system`;

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` VARCHAR(500),
    `content` LONGTEXT,
    `author` VARCHAR(100) DEFAULT 'Admin',
    `status` ENUM('draft', 'published') DEFAULT 'published',
    `created_at` DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO `posts` (`title`, `excerpt`, `content`, `author`) VALUES 
('Architecting for Scale in PHP', 'How a modern PHP developer handles enterprise-level data structures.', 'Full technical deep dive into modern PHP patterns...', 'Lead Developer'),
('Minimalism in Code and Design', 'Exploring the intersection of clean PHP logic and sparse user interfaces.', 'A study on why less is more in both backend and frontend...', 'Design Strategist'),
('PDO vs MySQLi: The Security Debate', 'Why raw MySQLi is often a liability in modern systems.', 'Detailed comparison focusing on prepared statements and security...', 'Security Specialist');
