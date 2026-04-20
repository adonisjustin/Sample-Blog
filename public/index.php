<?php
require_once __DIR__ . '/../config/db.php';

/**
 * Modern PHP Entry Point
 * This file would typically serve as the controller or router
 * in a production PHP environment.
 */

header('Content-Type: application/json');

// Mocking the behavior of a PHP-to-Frontend API
$posts = [
    [
        "id" => 1,
        "title" => "Architecting for Scale in PHP",
        "excerpt" => "How a modern PHP developer handles enterprise-level data structures.",
        "date" => "2024-03-20",
        "author" => "Lead Developer"
    ],
    [
        "id" => 2,
        "title" => "Minimalism in Code and Design",
        "excerpt" => "Exploring the intersection of clean PHP logic and sparse user interfaces.",
        "date" => "2024-03-18",
        "author" => "Design Strategist"
    ]
];

echo json_encode($posts);
