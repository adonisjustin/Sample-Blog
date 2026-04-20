<?php
/**
 * Database Configuration
 * Strictly using PDO for security and PSR compatibility.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'blog_system');
define('DB_USER', 'root');
define('DB_PASS', 'root');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (\PDOException $e) {
    // Bubble up to index.php catch block
    throw new Exception("Core Blueprint Sync Error: " . $e->getMessage());
}
