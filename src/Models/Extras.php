<?php

namespace Blog\Models;

class User {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }
    
    public function getAuthor($id) {
        $stmt = $this->pdo->prepare("SELECT id, username, bio, avatar_url FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}

class Category {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }
    
    public function getAll() {
        return $this->pdo->query("SELECT * FROM categories")->fetchAll();
    }
}

class Comment {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }
    
    public function getByPost($postId) {
        $stmt = $this->pdo->prepare("SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at DESC");
        $stmt->execute([$postId]);
        return $stmt->fetchAll();
    }
    
    public function create($postId, $name, $content) {
        $stmt = $this->pdo->prepare("INSERT INTO comments (post_id, author_name, content) VALUES (?, ?, ?)");
        return $stmt->execute([$postId, $name, $content]);
    }
}
