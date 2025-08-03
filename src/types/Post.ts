export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'news' | 'project' | 'announcement' | 'blog';
  status: 'draft' | 'published' | 'scheduled';
  featuredImage?: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: Post['category'];
  status: Post['status'];
  featuredImage?: string;
  tags: string[];
  scheduledAt?: string;
}