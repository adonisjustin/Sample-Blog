import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // PHP-Style API Bridge
  // In a real PHP environment, these would be handled by public/index.php
  app.get("/api/posts", (req, res) => {
    res.json([
      { 
        id: 1, 
        title: "Architecting for Scale in PHP", 
        excerpt: "How a modern PHP developer handles enterprise-level data structures.", 
        date: "2024-03-20", 
        author: "Lead Developer" 
      },
      { 
        id: 2, 
        title: "Minimalism in Code and Design", 
        excerpt: "Exploring the intersection of clean PHP logic and sparse user interfaces.", 
        date: "2024-03-18", 
        author: "Design Strategist" 
      }
    ]);
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
