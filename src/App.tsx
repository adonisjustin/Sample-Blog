/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, Menu, Github } from 'lucide-react';
import { getPosts, Post } from './config/db';
import GeminiChatbot from './components/GeminiChatbot';
import SinglePost from './components/SinglePost';
import AdminDashboard from './components/AdminDashboard';

function HomeFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/50 backdrop-blur-md z-40 border-b border-natural-border">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-natural-accent rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white rotate-45" />
              </div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-[#4a4a38]">Post.</h1>
            </div>
            <div className="hidden md:flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-natural-muted">
              <Link to="/" className="text-natural-accent border-b-2 border-natural-accent pb-1">Journal</Link>
              <Link to="/admin" className="hover:text-natural-accent transition-colors">Admin Panel</Link>
              <Link to="/philosophy" className="hover:text-natural-accent transition-colors">Philosophy</Link>
              <Link to="/archive" className="hover:text-natural-accent transition-colors">Archive</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-natural-surface rounded-full transition-colors text-natural-muted"><Search size={18} /></button>
            <button className="p-2 hover:bg-natural-surface rounded-full transition-colors md:hidden text-natural-muted"><Menu size={18} /></button>
            <div className="hidden md:block w-px h-6 bg-natural-border mx-2" />
            <a href="https://github.com" target="_blank" className="p-2 hover:bg-natural-surface rounded-full transition-colors text-natural-muted"><Github size={18} /></a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[11px] font-bold text-[#a68a64] uppercase tracking-widest block mb-6">Volume 01 — 2024</span>
          <h2 className="font-serif text-6xl md:text-8xl font-bold tracking-tight mb-12 leading-[1.1] text-[#3d3d2f]">
            Thinking <br />
            <span className="italic text-natural-accent/20">In</span> Bytes.
          </h2>
          <p className="max-w-xl text-lg text-natural-muted leading-relaxed">
            A minimalist exploration of web architecture, clean design, and the evolving relationship between developers and AI.
          </p>
        </motion.div>
      </header>

      {/* Blog Feed */}
      <main className="max-w-4xl mx-auto px-6 pb-48">
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-black/5 rounded-3xl animate-pulse" />
            ))
          ) : (
            posts.map((post, index) => (
              <Link to={`/post/${post.slug}`} key={post.id}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group blog-card cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-natural-muted/60">
                        <span>{post.category}</span>
                        <span className="w-1 h-1 bg-natural-border rounded-full" />
                        <span>{post.date}</span>
                      </div>
                      <h3 className="font-serif text-3xl font-bold group-hover:italic transition-all duration-300 text-[#3d3d2f] group-hover:text-natural-accent">
                        {post.title}
                      </h3>
                      <p className="text-natural-muted leading-relaxed max-w-2xl">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full border border-natural-border flex items-center justify-center group-hover:bg-natural-accent group-hover:text-white group-hover:border-natural-accent transition-all text-natural-muted">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-16 border-t border-natural-border flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-natural-muted">
          <p>© 2024 Post System. Minimalist Blog Architecture.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-natural-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-natural-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-natural-accent transition-colors">RSS</a>
          </div>
        </footer>
      </main>

      {/* AI Assistant */}
      <GeminiChatbot />
    </div>
  );
}

function PhilosophyPage() {
  const principles = [
    { title: "Essentialism", desc: "Removing the superfluous to reveal the architectural soul of the digital experience." },
    { title: "Natural Tones", desc: "A palette derived from earth and stone, grounding high-tech bytes in organic reality." },
    { title: "Human Centric", desc: "Codes that breathe. Interfaces that respect the user's focus and finite attention." }
  ];

  return (
    <div className="min-h-screen bg-natural-bg font-sans">
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/50 backdrop-blur-md z-40 border-b border-natural-border">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-natural-accent rounded-lg flex items-center justify-center text-white font-bold">P.</div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-[#4a4a38]">Manifesto</h1>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-40 pb-32">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-24">
          <header>
            <h2 className="font-serif text-6xl font-bold text-[#3d3d2f] mb-8 leading-tight">The Principles of Minimalist Architecture.</h2>
            <p className="text-xl text-natural-muted leading-relaxed">Our philosophy is built on the belief that code should be as enduring as concrete and as elegant as a drafted blueprint.</p>
          </header>

          <div className="space-y-16">
            {principles.map((p, i) => (
              <div key={i} className="group border-l-2 border-natural-border pl-12 py-4 hover:border-natural-accent transition-colors">
                <span className="text-[10px] font-bold text-natural-accent uppercase tracking-widest block mb-4">Principle 0{i + 1}</span>
                <h3 className="font-serif text-3xl font-bold text-[#3d3d2f] mb-4 group-hover:italic transition-all">{p.title}</h3>
                <p className="text-natural-muted leading-relaxed max-w-lg">{p.desc}</p>
              </div>
            ))}
          </div>

          <Link to="/" className="inline-flex items-center gap-3 text-sm font-bold text-natural-accent uppercase tracking-widest hover:gap-5 transition-all">
            Return to Journal <ArrowRight size={18} />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

function ArchivePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  
  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  return (
    <div className="min-h-screen bg-natural-bg font-sans">
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/50 backdrop-blur-md z-40 border-b border-natural-border">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-natural-surface rounded-lg flex items-center justify-center text-natural-muted font-bold">A.</div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-[#4a4a38]">Archive</h1>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
        <div className="mb-20">
          <h2 className="font-serif text-5xl font-bold text-[#3d3d2f] mb-6 tracking-tight">The Library of Thought.</h2>
          <p className="text-natural-muted text-lg">A complete chronological index of all digital explorations.</p>
        </div>

        <div className="space-y-12">
          {posts.map((post) => (
            <Link to={`/post/${post.slug}`} key={post.id} className="block group">
              <div className="flex items-baseline justify-between border-b border-natural-border pb-8">
                <div className="flex gap-12 items-baseline">
                  <span className="text-[10px] uppercase font-bold text-natural-accent tracking-widest">{post.date}</span>
                  <h3 className="font-serif text-2xl font-bold text-natural-ink group-hover:text-natural-accent transition-colors">{post.title}</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-natural-muted hidden md:block">{post.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeFeed />} />
        <Route path="/post/:slug" element={<SinglePost />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/philosophy" element={<PhilosophyPage />} />
        <Route path="/archive" element={<ArchivePage />} />
      </Routes>
    </Router>
  );
}

