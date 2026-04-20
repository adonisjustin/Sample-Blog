/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, Menu, Github } from 'lucide-react';
import { getPosts, Post } from './config/db';
import GeminiChatbot from './components/GeminiChatbot';

export default function App() {
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
              <a href="#" className="text-natural-accent border-b-2 border-natural-accent pb-1">Journal</a>
              <a href="#" className="hover:text-natural-accent transition-colors">Philosophy</a>
              <a href="#" className="hover:text-natural-accent transition-colors">Archive</a>
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
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group blog-card cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-natural-muted/60">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 bg-natural-border rounded-full" />
                      <span>{post.author}</span>
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

