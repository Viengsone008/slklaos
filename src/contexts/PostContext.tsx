"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Post, PostFormData } from '../types/Post';
import { useDatabase } from './DatabaseContext';
import { supabase } from '../lib/supabase';

interface PostContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  addPost: (post: PostFormData) => Promise<void>;
  updatePost: (id: string, postData: PostFormData) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  getPublishedPosts: () => Post[];
  getScheduledPosts: () => Post[];
  getPostsByCategory: (category: Post['category']) => Post[];
  checkScheduledPosts: () => void;
  refreshPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

interface PostProviderProps {
  children: ReactNode;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Get database context with fallback
  let subscribeToChanges: any;
  let broadcastChange: any;
  
  try {
    const dbContext = useDatabase();
    subscribeToChanges = dbContext?.subscribeToChanges;
    broadcastChange = dbContext?.broadcastChange;
  } catch (err) {
    console.warn('DatabaseContext not available, running without real-time sync');
  }

  // Client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load posts with error handling
  const loadPosts = useCallback(async () => {
    if (!isClient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch posts: ${fetchError.message}`);
      }
      
      if (data) {
        setPosts(data);
        console.log('✅ Posts loaded successfully:', data.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Failed to load posts:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  // Setup real-time synchronization
  const setupRealTimeSync = useCallback(() => {
    if (!isClient || !subscribeToChanges) {
      return () => {}; // Return empty cleanup function
    }

    try {
      return subscribeToChanges((records: any[]) => {
        const postRecords = records.filter(record => record.type === 'posts');
        if (postRecords.length > 0) {
          console.log('🔄 Syncing posts from real-time updates');
          loadPosts();
        }
      });
    } catch (err) {
      console.warn('Failed to setup real-time sync:', err);
      return () => {}; // Return empty cleanup function
    }
  }, [isClient, subscribeToChanges, loadPosts]);

  // Check and update scheduled posts
  const checkScheduledPosts = useCallback(() => {
    if (!isClient || posts.length === 0) return;

    const now = new Date();
    let hasChanges = false;
    
    const updatedPosts = posts.map(post => {
      if (post.status === 'scheduled' && post.scheduledAt) {
        const scheduledTime = new Date(post.scheduledAt);
        if (scheduledTime <= now) {
          hasChanges = true;
          return {
            ...post,
            status: 'published' as const,
            publishedAt: now.toISOString()
          };
        }
      }
      return post;
    });

    if (hasChanges) {
      setPosts(updatedPosts);
      
      // Broadcast changes if available
      if (broadcastChange) {
        try {
          broadcastChange(
            {
              id: 'posts-scheduled-update',
              type: 'posts',
              data: updatedPosts,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              version: 1
            },
            'update'
          );
        } catch (err) {
          console.warn('Failed to broadcast scheduled post changes:', err);
        }
      }
      
      console.log('✅ Scheduled posts updated');
    }
  }, [isClient, posts, broadcastChange]);

  // Initialize context
  useEffect(() => {
    if (!isClient) return;

    let unsubscribe: (() => void) | undefined;
    let interval: NodeJS.Timeout | undefined;

    const initialize = async () => {
      await loadPosts();
      unsubscribe = setupRealTimeSync();
      
      // Check scheduled posts every minute
      interval = setInterval(checkScheduledPosts, 60000);
    };

    initialize();

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.warn('Error during cleanup:', err);
        }
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isClient, loadPosts, setupRealTimeSync, checkScheduledPosts]);

  // Add new post
  const addPost = useCallback(async (postData: PostFormData) => {
    if (!isClient) return;

    try {
      setError(null);
      
      // Generate UUID safely for client-side
      const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        // Fallback for environments without crypto.randomUUID
        return 'post-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      };

      const newPost: Post = {
        id: generateId(),
        ...postData,
        author: postData.author || 'SLK Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: postData.status === 'published' ? new Date().toISOString() : undefined,
        scheduledAt: postData.status === 'scheduled' ? postData.scheduledAt : undefined
      };

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from('posts')
        .insert([newPost]);

      if (insertError) {
        throw new Error(`Failed to create post: ${insertError.message}`);
      }

      // Update local state
      setPosts(prev => [newPost, ...prev]);

      // Broadcast change if available
      if (broadcastChange) {
        try {
          broadcastChange({
            id: 'posts-add',
            type: 'posts',
            data: newPost,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            version: 1
          }, 'insert');
        } catch (err) {
          console.warn('Failed to broadcast post addition:', err);
        }
      }

      console.log('✅ Post added successfully:', newPost.title);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add post';
      console.error('❌ Error adding post:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw for component error handling
    }
  }, [isClient, broadcastChange]);

  // Update existing post
  const updatePost = useCallback(async (id: string, postData: PostFormData) => {
    if (!isClient) return;

    try {
      setError(null);
      
      const existing = posts.find(p => p.id === id);
      if (!existing) {
        throw new Error('Post not found');
      }

      const updatedPost: Post = {
        ...existing,
        ...postData,
        updatedAt: new Date().toISOString(),
        scheduledAt: postData.status === 'scheduled' ? postData.scheduledAt : undefined,
        publishedAt: postData.status === 'published' && !existing.publishedAt 
          ? new Date().toISOString() 
          : existing.publishedAt
      };

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('posts')
        .update(updatedPost)
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to update post: ${updateError.message}`);
      }

      // Update local state
      const updatedPosts = posts.map(p => (p.id === id ? updatedPost : p));
      setPosts(updatedPosts);

      // Broadcast change if available
      if (broadcastChange) {
        try {
          broadcastChange({
            id: 'posts-update',
            type: 'posts',
            data: updatedPost,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            version: 1
          }, 'update');
        } catch (err) {
          console.warn('Failed to broadcast post update:', err);
        }
      }

      console.log('✅ Post updated successfully:', id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      console.error('❌ Error updating post:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw for component error handling
    }
  }, [isClient, posts, broadcastChange]);

