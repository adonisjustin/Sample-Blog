# Developer Blog System - Local Setup Guide (Laragon)

This professional PHP & React blog system is designed with a clean separation of concerns. This guide will help you set it up locally using **Laragon** (or any WAMP/LAMP stack).

## 1. Prerequisites
- **Laragon Full** (Recommended) or Laragon Lite.
- **Node.js & NPM** (For the React frontend).
- **Composer** (Optional, for PHP dependency management if you expand the system).

## 2. Laragon Setup
1. **Move Project**: Move this entire folder into your Laragon `www` directory (e.g., `C:\laragon\www\blog-system`).
2. **Virtual Host**: Laragon will automatically detect the folder and create a virtual host like `http://blog-system.test`. 
   - *Note: Ensure Laragon's "Auto-create Virtual Hosts" is enabled in settings.*
3. **Restart Laragon**: Click "Reload" or "Stop" and "Start All" to initialize the new virtual host.

## 3. Database Configuration
1. **Create Database**: Open **HeidiSQL** (included with Laragon) or phpMyAdmin.
2. **New DB**: Create a new database named `blog_system`.
3. **Import Data**: Execute the following SQL to create the posts table:
   ```sql
   CREATE TABLE `posts` (
     `id` INT AUTO_INCREMENT PRIMARY KEY,
     `title` VARCHAR(255) NOT NULL,
     `excerpt` TEXT,
     `content` LONGTEXT,
     `author` VARCHAR(100),
     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   INSERT INTO `posts` (title, excerpt, content, author) VALUES 
   ('Architecting for Scale in PHP', 'Modern PHP patterns...', 'Full content here...', 'Lead Dev'),
   ('Natural Design Tones', 'Minimalist UI principles...', 'Full content here...', 'Designer');
   ```
4. **Verify Config**: Open `config/db.php` and ensure the credentials match your local MySQL settings (default Laragon is usually `root` with no password).

## 4. Frontend Setup
This project uses **React + Vite**. You have two options for running it:

### Option A: Development Mode (Recommended for edits)
1. Open a terminal in the project root.
2. Run `npm install` to install dependencies.
3. Run `npm run dev`.
4. The frontend will be available at `http://localhost:3000` (or 5173).

### Option B: Production Build (PHP Serving Static Files)
1. Run `npm run build`.
2. This generates a `dist/` folder.
3. In your PHP entry point (`public/index.php`), you can configure it to serve the static files from `dist/` or move the `dist` contents to your web root.

## 5. Connecting PHP + React
In development, Vite proxies API requests to your PHP server.
- Ensure the `server.ts` or Vite config points to your local `.test` domain for API calls.

## 6. Architecture Overview
- **/config**: Database and core settings.
- **/public**: Web-accessible entry points (PHP index).
- **/src**: React components and frontend logic.
- **/src/Models**: PHP Model classes (following PSR standards).

---
*Created by the Senior PHP Architect Assistant.*
