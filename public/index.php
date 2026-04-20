<?php
// Professional Error Reporting for PSR compliance and debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/db.php';

/**
 * ARCHITECTURAL BRIDGE: PHP + REACT
 * This file acts as the single entry point for all /api requests.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get input data
function getBodyData() {
    return json_decode(file_get_contents('php://input'), true);
}

// Router (Compatibility Fix for older PHP versions)
if (strpos($uri, '/api/posts') === 0) {
    handlePostRequests($method, $uri);
} else if (strpos($uri, '/api/authors') === 0) {
    handleAuthorRequests($method, $uri);
} else if (strpos($uri, '/api/settings') === 0) {
    handleSettingsRequests($method, $uri);
} else if (strpos($uri, '/api/comments') === 0) {
    handleCommentRequests($method, $uri);
} else {
    // If not an API request, serve the React Frontend (dist/index.html)
    if (file_exists(__DIR__ . '/../dist/index.html')) {
        header('Content-Type: text/html');
        echo file_get_contents(__DIR__ . '/../dist/index.html');
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Architectural path not found."]);
    }
}

function handlePostRequests($method, $uri) {
    global $pdo;
    $parts = explode('/', trim($uri, '/'));
    $id = isset($parts[2]) ? (int)$parts[2] : null;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT p.*, u.username as author_name FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query("
                SELECT p.*, u.username as author_name, u.bio as author_bio, u.avatar_url as author_avatar, c.name as category_name 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.created_at DESC
            ");
            $posts = $stmt->fetchAll();
            
            $structuredPosts = array_map(function($p) {
                return [
                    'id' => (int)$p['id'],
                    'title' => $p['title'],
                    'slug' => $p['slug'],
                    'excerpt' => $p['excerpt'],
                    'content' => $p['content'],
                    'date' => date('M j, Y', strtotime($p['created_at'])),
                    'category' => $p['category_name'] ?? 'Uncategorized',
                    'reactions' => (int)($p['views'] ?? 0),
                    'author' => [
                        'id' => (int)$p['user_id'],
                        'username' => $p['author_name'] ?? 'Architect',
                        'bio' => $p['author_bio'] ?? '',
                        'avatar_url' => $p['author_avatar'] ?? null
                    ],
                    'comments' => []
                ];
            }, $posts);
            echo json_encode($structuredPosts);
        }
    } else if ($method === 'POST') {
        $data = getBodyData();
        $stmt = $pdo->prepare("INSERT INTO posts (user_id, title, slug, excerpt, content, category_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['user_id'] ?? 1, $data['title'], $data['slug'], $data['excerpt'], $data['content'], $data['category_id'] ?? null]);
        echo json_encode(['id' => $pdo->lastInsertId(), 'status' => 'Post created']);
    } else if ($method === 'PUT' && $id) {
        $data = getBodyData();
        $stmt = $pdo->prepare("UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, user_id = ? WHERE id = ?");
        $stmt->execute([$data['title'], $data['slug'], $data['excerpt'], $data['content'], $data['user_id'] ?? 1, $id]);
        echo json_encode(['status' => 'Post updated']);
    } else if ($method === 'POST' && $id && str_ends_with($uri, '/react')) {
        $stmt = $pdo->prepare("UPDATE posts SET views = views + 1 WHERE id = ?");
        $stmt->execute([$id]);
        $stmt = $pdo->prepare("SELECT views as reactions FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch());
    } else if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Post deleted']);
    }
}

function handleAuthorRequests($method, $uri) {
    global $pdo;
    $parts = explode('/', trim($uri, '/'));
    $id = isset($parts[2]) ? (int)$parts[2] : null;

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT id, username, bio, avatar_url, email FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query("SELECT id, username, bio, avatar_url, email FROM users ORDER BY username ASC");
            echo json_encode($stmt->fetchAll());
        }
    } else if ($method === 'POST') {
        $data = getBodyData();
        $stmt = $pdo->prepare("INSERT INTO users (username, email, bio, avatar_url, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['username'], $data['email'], $data['bio'] ?? '', $data['avatar_url'] ?? '', password_hash($data['password'] ?? 'peace123', PASSWORD_DEFAULT)]);
        echo json_encode(['id' => $pdo->lastInsertId(), 'status' => 'Author created']);
    } else if ($method === 'PUT' && $id) {
        $data = getBodyData();
        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ?, bio = ?, avatar_url = ? WHERE id = ?");
        $stmt->execute([$data['username'], $data['email'], $data['bio'], $data['avatar_url'], $id]);
        echo json_encode(['status' => 'Author updated']);
    }
}

function handleSettingsRequests($method, $uri) {
    global $pdo;
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT key_name, value_text FROM settings");
        $raw = $stmt->fetchAll();
        $settings = [];
        foreach ($raw as $row) {
            $settings[$row['key_name']] = $row['value_text'];
        }
        echo json_encode($settings);
    } else if ($method === 'POST') {
        $data = getBodyData();
        foreach ($data as $key => $value) {
            $stmt = $pdo->prepare("INSERT INTO settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_text = ?");
            $stmt->execute([$key, (string)$value, (string)$value]);
        }
        echo json_encode(["status" => "Settings updated"]);
    }
}

function handleCommentRequests($method, $uri) {
    global $pdo;
    $parts = explode('/', trim($uri, '/'));
    $id = isset($parts[2]) ? (int)$parts[2] : null;

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM comments ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } else if ($method === 'POST') {
        $data = getBodyData();
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, author_name, content, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['post_id'], $data['author_name'], $data['content'], 'pending']);
        echo json_encode(['id' => $pdo->lastInsertId(), 'status' => 'Dialogue received']);
    } else if ($method === 'PATCH' && $id) {
        $stmt = $pdo->prepare("UPDATE comments SET status = 'approved' WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Dialogue approved']);
    } else if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Dialogue removed']);
    }
}
