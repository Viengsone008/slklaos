"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Trans from '../components/Trans';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string;
  created_at: string;
  category: string;
  tags: string[];
  author: string;
}

const BlogSection = () => {
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
  const { t } = useLanguage();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('❌ Error fetching posts:', error.message);
        return;
      }

      console.log('✅ Fetched posts:', data);
      setPosts(data as Post[]);
    };

    fetchPosts();
  }, []);

  const handleReadMore = (postId: string) => {
    router.push(`/news-details?id=${postId}`);
  };

  const handleViewAllPosts = () => {
    router.push('/news');
  };

  if (posts.length === 0) return null;

  // Helper: is new post (published in last 7 days)
  const isNewPost = (created_at: string) => {
    const postDate = new Date(created_at);
    const now = new Date();
    const diff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  // Trust/Highlight badges (example: trending, editor's pick)
  const getHighlightBadge = (post: Post, idx: number) => {
    if (idx === 0) return { label: 'Editor’s Pick', color: 'bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 text-white' };
    if (idx === 1) return { label: 'Trending', color: 'bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] text-white' };
    return null;
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <section id="blog" className="py-20 relative overflow-hidden bg-white">
      {/* Subtle animated background + floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e0f7fa]/60 via-white/80 to-[#6dbeb0]/10 animate-gradient-move" />
        {/* Floating geometric shapes and sparkles */}
        <svg className="absolute left-10 top-16 w-10 h-10 animate-float-slow" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#6dbeb0" fillOpacity="0.13" />
        </svg>
        <svg className="absolute right-16 top-32 w-8 h-8 animate-float-medium" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="6" fill="#3d9392" fillOpacity="0.10" />
        </svg>
        <svg className="absolute left-1/2 bottom-24 w-7 h-7 animate-float-fast" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 18,10 27,11 20,17 22,26 14,21 6,26 8,17 1,11 10,10" fill="#fbbf24" fillOpacity="0.13" />
        </svg>
        {/* Sparkle */}
        <svg className="absolute right-10 bottom-10 w-6 h-6 animate-sparkle" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" fill="#fbbf24" fillOpacity="0.18" />
        </svg>
        <svg className="absolute left-8 bottom-1/3 w-5 h-5 animate-sparkle-delay" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" fill="#6dbeb0" fillOpacity="0.15" />
        </svg>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection animation="fade-up" repeatOnScroll={true}>
          <h2 className="text-4xl lg:text-5xl font-extrabold luxury-headline text-gray-900 mb-6 text-center drop-shadow-lg">
            <Trans as="span">Latest</Trans> <span className="text-[#21706e] luxury-headline drop-shadow-lg"><Trans as="span">News</Trans></span>
          </h2>
          <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed text-center drop-shadow">
            <Trans>Stay updated with our latest projects, announcements, and industry insights</Trans>
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 mt-12">
          {posts.map((post, index) => {
            const highlight = getHighlightBadge(post, index);
            return (
              <AnimatedSection
                key={post.id}
                animation="fade-up"
                delay={index * 150}
                repeatOnScroll={true}
                className="bg-white/80 glass-morphism backdrop-blur-lg border border-[#3d9392]/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer relative"
                onClick={() => handleReadMore(post.id)}
              >
                {/* Parallax image wrapper */}
                <AnimatedSection animation="zoom-in" delay={index * 150 + 100}>
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer parallax-image-wrapper"
                    onMouseMove={e => {
                      const wrapper = e.currentTarget;
                      const img = wrapper.querySelector('img');
                      if (img) {
                        const rect = wrapper.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        img.style.transform = `scale(1.08) translate(${(x - rect.width / 2) / 18}px, ${(y - rect.height / 2) / 18}px)`;
                      }
                    }}
                    onMouseLeave={e => {
                      const img = e.currentTarget.querySelector('img');
                      if (img) img.style.transform = '';
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      handleReadMore(post.id);
                    }}
                  >
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 parallax-image"
                    />
                    {/* Luxury animated overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-[#3d9392]/10 to-transparent opacity-70 group-hover:opacity-80 transition-all duration-300" />
                    {/* Category badge */}
                    <AnimatedSection animation="slide-down" delay={index * 150 + 200}>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-[#6dbeb0] text-white px-3 py-1 rounded-full text-sm font-medium capitalize shadow-md">
                          {t(post.category)}
                        </span>
                        {highlight ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md animate-bounce ${highlight.color}`}>{t(highlight.label)}</span>
                        ) : null}
                        {isNewPost(post.created_at) && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-blue-400 text-white shadow animate-pulse ml-1">
                            <Trans as="span">New</Trans>
                          </span>
                        )}
                      </div>
                    </AnimatedSection>
                  </div>
                </AnimatedSection>

                <div className="p-6">
                  <AnimatedSection animation="fade-up" delay={index * 150 + 200}>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-[#21706e] transition-colors luxury-headline drop-shadow" onClick={e => { e.stopPropagation(); handleReadMore(post.id); }}>
                      {t(post.title)}
                    </h3>
                    <p className="text-gray-800 text-base mb-4 line-clamp-3 drop-shadow-sm">{t(post.excerpt)}</p>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-right" delay={index * 150 + 300}>
                    <div className="flex items-center justify-between text-sm text-gray-800 font-semibold mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-[#3d9392]" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-[#3d9392]" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </AnimatedSection>

                  {post.tags && post.tags.length > 0 && (
                    <AnimatedSection animation="fade-up" delay={index * 150 + 350}>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <AnimatedSection
                            key={tagIndex}
                            animation="scale"
                            delay={index * 150 + 400 + tagIndex * 50}
                          >
                            <span className="inline-flex items-center px-2 py-1 bg-white/90 glass-morphism backdrop-blur-md text-[#21706e] border border-[#3d9392]/30 rounded-full text-xs font-bold shadow-sm animate-fade-in">
                              <Tag className="w-3 h-3 mr-1" />
                              {t(tag)}
                            </span>
                          </AnimatedSection>
                        ))}
                      </div>
                    </AnimatedSection>
                  )}

                  <AnimatedSection animation="scale" delay={index * 150 + 450}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleReadMore(post.id);
                      }}
                      className="w-full bg-gradient-to-r from-[#e0f7fa] to-[#b2dfdb] glass-morphism backdrop-blur-md hover:from-[#b2dfdb] hover:to-[#e0f7fa] text-gray-500 py-2 px-4 rounded-lg font-extrabold text-lg flex items-center justify-center transition-all duration-300 group transform hover:scale-105 shadow-xl border border-[#3d9392]/40 drop-shadow-lg" style={{textShadow:'0 2px 8px #fff,0 1px 0 #b2dfdb'}}
                    >
                      <Trans as="span">Read Full Story</Trans>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </AnimatedSection>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection animation="scale" delay={600} className="text-center">
          <button
            onClick={handleViewAllPosts}
            className="bg-gradient-to-r from-[#e0f7fa] to-[#b2dfdb] glass-morphism backdrop-blur-md hover:from-[#b2dfdb] hover:to-[#e0f7fa] text-gray-500 px-8 py-4 rounded-lg font-extrabold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-[#3d9392]/40 drop-shadow-lg" style={{textShadow:'0 2px 8px #fff,0 1px 0 #b2dfdb'}}
          >
            <Trans as="span">View All News</Trans>
          </button>
        </AnimatedSection>
      </div>
      </section>
    </>
  );
};

// Add keyframes and luxury font (add to globals.css if not present)
// @layer utilities {
//   .glass-morphism {
//     backdrop-filter: blur(16px) saturate(120%);
//     background-clip: padding-box;
//   }
//   .animate-float-slow { animation: floatY 8s ease-in-out infinite alternate; }
//   .animate-float-medium { animation: floatY 6s ease-in-out infinite alternate; }
//   .animate-float-fast { animation: floatY 4s ease-in-out infinite alternate; }
//   .animate-sparkle { animation: sparkle 2.5s ease-in-out infinite alternate; }
//   .animate-sparkle-delay { animation: sparkle 2.5s 1.2s ease-in-out infinite alternate; }
//   .animate-gradient-move { animation: gradientMove 12s ease-in-out infinite alternate; }
//   .luxury-headline { font-family: 'Playfair Display', 'serif'; letter-spacing: 1px; }
//   @keyframes floatY {
//     0% { transform: translateY(0); }
//     100% { transform: translateY(-24px); }
//   }
//   @keyframes sparkle {
//     0% { opacity: 0.7; filter: blur(0px); }
//     50% { opacity: 1; filter: blur(1px); }
//     100% { opacity: 0.7; filter: blur(0px); }
//   }
//   @keyframes gradientMove {
//     0% { filter: brightness(1); }
//     100% { filter: brightness(1.08) saturate(1.1); }
//   }
//   .parallax-image-wrapper:hover .parallax-image {
//     transition: transform 0.5s cubic-bezier(.4,2,.6,1);
//   }
// }

// In your _app or layout, import Playfair Display from Google Fonts for .luxury-headline

export default BlogSection;
