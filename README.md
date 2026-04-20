# Minimalist PHP & React Blog System

A high-fidelity, architectural blog system featuring a React frontend with a "Natural Tones" aesthetic and a robust PHP/MySQL backend architecture.

## 🏛️ Architectural Overview
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (Lucide Icons).
- **Backend (Intended)**: PHP 8.1+, PDO (Secure Queries), PSR Compliance.
- **Database**: MySQL 8.0+.
- **Design Theme**: "Natural Tones" (Earthy palette, serif typography).

---

## 🚀 Local Setup Guide (Laragon / XAMPP)

Follow these steps to deploy the complete system on your local machine.

### 1. Prerequisites
- **Laragon** (Recommended) or **XAMPP**.
- **Node.js & npm** (To build the frontend).
- **PHP 8.1+** and **MySQL**.

### 2. File Placement
1. Create a new directory in your web root (e.g., `C:\laragon\www\minimalist-blog`).
2. Copy all project files from this repository into that folder.

### 3. Database Activation
1. Open your database manager (HeidiSQL, phpMyAdmin).
2. Create a new database named `blog_system`.
3. Import the provided `database.sql` file located in the project root. This file contains the complete schema for Users, Categories, Posts, Comments, and Reactions.

### 4. Backend Configuration
1. Open `config/db.php`.
2. Ensure your credentials match your local environment:
   ```php
   $host = 'localhost';
   $db   = 'blog_system';
   $user = 'root';
   $pass = ''; // Leave empty for default Laragon/XAMPP
   ```

### 5. Frontend Build (React Integration)
Since this is a decoupled architecture, you must build the React assets so the PHP server can serve them.
1. Open your terminal in the project root.
2. Install dependencies: `npm install`
3. Generate the production assets: `npm run build`
4. This creates a `dist/` folder. Your web server can now serve these static files.

### 6. API Bridge
In this preview environment, we use a Node.js API (`server.ts`) for speed. For your local PHP setup:
- The React frontend makes calls to `/api/*`.
- You should configure your `public/index.php` to handle these routes or use a PHP router to point `/api/posts` etc., to the classes in `src/Models/`.

---

## 🛠️ Features
- **Public Feed**: Immersive, minimalist reading experience.
- **Single Journal View**: Dedicated pages with author bios and dialogue sections.
- **Dialogue System**: Functional commenting with approval states.
- **Admin Dashboard**: Full CRUD management of posts, comments, and site authors.
- **System Settings**: Real-time control over site identity and security parameters.

## 🎨 Design Philosophy
- **Colors**: `#fdfcfb` (Base), `#3d3d2f` (Ink), `#a68a64` (Accent).
- **Typography**: Inter (UI), Libre Baskerville (Editorial content).
- **Spacing**: Generous, rhythmic whitespace for architectural clarity.

---

*Curated for enthusiasts of clean design and elegant code.*
