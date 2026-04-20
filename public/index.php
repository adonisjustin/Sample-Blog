<?php
/**
 * ARCHITECTURAL BRIDGE: PHP + REACT
 */
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    if (ob_get_length()) ob_end_clean();
    http_response_code(500);
    echo json_encode([
        "error" => "PHP Architectural Error",
        "message" => $errstr,
        "file" => $errfile,
        "line" => $errline
    ]);
    exit;
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (ob_get_length()) ob_end_clean();
        http_response_code(500);
        echo json_encode([
            "error" => "PHP Critical Failure",
            "message" => $error['message'],
            "file" => $error['file'],
            "line" => $error['line']
        ]);
        exit;
    }
});

// Core Headers (Priority)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle Options Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Professional Error Reporting for PSR compliance and debugging
ini_set('display_errors', 0); 
error_reporting(E_ALL);

// Ensure clean JSON output
ob_start();

// Helper to get input data
if (!function_exists('getBodyData')) {
    function getBodyData() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        return is_array($data) ? $data : [];
    }
}

try {
    require_once __DIR__ . '/../config/db.php';
    
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];

    // Router (Compatibility Fix for older PHP versions)
    if ($uri === '/api/health') {
        echo json_encode(['status' => 'architecture_online', 'php_version' => PHP_VERSION]);
        exit;
    }

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
} catch (Exception $e) {
    if (ob_get_length()) ob_end_clean();
    http_response_code(500);
    echo json_encode(["error" => "System Architecture Sync Failure", "details" => $e->getMessage()]);
} catch (Error $e) {
    if (ob_get_length()) ob_end_clean();
    http_response_code(500);
    echo json_encode(["error" => "Critical System Failure", "details" => $e->getMessage()]);
}

