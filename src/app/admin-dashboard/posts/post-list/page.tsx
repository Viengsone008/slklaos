"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Clock, Calendar, CheckCircle, Share2 } from 'lucide-react';
import { useSettings } from '../../../../contexts/SettingsContext';
import { useSocialShare } from '../../../../contexts/SocialShareContext';
import { Post } from '../../../../types/Post';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from "../../../../lib/supabase";

interface PostListProps {
  onCreatePost: () => void;
  onEditPost: (post: Post) => void;
}

const PostList: React.FC<PostListProps> = ({ onCreatePost, onEditPost }) => {
  const { settings, formatDate, formatTime } = useSettings();
  const { shareToAllPlatforms, sendEmailNotification, isSharing } = useSocialShare();

  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | Post['category']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch posts from Supabase (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching posts from Supabase...');
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Supabase fetch error:', error);
          toast.error('Failed to load posts from database.');
          
          // Fallback to localStorage if Supabase fails
          try {
            const localPosts = localStorage.getItem('slk_posts');
            if (localPosts) {
              const parsedPosts = JSON.parse(localPosts);
              setPosts(parsedPosts);
              toast.info('Loading posts from local storage.');
            }
          } catch (localError) {
            console.error('❌ Local storage fallback error:', localError);
          }
        } else {
          console.log('✅ Posts fetched from Supabase:', data?.length || 0);
          setPosts(data || []);
          
          // Also save to localStorage as backup
          if (data) {
            try {
              localStorage.setItem('slk_posts', JSON.stringify(data));
            } catch (storageError) {
              console.warn('Warning: Could not save posts to localStorage:', storageError);
            }
          }
        }
      } catch (fetchError) {
        console.error('❌ General fetch error:', fetchError);
        toast.error('An error occurred while loading posts.');
        
        // Final fallback to localStorage
        try {
          const localPosts = localStorage.getItem('slk_posts');
          if (localPosts) {
            const parsedPosts = JSON.parse(localPosts);
            setPosts(parsedPosts);
            toast.info('Loading posts from local storage.');
          }
        } catch (localError) {
          console.error('❌ Final fallback error:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isClient]);

  // Filter posts based on search and filter criteria
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / settings.postsPerPage);
  const startIndex = (currentPage - 1) * settings.postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + settings.postsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  // Delete post with enhanced error handling
  const handleDeletePost = async (post: Post) => {
    if (!isClient) return;

    setIsDeleting(true);
    
    try {
      // Try to delete from Supabase first
      const { error } = await supabase.from('posts').delete().eq('id', post.id);

      if (error) {
        console.error('❌ Supabase delete error:', error.message);
        toast.error('Failed to delete post from database. Removing locally...');
        
        // If Supabase fails, still remove from local state
        setPosts(prev => prev.filter(p => p.id !== post.id));
        
        // Update localStorage
        try {
          const updatedPosts = posts.filter(p => p.id !== post.id);
          localStorage.setItem('slk_posts', JSON.stringify(updatedPosts));
        } catch (storageError) {
          console.warn('Warning: Could not update localStorage:', storageError);
        }
        
        toast.success('Post removed from local view.');
      } else {
        // Successfully deleted from Supabase
        setPosts(prev => prev.filter(p => p.id !== post.id));
        
        // Update localStorage
        try {
          const updatedPosts = posts.filter(p => p.id !== post.id);
          localStorage.setItem('slk_posts', JSON.stringify(updatedPosts));
        } catch (storageError) {
          console.warn('Warning: Could not update localStorage:', storageError);
        }
        
        toast.success('Post deleted successfully!');
        console.log('✅ Post deleted successfully:', post.title);
      }
    } catch (deleteError) {
      console.error('❌ Delete operation error:', deleteError);
      toast.error('An error occurred while deleting the post.');
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  // Share post with enhanced error handling
  const handleSharePost = async (post: Post) => {
    if (!isClient) return;

    if (post.status !== 'published') {
      toast.warning('Only published posts can be shared');
      return;
    }

    setSharingPostId(post.id);

    try {
      console.log('🔄 Sharing post:', post.title);
      
      const socialResults = await shareToAllPlatforms(post);
      const emailResult = await sendEmailNotification(post);

      const successCount = Object.values(socialResults).filter(Boolean).length + (emailResult ? 1 : 0);
      const totalOperations = Object.keys(socialResults).length + 1;

      if (successCount === totalOperations) {
        toast.success('Post shared to all platforms and email sent successfully!');
        console.log('✅ Post shared successfully to all platforms');
      } else if (successCount > 0) {
        toast.info(`Post shared to ${successCount} out of ${totalOperations} platforms`);
        console.log(`✅ Post shared to ${successCount}/${totalOperations} platforms`);
      } else {
        toast.error('Failed to share post. Please try again.');
        console.log('❌ Post sharing failed completely');
      }
    } catch (error) {
      console.error('❌ Error sharing post:', error);
      toast.error('An error occurred while sharing the post');
    } finally {
      setSharingPostId(null);
    }
  };

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'scheduled':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'draft':
        return <Calendar className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  // Format post date with proper fallbacks
  const formatPostDate = (post: Post) => {
    try {
      const createdAt = post.created_at;
      const publishedAt = post.published_at;
      const scheduledAt = post.scheduled_at;

      if (post.status === 'scheduled' && scheduledAt) {
        return `Scheduled: ${formatDate(scheduledAt)} ${formatTime(scheduledAt)}`;
      } else if (post.status === 'published' && publishedAt) {
        return `Published: ${formatDate(publishedAt)} ${formatTime(publishedAt)}`;
      } else if (createdAt) {
        return `Created: ${formatDate(createdAt)}`;
      } else {
        return 'Date not available';
      }
    } catch (error) {
      console.warn('Error formatting post date:', error);
      return 'Date not available';
    }
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading posts...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${settings.showAnimations ? 'animate-fade-in' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts</h1>
          <p className="text-gray-600">
            Manage your blog posts and announcements ({filteredPosts.length} total)
          </p>
        </div>
        <button
          onClick={onCreatePost}
          className="text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          style={{ backgroundColor: settings.primaryColor } as React.CSSProperties}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter - match search bar width */}
          <div className="relative">
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="all">All Categories</option>
              <option value="news">News</option>
              <option value="project">Project</option>
              <option value="announcement">Announcement</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span>Showing {settings.postsPerPage} per page</span>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {paginatedPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Title</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Category</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Status</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Date</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPosts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm text-gray-600">{post.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(post.status)}`}>
                        {getStatusIcon(post.status)}
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatPostDate(post)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onEditPost(post)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" 
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {post.status === 'published' && (
                          <button
                            onClick={() => handleSharePost(post)}
                            disabled={isSharing || sharingPostId === post.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-all duration-200"
                            title="Share to Social Media & Email"
                          >
                            {sharingPostId === post.id ? 
                              <Clock className="w-4 h-4 animate-spin" /> : 
                              <Share2 className="w-4 h-4" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {posts.length === 0 ? 'No posts found' : 'No posts match your current filters'}
            </p>
            {posts.length === 0 ? (
              <button
                onClick={onCreatePost}
                className="text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Create Your First Post
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + settings.postsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100 pointer-events-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Delete Post</h2>
              <p className="text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-medium text-black">"{postToDelete.title}"</span>?{' '}
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(postToDelete)}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostList;
