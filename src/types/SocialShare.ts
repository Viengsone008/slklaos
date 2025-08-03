export interface SocialShare {
  id: string;
  post_id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  status: 'pending' | 'completed' | 'failed';
  content: {
    title: string;
    excerpt?: string;
    image_url?: string;
    post_url: string;
    tags?: string[];
  };
  platform_post_id?: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface EmailNotification {
  id: string;
  post_id: string;
  recipient_count: number;
  status: 'pending' | 'completed' | 'failed';
  content: {
    title: string;
    excerpt?: string;
    image_url?: string;
    post_url: string;
    author?: string;
    published_at?: string;
  };
  success_count: number;
  error_count: number;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}