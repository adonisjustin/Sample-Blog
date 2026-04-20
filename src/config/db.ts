// Database configuration (Post-PHP transition)
// Using a clean interface for data access

export interface Comment {
  id: number;
  author_name: string;
  content: string;
  date: string;
}

export interface Author {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar_url?: string;
}

export interface Post {
  id: number;
  user_id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  author: Author;
  category: string;
  reactions: number;
  comments: Comment[];
}

export const dbConfig = {
  host: "localhost",
  user: "admin",
  database: "blog_db"
};

export const getPosts = async (): Promise<Post[]> => {
  const response = await fetch('/api/posts');
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

export const createPost = async (post: Partial<Post>) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  return response.json();
};

export const updatePost = async (id: number, post: Partial<Post>) => {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  return response.json();
};

export const deletePost = async (id: number) => {
  await fetch(`/api/posts/${id}`, { method: 'DELETE' });
};

export const getAuthors = async (): Promise<Author[]> => {
  const response = await fetch('/api/authors');
  return response.json();
};

export const createAuthor = async (author: Partial<Author>) => {
  const response = await fetch('/api/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(author),
  });
  return response.json();
};

export const getSettings = async () => {
  const response = await fetch('/api/settings');
  return response.json();
};

export const updateSettings = async (settings: any) => {
  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return response.json();
};

export const reactToPost = async (id: number) => {
  const response = await fetch(`/api/posts/${id}/react`, { method: 'POST' });
  return response.json();
};

export const createComment = async (post_id: number, comment: { author_name: string, content: string }) => {
  const response = await fetch(`/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...comment, post_id }),
  });
  return response.json();
};
