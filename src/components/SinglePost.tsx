import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Heart, Share2, User } from 'lucide-react';
import { getPosts, reactToPost, createComment, Post } from '../config/db';

export default function SinglePost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    getPosts().then(data => {
      const found = data.find(p => p.slug === slug);
      setPost(found || null);
      setLoading(false);
    });
  }, [slug]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const { reactions } = await reactToPost(post.id);
      setPost({ ...post, reactions });
    } catch (error) {
      console.error("Like error", error);
    }
  };

  const handleComment = async () => {
    if (!post || !commentText.trim()) return;
    try {
      const newComment = await createComment(post.id, { 
        author_name: "Guest Explorer", 
        content: commentText 
      });
      setPost({ ...post, comments: [...post.comments, newComment] });
      setCommentText('');
    } catch (error) {
      console.error("Comment error", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl animate-pulse">Loading Story...</div>;
  if (!post) return <div className="min-h-screen flex flex-col items-center justify-center font-serif text-[#3d3d2f]">Post not found. <Link to="/" className="mt-4 text-natural-accent underline">Return home</Link></div>;

  return (
    <div className="min-h-screen bg-natural-bg pb-32">
      {/* Back Nav */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-natural-bg/80 backdrop-blur-md z-40 border-b border-natural-border">
        <div className="max-w-3xl mx-auto px-6 h-full flex items-center">
          <Link to="/" className="flex items-center gap-2 text-natural-muted hover:text-natural-accent transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Back to Journal</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-32">
        <header className="mb-16">
          <div className="flex items-center gap-3 text-[11px] font-bold text-[#a68a64] uppercase tracking-widest mb-6">
            <span>{post.category}</span>
            <span className="w-1 h-1 bg-natural-border rounded-full" />
            <span>{post.date}</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-[#3d3d2f]">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 py-8 border-y border-natural-border">
            <div className="w-12 h-12 bg-natural-surface rounded-2xl flex items-center justify-center text-natural-muted">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
              ) : (
                <User size={24} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-natural-ink">{post.author?.username || 'Architect'}</p>
              <p className="text-[10px] text-natural-muted uppercase tracking-wider">{post.author?.bio || 'Minimalist Writer'}</p>
            </div>
          </div>
        </header>

        <div className="text-lg text-natural-ink/80 leading-relaxed font-medium mb-20 space-y-6">
          <p>{post.content}</p>
        </div>

        {/* Reaction Bar */}
        <div className="flex items-center justify-between py-6 border-y border-natural-border">
          <div className="flex gap-8">
            <button onClick={handleLike} className="flex items-center gap-2 text-natural-muted hover:text-red-500 transition-colors group">
              <Heart size={20} className="group-active:scale-125 transition-transform" />
              <span className="text-xs font-bold">{post.reactions}</span>
            </button>
            <button className="flex items-center gap-2 text-natural-muted hover:text-natural-accent transition-colors">
              <MessageCircle size={20} />
              <span className="text-xs font-bold">{post.comments?.length || 0}</span>
            </button>
          </div>
          <button className="text-natural-muted hover:text-natural-accent transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* Comments Section */}
        <section className="mt-20">
          <h3 className="font-serif text-3xl font-bold mb-10 text-[#3d3d2f]">Dialogue</h3>
          
          <div className="space-y-12">
            {post.comments?.map(comment => (
              <div key={comment.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-natural-ink uppercase tracking-wider">{comment.author_name}</span>
                  <span className="text-[10px] text-natural-muted uppercase font-bold">{comment.date}</span>
                </div>
                <p className="bg-natural-surface p-6 rounded-3xl text-sm leading-relaxed text-natural-ink/70 border border-natural-border shadow-sm">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-natural-surface p-8 rounded-[40px] border border-natural-border shadow-inner">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-natural-muted mb-6">Leave a comment</h4>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Join the discussion..."
              className="w-full h-32 bg-white border border-natural-border rounded-3xl p-6 focus:outline-none focus:ring-2 focus:ring-natural-accent/10 transition-all text-sm mb-4 resize-none shadow-sm"
            />
            <button onClick={handleComment} className="px-8 py-3 bg-natural-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-30">
              Publish Comment
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
