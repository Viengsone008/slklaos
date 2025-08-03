export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  source: string;
  preferences: {
    news?: boolean;
    projects?: boolean;
    announcements?: boolean;
    blog?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SubscriberFormData {
  email: string;
  preferences?: {
    news?: boolean;
    projects?: boolean;
    announcements?: boolean;
    blog?: boolean;
  };
  source?: string;
}