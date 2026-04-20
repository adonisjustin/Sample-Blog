import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Users, MessageSquare, Settings, LogOut, ChevronRight, BarChart3, Edit, Trash2, Save, X, Globe, Bell, Shield, Database, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPosts, createPost, updatePost, deletePost, getAuthors, createAuthor, getSettings, updateSettings, Post, Author } from '../config/db';

type View = 'dashboard' | 'posts' | 'edit-post' | 'comments' | 'authors' | 'edit-author' | 'settings';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [comments, setComments] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [siteSettings, setSiteSettings] = useState({
    title: 'Post.',
    description: 'A minimalist exploration of web architecture.',
    primaryColor: '#5a5a40',
    allowComments: true,
    maintenanceMode: false,
    privacyPolicy: '',
    termsOfService: '',
    rssContent: '',
    philosophy: ''
  });

  useEffect(() => {
    fetchData();
  }, [view]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    try {
      const postData = await getPosts();
      setPosts(postData);
      
      const authorData = await getAuthors();
      setAuthors(authorData);

      const settingsData = await getSettings();
      if (settingsData && Object.keys(settingsData).length > 0) {
        setSiteSettings({
          ...siteSettings,
          ...settingsData,
          allowComments: settingsData.allowComments === '1' || settingsData.allowComments === true,
          maintenanceMode: settingsData.maintenanceMode === '1' || settingsData.maintenanceMode === true,
        });
      }
      
      if (view === 'comments') {
        const res = await fetch('/api/comments');
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      }
    } catch (err) {
      console.error("Data fetch error", err);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to exit the admin chamber?")) {
      navigate('/');
    }
  };

  const handleApproveComment = async (id: number) => {
    try {
      await fetch(`/api/comments/${id}/approve`, { method: 'PATCH' });
      addToast("Dialogue entry approved.");
      fetchData();
    } catch (err) {
      addToast("Failed to approve entry.", "error");
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (confirm("Delete this comment?")) {
      try {
        await fetch(`/api/comments/${id}`, { method: 'DELETE' });
        addToast("Dialogue entry purged.");
        fetchData();
      } catch (err) {
        addToast("Failed to delete entry.", "error");
      }
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setView('edit-post');
    addToast("Loading architectural blueprint for editing...");
  };

  const handleCreate = () => {
    setEditingPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Architecture',
      authorId: 1
    } as any);
    setView('edit-post');
    addToast("Preparing a new architectural draft.");
  };

  const savePost = async () => {
    if (!editingPost || !editingPost.title || !editingPost.content) {
      addToast("Architecture requires a title and content.", "error");
      return;
    }
    setIsSaving(true);
    try {
      if (editingPost.id) {
        await updatePost(editingPost.id, editingPost);
        addToast("Journal entry architectural refinements saved.");
      } else {
        await createPost(editingPost);
        addToast("New architectural journal published successfully.");
      }
      setView('dashboard');
      fetchData();
    } catch (error) {
      addToast("Critical failure during architectural save.", "error");
      console.error("Save error", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this post permanently?")) {
      try {
        await deletePost(id);
        addToast("Architectural record deleted.");
        fetchData();
      } catch (err) {
        addToast("Failed to delete record.", "error");
      }
    }
  };

  const handleCommitSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings(siteSettings);
      addToast("System configuration successfully committed.");
    } catch (err) {
      addToast("Failed to commit settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author);
    setView('edit-author');
    addToast("Accessing contributor profile blueprint...");
  };

  const handleCreateAuthor = () => {
    setEditingAuthor({
      username: '',
      email: '',
      bio: '',
      avatar_url: ''
    } as any);
    setView('edit-author');
    addToast("Drafting new contributor profile...");
  };

  const saveAuthor = async () => {
    if (!editingAuthor || !editingAuthor.username || !editingAuthor.email) {
      addToast("Profile requires at least a username and email.", "error");
      return;
    }
    setIsSaving(true);
    try {
      if (editingAuthor.id) {
        // Logic for update author if implemented
        await fetch(`/api/authors/${editingAuthor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingAuthor)
        });
        addToast("Contributor profile updated.");
      } else {
        await createAuthor(editingAuthor);
        addToast("New contributor registered successfully.");
      }
      setView('authors');
      fetchData();
    } catch (error) {
      addToast("Failed to save profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-surface flex">
      {/* Toast System */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
                toast.type === 'success' 
                  ? 'bg-white/90 border-natural-accent text-natural-ink' 
                  : 'bg-red-50/90 border-red-200 text-red-800'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={18} className="text-natural-accent" /> : <AlertCircle size={18} className="text-red-500" />}
              <span className="text-xs font-bold tracking-tight">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-natural-bg border-r border-natural-border flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-natural-accent rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white rotate-45" />
          </div>
          <h1 className="font-serif text-lg font-bold">Admin.</h1>
        </div>

        <nav className="space-y-1">
          <AdminNavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <AdminNavItem icon={<FilePlus size={18} />} label="New Post" active={view === 'edit-post' && !editingPost?.id} onClick={() => { handleCreate(); setView('edit-post'); }} />
          <AdminNavItem icon={<MessageSquare size={18} />} label="Comments" active={view === 'comments'} onClick={() => setView('comments')} />
          <AdminNavItem icon={<Users size={18} />} label="Authors" active={view === 'authors'} onClick={() => setView('authors')} />
          <div className="pt-8 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-natural-muted px-4">System</span>
          </div>
          <AdminNavItem icon={<Settings size={18} />} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
          <AdminNavItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleLogout} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-serif text-4xl font-bold mb-2">
              {view === 'dashboard' && "Overview"}
              {view === 'edit-post' && (editingPost?.id ? "Edit Post" : "Create Post")}
              {view === 'comments' && "Dialogue Management"}
              {view === 'authors' && "Contributors"}
            </h2>
            <p className="text-sm text-natural-muted">Manage your minimalist architecture and journal.</p>
          </div>
          {view !== 'edit-post' && (
            <button onClick={handleCreate} className="px-6 py-3 bg-natural-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-lg shadow-natural-accent/20">
              Publish Post
            </button>
          )}
        </header>

        {view === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <StatCard icon={<BarChart3 />} label="Total Views" value="12.4k" color="text-natural-accent" />
              <StatCard icon={<MessageSquare />} label="Engagements" value="842" color="text-blue-500" />
              <StatCard icon={<Users />} label="Active Readers" value="156" color="text-green-600" />
            </div>

            {/* Post Management */}
            <div className="bg-natural-bg rounded-[40px] border border-natural-border overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-natural-border bg-natural-surface/30 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#3d3d2f]">Recent Posts</h3>
              </div>
              <div className="divide-y divide-natural-border">
                {posts.length > 0 ? posts.map(post => (
                  <div key={post.id} className="px-8 py-6 flex items-center justify-between hover:bg-natural-surface/20 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-natural-surface rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold text-natural-muted group-hover:bg-natural-accent group-hover:text-white transition-colors">
                        <span>{new Date(post.date || Date.now()).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                        <span className="text-lg leading-none">{new Date(post.date || Date.now()).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-serif text-xl font-bold text-[#3d3d2f] mb-1">{post.title}</h4>
                        <span className="px-2 py-0.5 bg-natural-surface text-[10px] font-bold uppercase tracking-tighter text-natural-muted rounded-md">{post.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleEdit(post)} className="p-2 text-natural-muted hover:text-natural-accent transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-2 text-natural-muted hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={18} className="text-natural-muted" />
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-natural-muted italic font-serif">The archive is currently empty. Start drafting your architecture.</div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'edit-post' && editingPost && (
          <div className="bg-natural-bg rounded-[40px] border border-natural-border p-10 shadow-sm max-w-4xl">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Post Title</label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                    placeholder="Enter journal title..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Contributor</label>
                  <select
                    value={editingPost.author?.id || 1}
                    onChange={e => setEditingPost({...editingPost, user_id: parseInt(e.target.value)})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  >
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>{author.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Excerpt</label>
                <textarea
                  value={editingPost.excerpt}
                  onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                  className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink h-24 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  placeholder="Sumarize your thoughts..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Main Content</label>
                <textarea
                  value={editingPost.content}
                  onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                  className="w-full bg-natural-surface border border-natural-border rounded-3xl px-6 py-6 text-natural-ink h-96 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20 font-serif leading-relaxed text-lg"
                  placeholder="Start writing..."
                />
              </div>

              <div className="flex gap-4 pt-8">
                <button
                  onClick={savePost}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-10 py-4 bg-natural-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? "Saving..." : "Save Journal"}
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 px-10 py-4 bg-natural-surface text-natural-muted border border-natural-border rounded-full text-xs font-bold uppercase tracking-widest hover:bg-natural-border transition-all"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'comments' && (
          <div className="bg-natural-bg rounded-[40px] border border-natural-border overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-natural-border bg-natural-surface/30 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#3d3d2f]">Dialogue Management</h3>
            </div>
            <div className="divide-y divide-natural-border">
              {comments.map(comment => (
                <div key={comment.id} className="px-8 py-6 flex items-center justify-between hover:bg-natural-surface/20 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-natural-surface rounded-xl flex items-center justify-center text-natural-muted font-bold text-xs uppercase">
                      {comment.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#3d3d2f]">{comment.author_name}</span>
                        {comment.status === 'pending' && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-bold uppercase rounded">Pending</span>}
                      </div>
                      <p className="text-sm text-natural-muted leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {comment.status === 'pending' && (
                      <button onClick={() => handleApproveComment(comment.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDeleteComment(comment.id)} className="p-2 text-natural-muted hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="p-12 text-center text-natural-muted italic font-serif">No dialogue tracks found.</div>}
            </div>
          </div>
        )}

        {view === 'authors' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-natural-bg p-8 rounded-[40px] border border-natural-border">
              <div>
                <h3 className="font-serif text-3xl font-bold text-[#3d3d2f]">Contributor Archive</h3>
                <p className="text-natural-muted text-sm mt-1">Manage the architects behind the journal entries.</p>
              </div>
              <button 
                onClick={handleCreateAuthor}
                className="flex items-center gap-2 px-8 py-3 bg-natural-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-natural-accent/20"
              >
                <UserPlus size={16} />
                Register Contributor
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {authors.map(author => (
                <div key={author.id} className="bg-natural-bg p-8 rounded-[40px] border border-natural-border group hover:border-natural-accent transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-natural-surface rounded-3xl overflow-hidden border border-natural-border">
                      {author.avatar_url ? (
                        <img src={author.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-natural-muted">{author.username.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl font-bold text-natural-ink">{author.username}</h4>
                      <p className="text-xs text-natural-muted font-bold uppercase tracking-widest mb-2 pb-1 border-b border-natural-border/50">{author.email}</p>
                      <p className="text-xs text-natural-ink/70 italic line-clamp-2">"{author.bio || 'Curating digital minimalism.'}"</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditAuthor(author)} className="p-3 bg-natural-surface text-natural-muted hover:text-natural-accent rounded-2xl transition-colors">
                        <Edit size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {authors.length === 0 && <div className="col-span-2 py-20 text-center font-serif italic text-natural-muted">No contributors have been registered in the system yet.</div>}
            </div>
          </div>
        )}

        {view === 'edit-author' && editingAuthor && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-serif text-4xl font-bold text-[#3d3d2f] mb-12">Author Profile Architecture</h3>
            
            <div className="space-y-8 bg-natural-bg p-10 rounded-[40px] border border-natural-border shadow-sm">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Display Username</label>
                  <input
                    type="text"
                    value={editingAuthor.username}
                    onChange={e => setEditingAuthor({...editingAuthor, username: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={editingAuthor.email}
                    onChange={e => setEditingAuthor({...editingAuthor, email: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Avatar Image URL</label>
                <input
                  type="text"
                  value={editingAuthor.avatar_url}
                  onChange={e => setEditingAuthor({...editingAuthor, avatar_url: e.target.value})}
                  className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Professional Bio</label>
                <textarea
                  value={editingAuthor.bio}
                  onChange={e => setEditingAuthor({...editingAuthor, bio: e.target.value})}
                  className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink h-32 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                />
              </div>

              <div className="flex gap-4 pt-8 border-t border-natural-border">
                <button
                  onClick={saveAuthor}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-10 py-4 bg-natural-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? "Publishing Profile..." : "Save Profile"}
                </button>
                <button
                  onClick={() => setView('authors')}
                  className="flex items-center gap-2 px-10 py-4 bg-natural-surface text-natural-muted border border-natural-border rounded-full text-xs font-bold uppercase tracking-widest hover:bg-natural-border transition-all"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl space-y-8">
            <section className="bg-natural-bg p-10 rounded-[40px] border border-natural-border shadow-sm">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-natural-border">
                <Globe className="text-natural-accent" size={24} />
                <h3 className="font-serif text-2xl font-bold text-[#3d3d2f]">General Configuration</h3>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Site Name</label>
                  <input
                    type="text"
                    value={siteSettings.title}
                    onChange={e => setSiteSettings({...siteSettings, title: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Accent Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={siteSettings.primaryColor}
                      onChange={e => setSiteSettings({...siteSettings, primaryColor: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                    />
                    <span className="text-xs font-mono font-bold text-natural-muted">{siteSettings.primaryColor}</span>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Meta Description</label>
                  <textarea
                    value={siteSettings.description}
                    onChange={e => setSiteSettings({...siteSettings, description: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink h-24 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>
              </div>
            </section>

            <section className="bg-natural-bg p-10 rounded-[40px] border border-natural-border shadow-sm">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-natural-border">
                <Shield className="text-natural-accent" size={24} />
                <h3 className="font-serif text-2xl font-bold text-[#3d3d2f]">Security & Legal</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-natural-surface rounded-3xl border border-natural-border mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-natural-ink mb-1">Interaction Permissions</h4>
                    <p className="text-xs text-natural-muted">Allow visitors to submit entries to the Dialogue archive.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newVal = !siteSettings.allowComments;
                      setSiteSettings({...siteSettings, allowComments: newVal});
                      addToast(newVal ? "Dialogue entries enabled." : "Dialogue entries restricted.");
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${siteSettings.allowComments ? 'bg-natural-accent' : 'bg-natural-muted'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.allowComments ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Privacy Policy Content</label>
                  <textarea
                    value={siteSettings.privacyPolicy}
                    onChange={e => setSiteSettings({...siteSettings, privacyPolicy: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink h-32 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Terms of Service Content</label>
                  <textarea
                    value={siteSettings.termsOfService}
                    onChange={e => setSiteSettings({...siteSettings, termsOfService: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink h-32 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>
              </div>
            </section>

            <section className="bg-natural-bg p-10 rounded-[40px] border border-natural-border shadow-sm">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-natural-border">
                <Database className="text-natural-accent" size={24} />
                <h3 className="font-serif text-2xl font-bold text-[#3d3d2f]">Feeds & Maintenance</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">RSS Feed Summary</label>
                  <textarea
                    value={siteSettings.rssContent}
                    onChange={e => setSiteSettings({...siteSettings, rssContent: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink h-24 resize-none focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-natural-surface rounded-3xl border border-natural-border">
                  <div>
                    <h4 className="text-sm font-bold text-natural-ink mb-1">Maintenance Seal</h4>
                    <p className="text-xs text-natural-muted">Privatize the Journal for architectural refinements.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newVal = !siteSettings.maintenanceMode;
                      setSiteSettings({...siteSettings, maintenanceMode: newVal});
                      addToast(newVal ? "Maintenance seal active." : "Maintenance seal lifted.");
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${siteSettings.maintenanceMode ? 'bg-natural-accent' : 'bg-natural-muted'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </section>

            <button 
              onClick={handleCommitSettings}
              disabled={isSaving}
              className="px-12 py-5 bg-natural-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-xl shadow-natural-accent/20 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <Database size={18} />
              {isSaving ? "Architectural Committing..." : "Commit Changes"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function AdminNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${active ? 'bg-natural-accent text-white shadow-lg shadow-natural-accent/20' : 'text-natural-muted hover:bg-natural-surface hover:text-natural-accent'}`}>
      {icon}
      <span className="tracking-widest uppercase">{label}</span>
      {active && <div className="ml-auto w-1 h-1 bg-white rounded-full" />}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-natural-bg p-8 rounded-[40px] border border-natural-border shadow-sm flex items-center gap-6">
      <div className={`w-12 h-12 rounded-2xl bg-natural-surface flex items-center justify-center opacity-70`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-natural-muted mb-1">{label}</p>
        <p className={`text-4xl font-serif font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
