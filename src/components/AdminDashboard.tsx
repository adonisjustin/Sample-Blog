import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Users, MessageSquare, Settings, LogOut, ChevronRight, BarChart3, Edit, Trash2, Save, X, Globe, Bell, Shield, Database } from 'lucide-react';
import { getPosts, createPost, updatePost, deletePost, Post } from '../config/db';

type View = 'dashboard' | 'posts' | 'edit-post' | 'comments' | 'authors' | 'settings';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  const [siteSettings, setSiteSettings] = useState({
    title: 'Post.',
    description: 'A minimalist exploration of web architecture.',
    primaryColor: '#5a5a40',
    allowComments: true,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    const postData = await getPosts();
    setPosts(postData);
    
    if (view === 'comments') {
      const res = await fetch('/api/admin/comments');
      const data = await res.json();
      setComments(data);
    }
    
    if (view === 'authors') {
      const res = await fetch('/api/posts');
      const data = await res.json();
      const uniqueAuthors = Array.from(new Set(data.map((p: any) => p.author?.id))).map(id => data.find((p: any) => p.author?.id === id).author);
      setAuthors(uniqueAuthors);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to exit the admin chamber?")) {
      navigate('/');
    }
  };

  const handleApproveComment = async (id: number) => {
    await fetch(`/api/comments/${id}/approve`, { method: 'PATCH' });
    fetchData();
  };

  const handleDeleteComment = async (id: number) => {
    if (confirm("Delete this comment?")) {
      await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setView('edit-post');
  };

  const handleCreate = () => {
    setEditingPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Uncategorized',
      authorId: 1 // Default admin
    } as any);
    setView('edit-post');
  };

  const savePost = async () => {
    if (!editingPost) return;
    setIsSaving(true);
    try {
      if (editingPost.id) {
        await updatePost(editingPost.id, editingPost);
      } else {
        await createPost(editingPost);
      }
      setView('dashboard');
      fetchData();
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this post permanently?")) {
      await deletePost(id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-natural-surface flex">
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
          <AdminNavItem icon={<FilePlus size={18} />} label="New Post" active={view === 'edit-post' && !editingPost?.id} onClick={handleCreate} />
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
              {view === 'authors' && "Team Archive"}
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
                {posts.map(post => (
                  <div key={post.id} className="px-8 py-6 flex items-center justify-between hover:bg-natural-surface/20 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-natural-surface rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold text-natural-muted group-hover:bg-natural-accent group-hover:text-white transition-colors">
                        <span>MAR</span>
                        <span className="text-lg leading-none">20</span>
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
                ))}
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
                  <label className="text-[10px] uppercase font-bold text-natural-muted tracking-widest">Post Slug</label>
                  <input
                    type="text"
                    value={editingPost.slug}
                    onChange={e => setEditingPost({...editingPost, slug: e.target.value})}
                    className="w-full bg-natural-surface border border-natural-border rounded-2xl px-6 py-4 text-natural-ink focus:outline-none focus:ring-1 focus:ring-natural-accent/20"
                    placeholder="post-url-slug"
                  />
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
                <h3 className="font-serif text-2xl font-bold text-[#3d3d2f]">Security & Data</h3>
              </div>
              <div className="flex items-center justify-between p-6 bg-natural-surface rounded-3xl border border-natural-border mb-4">
                <div>
                  <h4 className="text-sm font-bold text-natural-ink mb-1">Interaction Permissions</h4>
                  <p className="text-xs text-natural-muted">Allow visitors to submit entries to the Dialogue archive.</p>
                </div>
                <button 
                  onClick={() => setSiteSettings({...siteSettings, allowComments: !siteSettings.allowComments})}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${siteSettings.allowComments ? 'bg-natural-accent' : 'bg-natural-muted'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.allowComments ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-6 bg-natural-surface rounded-3xl border border-natural-border">
                <div>
                  <h4 className="text-sm font-bold text-natural-ink mb-1">Maintenance Seal</h4>
                  <p className="text-xs text-natural-muted">Privatize the Journal for architectural refinements.</p>
                </div>
                <button 
                   onClick={() => setSiteSettings({...siteSettings, maintenanceMode: !siteSettings.maintenanceMode})}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${siteSettings.maintenanceMode ? 'bg-natural-accent' : 'bg-natural-muted'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </section>

            <button className="px-12 py-5 bg-natural-accent text-white rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-xl shadow-natural-accent/20 transition-all flex items-center gap-3">
              <Database size={18} />
              Commit Changes
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
