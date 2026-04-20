import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// In-Memory Data Store (Simulating MySQL for the Live Preview)
let posts = [
  { 
    id: 1, 
    slug: "scale-in-php",
    title: "Architecting for Scale in PHP", 
    content: "Typography and whitespace are the foundation of a minimalist interface. However, in the backend, performance is the silent engine...",
    excerpt: "How a modern PHP developer handles enterprise-level data structures.", 
    date: "2024-03-20", 
    authorId: 1,
    categoryId: 1,
    reactions: 42,
    status: 'published'
  },
  { 
    id: 2, 
    slug: "clean-code-design",
    title: "Minimalism in Code and Design", 
    content: "Transitioning patterns from server-rendered PHP to modern reactive stacks requires a shift in perspective...",
    excerpt: "Exploring the intersection of clean PHP logic and sparse user interfaces.", 
    date: "2024-03-18", 
    authorId: 1,
    categoryId: 2,
    reactions: 18,
    status: 'published'
  }
];

let comments = [
  { id: 1, postId: 1, author_name: "Junior Dev", content: "This is exactly what I needed to understand PDO better!", date: "1 hour ago", status: 'approved' },
  { id: 2, postId: 1, author_name: "Systems Engineer", content: "Excellent points on PSR-12 compatibility.", date: "2 hours ago", status: 'approved' }
];

let authors = [
  { id: 1, username: "Senior Architect", bio: "Specializing in PHP ecosystem and clean architecture.", avatar_url: "https://picsum.photos/seed/dev/100/100" }
];

let categories = [
  { id: 1, name: "Architecture", slug: "architecture" },
  { id: 2, name: "Design", slug: "design" }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // PHP-Style API Bridge
  app.get("/api/posts", (req, res) => {
    const enrichedPosts = posts.map(p => ({
      ...p,
      author: authors.find(a => a.id === p.authorId),
      category: categories.find(c => c.id === p.categoryId)?.name || "Uncategorized",
      comments: comments.filter(c => c.postId === p.id && c.status === 'approved')
    }));
    res.json(enrichedPosts);
  });

  app.post("/api/posts", (req, res) => {
    const newPost = {
      ...req.body,
      id: posts.length + 1,
      date: new Date().toISOString().split('T')[0],
      reactions: 0,
      comments: []
    };
    posts.unshift(newPost);
    res.status(201).json(newPost);
  });

  app.put("/api/posts/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...req.body };
      res.json(posts[index]);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  app.delete("/api/posts/:id", (req, res) => {
    const id = parseInt(req.params.id);
    posts = posts.filter(p => p.id !== id);
    res.status(204).end();
  });

  // Reactions
  app.post("/api/posts/:id/react", (req, res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(p => p.id === id);
    if (post) {
      post.reactions += 1;
      res.json({ reactions: post.reactions });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  // Comments Management
  app.get("/api/admin/comments", (req, res) => {
    res.json(comments);
  });

  app.patch("/api/comments/:id/approve", (req, res) => {
    const id = parseInt(req.params.id);
    const comment = comments.find(c => c.id === id);
    if (comment) {
      comment.status = 'approved';
      res.json(comment);
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  });

  app.delete("/api/comments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    comments = comments.filter(c => c.id !== id);
    res.status(204).end();
  });

  app.post("/api/comments", (req, res) => {
    const newComment = {
      ...req.body,
      id: comments.length + 1,
      date: "Just now",
      status: 'approved' // Auto-approve for demo
    };
    comments.push(newComment);
    res.status(201).json(newComment);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
