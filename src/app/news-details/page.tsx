"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Clock,
  Eye,
  Loader,
} from 'lucide-react';

import AnimatedSection from '../../components/AnimatedSection';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../lib/supabase';

const NewsDetailPage = () => {
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        // Fetch the main post
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .eq('status', 'published')
          .single();

        if (postError || !postData) {
          console.error('Error fetching post:', postError);
          setPost(null);
          setIsLoading(false);
          return;
        }

        // Map the post data
        const mappedPost = {
          ...postData,
          featuredImage: postData.featured_image,
          publishedAt: postData.published_at,
          viewCount: postData.view_count ?? 0,
          tags: postData.tags ?? [],
          readTime: Math.max(2, Math.round(postData.content.split(' ').length / 200)) + ' min read'
        };

        setPost(mappedPost);

        // Fetch related posts
        const { data: relatedData, error: relatedError } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .eq('category', postData.category)
          .neq('id', postId)
          .limit(3);

        if (!relatedError && relatedData) {
          const mappedRelated = relatedData.map(p => ({
            ...p,
            featuredImage: p.featured_image,
            publishedAt: p.published_at,
          }));
          setRelatedPosts(mappedRelated);
        }

        // Update view count
        const viewedKey = `viewed_${postId}`;
        if (!sessionStorage.getItem(viewedKey)) {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ view_count: (postData.view_count || 0) + 1 })
            .eq('id', postId);

          if (!updateError) {
            setPost(prev => ({
              ...prev,
              view_count: (prev?.view_count || 0) + 1,
            }));
            sessionStorage.setItem(viewedKey, 'true');
          }
        }

      } catch (error) {
        console.error('Error in fetchPost:', error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => router.push('/news');

  const handleShare = (platform: string) => {
    if (!post) return;

    let shareUrl = '';
    const postUrl = `${window.location.origin}/news-details?id=${post.id}`;

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'instagram':
        toast.info('Instagram sharing would open the app with this image');
        return;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Check out this post: ${postUrl}`)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const handleRelatedPostClick = (relatedPostId: string) => {
    router.push(`/news-details?id=${relatedPostId}`);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/news?category=${category}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'bg-blue-500 text-white';
      case 'project': return 'bg-green-500 text-white';
      case 'announcement': return 'bg-orange-500 text-white';
      case 'blog': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <div className="text-center">
            <Loader className="w-12 h-12 text-[#3d9392] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">Loading article...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Eye className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBack}
              className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-6 py-3 rounded-lg font-medium flex items-center mx-auto transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to News
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <AnimatedSection animation="fade-right" className="mb-8">
          <button
            onClick={handleBack}
            className="flex mt-20 items-center text-gray-600 hover:text-[#3d9392] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to News
          </button>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatedSection animation="fade-up">
              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative h-96 mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Article Header */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-medium">{post.readTime || '5 min read'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Eye className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{post.view_count || 0} views</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: string, index: number) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors cursor-pointer"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                  <div className="bg-gradient-to-r from-[#3d9392]/10 to-[#6dbeb0]/10 border-l-4 border-[#3d9392] p-6 rounded-r-lg mb-8">
                    <p className="text-lg text-gray-700 font-medium italic leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="prose prose-lg max-w-none">
                  {post.content.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-6 text-gray-700 text-justify leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Share Section */}
              <div className="bg-gradient-to-r from-blue-50 to-[#3d9392]/10 rounded-2xl p-6 mb-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Share2 className="w-5 h-5 text-blue-600" />
                  </div>
                  Share This Article
                </h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleShare('facebook')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleShare('instagram')} 
                    className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                    title="Share on Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')} 
                    className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleShare('email')} 
                    className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                    title="Share via Email"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div>
            <AnimatedSection animation="fade-left" delay={200}>
              {/* Author Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] p-3 rounded-full mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{post.author}</h4>
                    <p className="text-sm text-gray-600">Content Writer at SLK Trading</p>
                    <p className="text-xs text-gray-500 mt-1">Construction & Design Specialist</p>
                  </div>
                </div>
              </div>

              {/* Related Posts */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
                {relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <div 
                        key={relatedPost.id} 
                        className="flex items-start cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#3d9392]/5 p-3 rounded-lg transition-all duration-300 group border border-transparent hover:border-gray-200"
                        onClick={() => handleRelatedPostClick(relatedPost.id)}
                      >
                        {relatedPost.featured_image && (
                          <img 
                            src={relatedPost.featured_image} 
                            alt={relatedPost.title} 
                            className="w-16 h-16 object-cover rounded-lg mr-3 group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-[#3d9392] transition-colors">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(relatedPost.published_at || relatedPost.created_at).toLocaleDateString()}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 capitalize ${getCategoryColor(relatedPost.category)}`}>
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No related articles found</p>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Browse Categories</h3>
                <div className="space-y-2">
                  {[
                    { id: 'news', name: 'News', icon: '📰' },
                    { id: 'project', name: 'Projects', icon: '🏗️' },
                    { id: 'announcement', name: 'Announcements', icon: '📢' },
                    { id: 'blog', name: 'Blog', icon: '✍️' }
                  ].map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#3d9392]/5 rounded-lg cursor-pointer transition-all duration-300 group border border-transparent hover:border-gray-200"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{category.icon}</span>
                        <span className="font-medium text-gray-700 group-hover:text-[#3d9392] transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <span className="bg-gray-100 group-hover:bg-[#3d9392] group-hover:text-white text-gray-600 px-2 py-1 rounded-full text-xs font-medium transition-colors">
                        {Math.floor(Math.random() * 20) + 5}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
      
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default NewsDetailPage;