function handlePostRequests($method, $uri) {
    global $pdo;
    $parts = explode('/', trim($uri, '/'));
    $id = isset($parts[2]) ? (int)$parts[2] : null;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT p.*, u.username as author_name FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?");
            $stmt->execute([$id]);
            $res = $stmt->fetch();
            echo json_encode($res ? $res : (object)[]);
            exit;
        } else {
            $stmt = $pdo->query("
                SELECT p.*, u.username as author_name, u.bio as author_bio, u.avatar_url as author_avatar, c.name as category_name 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.created_at DESC
            ");
            if (!$stmt) {
                throw new Exception("Query failed: " . implode(" ", $pdo->errorInfo()));
            }
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
            exit;
        }
    } else if ($method === 'POST') {
        $data = getBodyData();
        $stmt = $pdo->prepare("INSERT INTO posts (user_id, title, slug, excerpt, content, category_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['user_id'] ?? 1, $data['title'] ?? 'Untitled', $data['slug'] ?? 'post-'.time(), $data['excerpt'] ?? '', $data['content'] ?? '', $data['category_id'] ?? null]);
        echo json_encode(['id' => $pdo->lastInsertId(), 'status' => 'Post created']);
        exit;
    } else if ($method === 'PUT' && $id) {
        $data = getBodyData();
        $stmt = $pdo->prepare("UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, user_id = ? WHERE id = ?");
        $stmt->execute([$data['title'] ?? '', $data['slug'] ?? '', $data['excerpt'] ?? '', $data['content'] ?? '', $data['user_id'] ?? 1, $id]);
        echo json_encode(['status' => 'Post updated']);
        exit;
    } else if ($method === 'POST' && $id && (substr($uri, -6) === '/react')) {
        $stmt = $pdo->prepare("UPDATE posts SET views = views + 1 WHERE id = ?");
        $stmt->execute([$id]);
        $stmt = $pdo->prepare("SELECT views as reactions FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch());
        exit;
    } else if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Post deleted']);
        exit;
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
            $u = $stmt->fetch();
            if ($u) {
                echo json_encode([
                    'id' => (int)$u['id'],
                    'username' => $u['username'],
                    'email' => $u['email'],
                    'bio' => $u['bio'],
                    'avatar_url' => $u['avatar_url']
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Author not found']);
            }
            exit;
        } else {
            $stmt = $pdo->query("SELECT id, username, bio, avatar_url, email FROM users ORDER BY username ASC");
            if (!$stmt) {
                throw new Exception("Query failed: " . implode(" ", $pdo->errorInfo()));
            }
            $users = $stmt->fetchAll();
            $structuredUsers = array_map(function($u) {
                return [
                    'id' => (int)$u['id'],
                    'username' => $u['username'],
                    'email' => $u['email'],
                    'bio' => $u['bio'],
                    'avatar_url' => $u['avatar_url']
                ];
            }, $users);
            echo json_encode($structuredUsers);
            exit;
        }
    } else if ($method === 'POST') {
        $data = getBodyData();
        $stmt = $pdo->prepare("INSERT INTO users (username, email, bio, avatar_url, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['username'] ?? 'New Architect', $data['email'] ?? 'dev@example.com', $data['bio'] ?? '', $data['avatar_url'] ?? '', password_hash($data['password'] ?? 'peace123', PASSWORD_DEFAULT)]);
        echo json_encode(['id' => (int)$pdo->lastInsertId(), 'status' => 'Author created']);
        exit;
    } else if ($method === 'PUT' && $id) {
        $data = getBodyData();
        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ?, bio = ?, avatar_url = ? WHERE id = ?");
        $stmt->execute([$data['username'] ?? '', $data['email'] ?? '', $data['bio'] ?? '', $data['avatar_url'] ?? '', $id]);
        echo json_encode(['status' => 'Author updated']);
        exit;
    } else if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Author removed']);
        exit;
    }
}

function handleSettingsRequests($method, $uri) {
    global $pdo;
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT key_name, value_text FROM settings");
        if (!$stmt) {
            throw new Exception("Query failed: " . implode(" ", $pdo->errorInfo()));
        }
        $raw = $stmt->fetchAll();
        $settings = [];
        foreach ($raw as $row) {
            $val = $row['value_text'];
            // Auto-cast boolean-like strings
            if ($val === "1") $val = true;
            if ($val === "0" || $val === "") $val = false;
            $settings[$row['key_name']] = $val;
        }
        // Force JSON object even if empty
        echo json_encode((object)$settings);
        exit;
    } else if ($method === 'POST') {
        $data = getBodyData();
        foreach ($data as $key => $value) {
            $stmt = $pdo->prepare("INSERT INTO settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_text = ?");
            $stmt->execute([$key, (string)$value, (string)$value]);
        }
        echo json_encode(["status" => "Settings updated"]);
        exit;
    }
}

function handleCommentRequests($method, $uri) {
    global $pdo;
    $parts = explode('/', trim($uri, '/'));
    $id = isset($parts[2]) ? (int)$parts[2] : null;

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM comments ORDER BY created_at DESC");
        if (!$stmt) {
            throw new Exception("Query failed: " . implode(" ", $pdo->errorInfo()));
        }
        $raw = $stmt->fetchAll();
        $mapped = array_map(function($c) {
            return [
                'id' => (int)$c['id'],
                'post_id' => (int)$c['post_id'],
                'author_name' => $c['author_name'],
                'content' => $c['content'],
                'status' => $c['status'],
                'date' => date('M j, Y', strtotime($c['created_at']))
            ];
        }, $raw);
        echo json_encode($mapped);
        exit;
    } else if ($method === 'POST') {
        $data = getBodyData();
        $stmt = $pdo->prepare("INSERT INTO comments (post_id, author_name, content, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['post_id'] ?? 0, $data['author_name'] ?? 'Guest', $data['content'] ?? '', 'pending']);
        echo json_encode(['id' => $pdo->lastInsertId(), 'status' => 'Dialogue received']);
        exit;
    } else if ($method === 'PATCH' && $id) {
        $stmt = $pdo->prepare("UPDATE comments SET status = 'approved' WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Dialogue approved']);
        exit;
    } else if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'Dialogue removed']);
        exit;
    }
}
