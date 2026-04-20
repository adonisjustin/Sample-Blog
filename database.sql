-- Database Schema for Blog System
-- Import this into your MySQL environment (Laragon / HeidiSQL)

CREATE DATABASE IF NOT EXISTS `blog_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `blog_system`;

-- Authors / Users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `bio` TEXT,
    `avatar_url` VARCHAR(255),
    `role` ENUM('admin', 'editor', 'author') DEFAULT 'author',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `slug` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Posts
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `category_id` INT UNSIGNED,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `excerpt` VARCHAR(500),
    `content` LONGTEXT,
    `status` ENUM('draft', 'published') DEFAULT 'published',
    `views` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Comments
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `post_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED, -- Nullable for anonymous or deleted users
    `author_name` VARCHAR(100), -- For guest comments
    `content` TEXT NOT NULL,
    `status` ENUM('approved', 'pending', 'spam') DEFAULT 'approved',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reactions (Likes/Upvotes)
DROP TABLE IF EXISTS `reactions`;
CREATE TABLE `reactions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `post_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED,
    `type` ENUM('like', 'love', 'insightful') DEFAULT 'like',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `one_reaction_per_user` (`post_id`, `user_id`),
    FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Site Settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
    `key_name` VARCHAR(50) PRIMARY KEY,
    `value_text` LONGTEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Initial Settings Data
INSERT INTO `settings` (`key_name`, `value_text`) VALUES
('title', 'Post.'),
('description', 'A minimalist exploration of web architecture, clean design, and the evolving relationship between developers and AI.'),
('primaryColor', '#5a5a40'),
('allowComments', '1'),
('maintenanceMode', '0'),
('privacyPolicy', 'Your privacy is curated with extreme prejudice. We do not track, sell, or broadcast your digital footprint.'),
('termsOfService', 'Usage of this system implies an appreciation for minimalist design.'),
('rssContent', 'Our RSS feed is a raw architectural stream.'),
('philosophy', 'Thinking In Bytes. A minimalist exploration of web architecture, clean design, and the evolving relationship between developers and AI.');

-- Initial Seed Data
INSERT INTO `users` (`username`, `email`, `password`, `bio`, `role`) VALUES 
('senior_php', 'admin@example.com', '$2y$10$UnFkZXJib2FyZC1zaGFyZWQta2V5LXByb3h5...', 'Senior Architect specializing in PHP ecosystem.', 'admin');

INSERT INTO `categories` (`name`, `slug`) VALUES 
('PHP Development', 'php-dev'),
('Design Philosophy', 'design-phil'),
('Industry News', 'news');

INSERT INTO `posts` (`user_id`, `category_id`, `title`, `slug`, `excerpt`) VALUES 
(1, 1, 'Architecting for Scale in PHP', 'scale-in-php', 'Modern PHP patterns for high-traffic environments.'),
(1, 2, 'Minimalism in Code and Design', 'clean-code-design', 'Why sparse logic often produces the most robust systems.');
