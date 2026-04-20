<?php
require_once __DIR__ . '/../config/db.php';

/**
 * ARCHITECTURAL BRIDGE: PHP + REACT
 * This file acts as the single entry point for all /api requests.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Quick Router Logic
if (str_contains($uri, '/api/posts')) {
    handlePostRequests($method, $uri);
} else if (str_contains($uri, '/api/comments')) {
    handleCommentRequests($method, $uri);
} else {
    // If not an API request, serve the React Frontend (dist/index.html)
    if (file_exists(__DIR__ . '/../dist/index.html')) {
        header('Content-Type: text/html');
        echo file_get_contents(__DIR__ . '/../dist/index.html');
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found architecturaly."]);
    }
}

function handlePostRequests($method, $uri) {
    global $pdo;
    
    if ($method === 'GET') {
        // Example: SELECT p.*, u.username as author FROM posts p JOIN users u ON p.author_id = u.id
        $stmt = $pdo->query("SELECT * FROM posts ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    }
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        // INSERT INTO posts ...
        echo json_encode(["status" => "Post curated in database"]);
    }
}

function handleCommentRequests($method, $uri) {
    echo json_encode(["status" => "Dialogue received"]);
}
