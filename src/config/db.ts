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
  bio: string;
  avatar_url?: string;
}

export interface Post {
  id: number;
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

export const reactToPost = async (id: number) => {
  const response = await fetch(`/api/posts/${id}/react`, { method: 'POST' });
  return response.json();
};

export const createComment = async (postId: number, comment: { author_name: string, content: string }) => {
  const response = await fetch(`/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...comment, postId }),
  });
  return response.json();
};