  // Delete post
  const deletePost = useCallback(async (id: string) => {
    if (!isClient) return;

    try {
      setError(null);
      
      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Failed to delete post: ${deleteError.message}`);
      }

      // Update local state
      const updatedPosts = posts.filter(p => p.id !== id);
      setPosts(updatedPosts);

      // Broadcast change if available
      if (broadcastChange) {
        try {
          broadcastChange({
            id: 'posts-delete',
            type: 'posts',
            data: { id },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            version: 1
          }, 'delete');
        } catch (err) {
          console.warn('Failed to broadcast post deletion:', err);
        }
      }

      console.log('✅ Post deleted successfully:', id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      console.error('❌ Error deleting post:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw for component error handling
    }
  }, [isClient, posts, broadcastChange]);

  // Utility functions
  const getPost = useCallback((id: string) => {
    return posts.find(p => p.id === id);
  }, [posts]);

  const getPublishedPosts = useCallback(() => {
    return posts.filter(p => p.status === 'published');
  }, [posts]);

  const getScheduledPosts = useCallback(() => {
    return posts.filter(p => p.status === 'scheduled');
  }, [posts]);

  const getPostsByCategory = useCallback((category: Post['category']) => {
    return posts.filter(p => p.category === category && p.status === 'published');
  }, [posts]);

  // Refresh posts manually
  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  const value: PostContextType = {
    posts,
    isLoading,
    error,
    addPost,
    updatePost,
    deletePost,
    getPost,
    getPublishedPosts,
    getScheduledPosts,
    getPostsByCategory,
    checkScheduledPosts,
    refreshPosts
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

// Higher-order component for pages that need post data
export const withPostProvider = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <PostProvider>
      <Component {...props} />
    </PostProvider>
  );
  
  WrappedComponent.displayName = `withPostProvider(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
