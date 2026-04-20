// Database configuration (Post-PHP transition)
// Using a clean interface for data access

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  author: string;
}

export const dbConfig = {
  // In a production app, these would be env vars
  host: "localhost",
  user: "admin",
  database: "blog_db"
};

// Mock data service
export const getPosts = async (): Promise<Post[]> => {
  return [
    {
      id: 1,
      title: "The Essence of Clean Design",
      content: "Typography and whitespace are the foundation of a minimalist interface.",
      excerpt: "Why whitespace is your most powerful tool.",
      date: "2024-03-20",
      author: "Senior Dev"
    },
    {
      id: 2,
      title: "From PHP to Modern Full-Stack",
      content: "Transitioning patterns from server-rendered PHP to modern reactive stacks.",
      excerpt: "Applying clean architectural principles across languages.",
      date: "2024-03-18",
      author: "Senior Dev"
    }
  ];
};
