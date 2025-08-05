"use client";
import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Eye, Image, Clock, Calendar, Share2, Facebook, Instagram, Linkedin, Mail, Loader } from 'lucide-react';
import { PostProvider, usePost } from '../../../../contexts/PostContext';
import { SocialShareProvider, useSocialShare } from '../../../../contexts/SocialShareContext';
import { Post, PostFormData } from '../../../../types/Post';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from "../../../../lib/supabase";
import { v4 as uuidv4 } from 'uuid';


interface PostEditorProps {
  post?: Post;
  onBack: () => void; 
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onBack }) => {
  const { addPost, updatePost } = usePost();
  const { shareToFacebook, isSharing } = useSocialShare();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: 'news',
    status: 'published',
    featuredImage: '',
    tags: [],
    scheduledAt: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const [socialOptions, setSocialOptions] = useState({
    facebook: true,
    instagram: true,
    linkedin: true,
    email: true 
  });

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize form data when post prop changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        category: post.category || 'news',
        status: post.status || 'published',
        featuredImage: post.featuredImage || '',
        tags: Array.isArray(post.tags) ? post.tags : [],
        scheduledAt: post.scheduledAt || ''
      });
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'news',
        status: 'published',
        featuredImage: '',
        tags: [],
        scheduledAt: ''
      });
    }
  }, [post]);

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate scheduled date if status is scheduled
      if (formData.status === 'scheduled') {
        if (!formData.scheduledAt) {
          toast.error('Please select a scheduled date and time');
          setIsLoading(false);
          return;
        }
        const scheduledDate = new Date(formData.scheduledAt);
        const now = new Date();
        if (scheduledDate <= now) {
          toast.error('Scheduled date must be in the future');
          setIsLoading(false);
          return; 
        } 
      }

      let savedPost: Post;
      
      if (post && post.id) {
        // Prepare update object
        const updatePayload: any = {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          status: formData.status,
          tags: formData.tags,
          scheduled_at: formData.status === 'scheduled' ? formData.scheduledAt : null,
          updated_at: new Date().toISOString(),
        };

        // Only update featured_image if a new one is provided, otherwise keep existing
        if (formData.featuredImage && formData.featuredImage.trim() !== "") {
          updatePayload.featured_image = formData.featuredImage;
        }

        const { error } = await supabase
          .from('posts')
          .update(updatePayload)
          .eq('id', post.id);

        if (error) {
          toast.error(error.message);
          return;
        }
        updatePost(post.id, { ...formData, featuredImage: updatePayload.featured_image ?? post.featured_image });
        toast.success('Post updated!');
      } else {
        // Insert new post
        const newPost: Post = {
          id: uuidv4(),
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          status: formData.status,
          featured_image: formData.featuredImage, // <-- FIXED
          tags: formData.tags,
          author: 'SLK Admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: formData.status === 'published' ? new Date().toISOString() : undefined,
          scheduled_at: formData.status === 'scheduled' ? formData.scheduledAt : undefined
        };

        try {
          const payload = {
            id: newPost.id,
            title: newPost.title,
            content: newPost.content,
            excerpt: newPost.excerpt,
            category: newPost.category,
            status: newPost.status,
            featured_image: newPost.featured_image, // <-- snake_case
            tags: newPost.tags,
            author: newPost.author,
            published_at: newPost.published_at,
            scheduled_at: newPost.scheduled_at,
            created_at: newPost.created_at,
            updated_at: newPost.updated_at,
          };

          console.log('Payload:', payload);

          const { data, error } = await supabase
            .from('posts')
            .insert([payload])
            .select()
            .single();

          if (error) {
            toast.error(error.message);
            return;
          }
          addPost(data); // Use the returned data from Supabase
          toast.success('Post created!');
        } catch (error) {
          console.warn('Supabase not available:', error);
          toast.error('Supabase not available');
          addPost(newPost);
          savedPost = newPost;
        }
      }
      
      // Show success message
      toast.success(`Post ${post ? 'updated' : 'created'} successfully!`);
      
      // If post is published, show social sharing options
      if (formData.status === 'published') {
        setShowSocialOptions(true);
      } else {
        onBack();
      } 
    } catch (error) {
      console.error('❌ Error saving post:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setIsLoading(false);
    } 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ?? ""
    }));
  };
 
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getMinScheduleDateTime = () => {
    if (!isClient) return '';
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleSocialOptionChange = (platform: keyof typeof socialOptions) => {
    setSocialOptions(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;
      try {
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        if (data?.publicUrl) {
          setFormData(prev => ({
            ...prev,
            featuredImage: data.publicUrl || "",
          }));
          toast.success('✅ Image uploaded successfully!');
        }
      } catch (supabaseError) {
        console.warn('Supabase upload failed, using local base64:', supabaseError);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            featuredImage: result || "",
          }));
          toast.success('✅ Image loaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('❌ Failed to upload image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareToSocial = async () => {
    setIsLoading(true);
    try {
      // Always fetch the latest post (most recently created/updated)
      const { data: latestPost, error: postError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (postError || !latestPost) {
        toast.error('Failed to fetch the latest post for sharing');
        setIsLoading(false);
        return;
      }

      const postToShare = latestPost;


      // Send email to all subscribers (if checked)
      if (socialOptions.email) {
        const { data: subscribers, error } = await supabase
          .from('newsletter_subscribers')
          .select('email');
        if (error) throw error;
        const emails = subscribers.map((s) => s.email);

        const res = await fetch('/api/send-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails, post: postToShare }),
        });
        if (!res.ok) throw new Error('Failed to send email newsletter');
      }

        // Share to Facebook (if checked)
     if (socialOptions.facebook) {
      const fbResult = await shareToFacebook(postToShare);
      if (!fbResult) {
        toast.error('Facebook sharing failed. Check your credentials and API route.');
        return;
      }
    }

      toast.success('Shared successfully!');
    setShowSocialOptions(false);
    onBack();
  } catch (error) {
    console.error('❌ Error in handleShareToSocial:', error);
    toast.error('Failed to share');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button> 
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {post ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600">
              {post ? 'Update your existing post' : 'Write and publish a new post'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Preview
          </button>
          <button
            form="post-form"
            type="submit"
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Post Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg text-gray-700 placeholder-gray-700"
                placeholder="Enter post title..."
              />
            </div>

            {/* Post Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                required
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-700"
                placeholder="Write your post content here..."
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-700"
                placeholder="Brief description of the post..."
              />
              <p className="text-sm text-gray-500 mt-2">
                A short summary that will appear in post listings
              </p>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="flex flex-col gap-6 self-start sticky top-8">
            {/* Publish Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="" disabled className="text-gray-400">Select status...</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {/* Schedule Date/Time */}
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Schedule Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      value={formData.scheduledAt || ""}
                      onChange={handleChange}
                      min={getMinScheduleDateTime()}
                      required={formData.status === 'scheduled'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Post will be automatically published at this time
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="" disabled className="text-gray-400">Select category...</option>
                    <option value="news">News</option>
                    <option value="project">Project</option>
                    <option value="announcement">Announcement</option>
                    <option value="blog">Blog</option>
                  </select>
                </div>

                {/* Social Media Sharing Options */}
                {formData.status === 'published' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-2">
                      <Share2 className="w-4 h-4 mr-2" />
                      <span className="font-medium">Auto-Share When Published</span>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!socialOptions.facebook}
                          onChange={() => handleSocialOptionChange('facebook')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Facebook className="w-4 h-4 mx-2 text-blue-600" />
                        <span className="text-sm text-blue-800">Share to Facebook</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!socialOptions.instagram}
                          onChange={() => handleSocialOptionChange('instagram')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Instagram className="w-4 h-4 mx-2 text-pink-600" />
                        <span className="text-sm text-blue-800">Share to Instagram</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!socialOptions.linkedin}
                          onChange={() => handleSocialOptionChange('linkedin')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Linkedin className="w-4 h-4 mx-2 text-blue-700" />
                        <span className="text-sm text-blue-800">Share to LinkedIn</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!socialOptions.email}
                          onChange={() => handleSocialOptionChange('email')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Mail className="w-4 h-4 mx-2 text-gray-600" />
                        <span className="text-sm text-blue-800">Send Email to Subscribers</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Info */}
              {formData.status === 'scheduled' && formData.scheduledAt && isClient && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center text-purple-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Scheduled for:</span>
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    {new Date(formData.scheduledAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Hero / Featured Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero / Featured Image</h3>

              <div className="space-y-4">
                {/* Upload Button */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isClient) {
                        document.getElementById('hero-upload')?.click();
                      }
                    }}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    disabled={isLoading}
                  >
                    <Image className="w-4 h-4" />
                    {isLoading ? 'Uploading...' : 'Upload Hero Image'}
                  </button>

                  <input
                    id="hero-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                </div>

                {/* Manual Image URL */}
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  placeholder="Paste image URL or upload below"
                />

                {/* Image Preview */}
                {formData.featuredImage && (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Placeholder */}
                {!formData.featuredImage && (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload or paste a URL for the hero image
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              
              <div className="space-y-4">
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput || ""}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Social Sharing Modal */}
      {showSocialOptions && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-md w-full">
            {/* Overlay only behind modal */}
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg pointer-events-none" />
            <div className="relative bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Share2 className="w-5 h-5 mr-2 text-blue-600" />
                  Share Your Post
                </h3>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Your post has been published successfully! Would you like to share it on social media and send email notifications to subscribers?
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!socialOptions.facebook}
                        onChange={() => handleSocialOptionChange('facebook')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Facebook className="w-5 h-5 mx-3 text-blue-600" />
                      <div>
                        <span className="font-medium text-gray-900">Facebook</span>
                        <p className="text-xs text-gray-500">Share to your Facebook page</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!socialOptions.instagram}
                        onChange={() => handleSocialOptionChange('instagram')}
                        className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <Instagram className="w-5 h-5 mx-3 text-pink-600" />
                      <div>
                        <span className="font-medium text-gray-900">Instagram</span>
                        <p className="text-xs text-gray-500">Share to your Instagram feed</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!socialOptions.linkedin}
                        onChange={() => handleSocialOptionChange('linkedin')}
                        className="h-5 w-5 text-blue-700 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Linkedin className="w-5 h-5 mx-3 text-blue-700" />
                      <div>
                        <span className="font-medium text-gray-900">LinkedIn</span>
                        <p className="text-xs text-gray-500">Share to your LinkedIn profile</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!socialOptions.email}
                        onChange={() => handleSocialOptionChange('email')}
                        className="h-5 w-5 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <Mail className="w-5 h-5 mx-3 text-gray-600" />
                      <div>
                        <span className="font-medium text-gray-900">Email Newsletter</span>
                        <p className="text-xs text-gray-500">Send to all subscribers</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSocialOptions(false);
                      onBack(); // <-- This will navigate back and remove the overlay
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleShareToSocial();
                      setShowSocialOptions(false);
                      onBack();
                    }}
                    disabled={isLoading || isSharing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                  >
                    {isLoading || isSharing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PostEditorPage(props) {
  return (
    <PostProvider>
      <SocialShareProvider>
        <PostEditor {...props} />
      </SocialShareProvider>
    </PostProvider>
  );
}
