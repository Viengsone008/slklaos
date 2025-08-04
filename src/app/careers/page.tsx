"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Award, 
  Target,
  CheckCircle,
  Heart,
  Globe,
  TrendingUp,
  Shield,
  Coffee,
  Car,
  GraduationCap,
  Building2
} from 'lucide-react';
import AnimatedSection from "../../components/AnimatedSection";
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from "../../lib/supabase";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WhatsAppChatButton from '../../components/WhatsAppChatButton';
import FloatingQuoteButton from '../../components/FloatingQuoteButton';
import QuoteModal from '../../components/QuoteModal';

// Utility function to slugify category names
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const CareersPage = () => {
  // Scroll progress indicator, floating quote button visibility, and 3D effects
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setScrollY(scrollTop);
      setShowNav(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchCareersData = async () => {
      setLoading(true);
      
      try {
        // Change from "active" to "open"
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")  
          .eq("status", "Open")  // Changed from "Open" to "open" (lowercase)
          .order("created_at", { ascending: false });

        if (jobsError) {
          console.error("Error fetching jobs:", jobsError);
        } else {
          setJobs(jobsData || []);
          
          // Get unique category names
          const uniqueCategories = Array.from(
            new Set(jobsData?.map((item: any) => item.category).filter(Boolean) || [])
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching careers data:", error);
      }
      
      setLoading(false);
    };

    fetchCareersData();
  }, []);

  const filteredJobs = selectedCategory === 'all' 
    ? jobs 
    : jobs.filter(job => job.category === selectedCategory);

  const categoryIcons: { [key: string]: any } = {
    'Engineering': Building2,
    'Construction': Briefcase,
    'Project Management': Target,
    'Design': Star,
    'Sales': TrendingUp,
    'Administration': Users,
    'Finance': DollarSign,
    'Operations': Globe,
    'Quality Control': Shield,
    'Safety': Award
  };

  const benefits = [
    {
      icon: Heart,
      title: "Health Insurance",
      description: "Comprehensive medical coverage for you and your family"
    },
    {
      icon: GraduationCap,
      title: "Professional Development",
      description: "Training programs and skill development opportunities"
    },
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description: "Market-competitive compensation packages"
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Work-life balance with flexible working arrangements"
    },
    {
      icon: Car,
      title: "Transportation",
      description: "Company transportation or allowance provided"
    },
    {
      icon: Coffee,
      title: "Team Events",
      description: "Regular team building and company events"
    },
    {
      icon: Award,
      title: "Performance Bonus",
      description: "Annual performance-based bonuses and recognition"
    },
    {
      icon: Globe,
      title: "Career Growth",
      description: "Clear career progression paths and opportunities"
    }
  ];

  const companyValues = [
    {
      title: "Innovation",
      description: "We embrace new technologies and creative solutions",
      icon: TrendingUp
    },
    {
      title: "Quality Excellence",
      description: "We deliver the highest standards in everything we do",
      icon: Star
    },
    {
      title: "Team Collaboration",
      description: "We believe in the power of working together",
      icon: Users
    },
    {
      title: "Professional Growth",
      description: "We invest in our people's development and success",
      icon: Award
    }
  ];

  // Updated function to navigate to career-catalogue page
  const handleCategoryClick = (category?: string) => {
    if (category) {
      // Navigate to career-catalogue with category filter
      router.push(`/career-catalogue?category=${encodeURIComponent(category)}`);
    } else {
      // Navigate to career-catalogue without filter (all jobs)
      router.push('/career-catalogue');
    }
  };

  // Updated function to navigate to career-catalogue page instead of contact
  const handleApplyNow = () => {
    router.push('/career-catalogue');
  };

  const handleJobClick = (jobId: string) => {
    router.push(`/career-details?id=${jobId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#3d9392] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading career opportunities...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <style jsx global>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .luxury-card-glass {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(191, 167, 106, 0.18);
            box-shadow: 0 8px 32px 0 rgba(191, 167, 106, 0.37);
          }
          .shadow-gold {
            box-shadow: 0 25px 50px -12px rgba(191, 167, 106, 0.25), 0 0 0 1px rgba(191, 167, 106, 0.05);
          }
          .luxury-gradient-text {
            background: linear-gradient(135deg, #faedcbff 0%, #f8f4e3ff 50%, #f9ebc8ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .luxury-gold-text {
            color: #b3a698ff;
            text-shadow: 0 0 20px rgba(234, 204, 129, 0.5);
          }
          .luxury-fade-text {
            background: linear-gradient(135deg, #f7dec6ff 0%, #f5d79bff 50%, #f7dcbeff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .drop-shadow-gold {
            filter: drop-shadow(0 4px 6px rgba(191, 167, 106, 0.3)) drop-shadow(0 1px 3px rgba(191, 167, 106, 0.2));
          }
        `}</style>
        {/* HERO SECTION - Luxury Upgrade */}
        <section className="relative py-36 md:py-44 bg-gradient-to-br from-[#3d9392] via-[#6dbeb0] to-[#1b3d5a] text-white overflow-hidden luxury-card-glass shadow-gold perspective-1000">
          <div 
            className="absolute inset-0 preserve-3d"
            style={{
              transform: `translateZ(0) translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002}) rotateX(${scrollY * 0.02}deg)`,
              willChange: 'transform'
            }}
          >
            <img 
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Career-Banner.jpg" 
              alt="Careers at SLK Trading"
              className="w-full h-full object-cover opacity-80 scale-105 blur-[2px]"
            />
          </div>
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#3d9392]/80 via-[#bfa76a]/30 to-[#1b3d5a]/80 preserve-3d"
            style={{
              transform: `translateZ(10px) translateY(${scrollY * 0.3}px)`,
              willChange: 'transform'
            }}
          ></div>
          <div 
            className="absolute inset-0 bg-white/10 backdrop-blur-[2px] preserve-3d"
            style={{
              transform: `translateZ(20px) translateY(${scrollY * 0.2}px)`,
              willChange: 'transform'
            }}
          ></div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div 
              className="preserve-3d"
              style={{
                transform: `translateZ(30px) translateY(${scrollY * 0.1}px)`,
                willChange: 'transform'
              }}
            >
              <AnimatedSection className="text-center max-w-4xl mx-auto luxury-card-glass bg-white/30 backdrop-blur-xl border border-[#bfa76a]/30 rounded-3xl shadow-gold px-8 py-12">
              <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 luxury-gradient-text drop-shadow-[0_6px_32px_rgba(191,167,106,0.45)]">
                Join Our <span className="luxury-gold-text luxury-fade-text drop-shadow-gold">Team</span>
              </h1>
              <p className="text-2xl md:text-3xl text-[#bfa76a] mb-8 leading-relaxed luxury-fade-text drop-shadow-gold font-medium">
                Build your career with <span className="luxury-gold-text font-bold">Laos' leading construction company</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button 
                  onClick={handleApplyNow}
                  className="luxury-card-glass bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] text-[#1b3d5a] px-10 py-4 rounded-xl font-bold text-lg shadow-gold border border-[#bfa76a]/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                >
                  <span className="luxury-gold-text">View Open Positions</span>
                  <ArrowRight className="w-5 h-5 ml-2 inline text-[#bfa76a]" />
                </button>
                <button 
                  onClick={() => router.push('/about')}
                  className="luxury-card-glass bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#bfa76a] border-2 border-[#bfa76a]/70 text-[#1b3d5a] px-10 py-4 rounded-xl font-extrabold text-lg shadow-gold transition-all duration-300 hover:scale-105 hover:from-[#e5e2d6] hover:to-[#bfa76a] focus:outline-none focus:ring-2 focus:ring-[#bfa76a] drop-shadow-[0_4px_24px_rgba(191,167,106,0.25)]"
                >
                  <span className="luxury-gold-text">About Our Company</span>
                </button>
              </div>
            </AnimatedSection>
            </div>
          </div>
        </section>

        {/* COMPANY STATS */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <AnimatedSection animation="scale" delay={0}>
                <div className="text-center">
                  <div className="bg-orange-100 p-4 rounded-xl inline-flex mb-4">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
                  <div className="text-gray-600">Team Members</div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="scale" delay={100}>
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-xl inline-flex mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">200+</div>
                  <div className="text-gray-600">Projects Completed</div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="scale" delay={200}>
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-xl inline-flex mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">10+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="scale" delay={300}>
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-xl inline-flex mb-4">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
                  <div className="text-gray-600">Client Satisfaction</div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CAREER CATEGORIES */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              {/* Updated clickable title to link to career-catalogue */}
              <h2 
                className="text-4xl font-bold text-gray-900 mb-6 cursor-pointer hover:text-[#3d9392] transition-colors"
                onClick={() => handleCategoryClick()}
              >
                Career <span className="text-[#3d9392]">Opportunities</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore exciting career paths across different departments
              </p>
            </AnimatedSection>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#3d9392] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-[#6dbeb0] hover:text-white border border-gray-300'
                }`}
              >
                All Positions ({jobs.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#3d9392] text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-[#6dbeb0] hover:text-white border border-gray-300'
                  }`}
                >
                  {category} ({jobs.filter(job => job.category === category).length})
                </button>
              ))}
            </div>

            {/* Updated Career Opportunities Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const IconComponent = categoryIcons[category] || Briefcase;
                const categoryJobs = jobs.filter(job => job.category === category);
                
                return (
                  <AnimatedSection
                    key={category}
                    animation="fade-up"
                    delay={index * 100}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-xl mr-4 group-hover:bg-[#3d9392] transition-colors">
                        <IconComponent className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        {/* Updated clickable category title */}
                        <h3 
                          className="text-xl font-bold text-gray-900 group-hover:text-[#3d9392] transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryClick(category);
                          }}
                        >
                          {category}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {categoryJobs.length} open position{categoryJobs.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {/* Updated clickable description */}
                    <p 
                      className="text-gray-600 mb-4 cursor-pointer hover:text-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category);
                      }}
                    >
                      Explore exciting opportunities in {category.toLowerCase()} and grow your career with us.
                    </p>
                    
                    {/* Updated View Open Positions button to link to career-catalogue */}
                    <button 
                      className="flex items-center text-[#3d9392] font-medium group-hover:text-[#6dbeb0] transition-colors hover:underline w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category);
                      }}
                    >
                      View Open Positions
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </AnimatedSection>
                );
              })}
            </div>

            {/* Show message if no categories available */}
            {categories.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No career categories available</h3>
                <p className="text-gray-500 mb-6">We're currently updating our career opportunities. Please check back soon!</p>
                <button
                  onClick={() => router.push('/contact')}
                  className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Contact HR for Opportunities
                </button>
              </div>
            )}
          </div>
        </section>

        {/* FEATURED JOBS */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Featured <span className="text-[#3d9392]">Positions</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Current openings that are perfect for ambitious professionals
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.slice(0, 6).map((job, index) => (
                <AnimatedSection
                  key={job.id}
                  animation="fade-up"
                  delay={index * 150}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Updated clickable job title */}
                      <h3 
                        className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#3d9392] transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                      >
                        {job.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location || 'Vientiane, Laos'}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {job.employment_type || 'Full-time'}
                      </div>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {job.category}
                    </span>
                  </div>

                  {/* Updated clickable job description */}
                  <p 
                    className="text-gray-600 mb-4 line-clamp-3 cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job.id);
                    }}
                  >
                    {job.description?.substring(0, 120)}...
                  </p>

                  {/* Requirements Preview */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Requirements:</h4>
                      <div className="space-y-1">
                        {job.requirements.slice(0, 2).map((req: string, reqIndex: number) => (
                          <div key={reqIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {req}
                          </div>
                        ))}
                        {job.requirements.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{job.requirements.length - 2} more requirements
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    {/* Updated "Apply Now" button to link to career-details page */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                      className="flex items-center text-[#3d9392] font-medium group-hover:text-[#6dbeb0] transition-colors hover:underline"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No positions available</h3>
                <p className="text-gray-500">Check back later for new opportunities or contact us about future openings.</p>
              </div>
            )}

            {filteredJobs.length > 6 && (
              <div className="text-center mt-12">
                {/* Updated button to link to career-catalogue */}
                <button
                  onClick={() => handleCategoryClick()}
                  className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View All {filteredJobs.length} Positions
                </button>
              </div>
            )}
          </div>
        </section>

        {/* COMPANY VALUES */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-[#3d9392]">Values</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide our team and drive our success
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <AnimatedSection
                    key={index}
                    animation="scale"
                    delay={index * 150}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
                  >
                    <div className="bg-orange-100 p-4 rounded-xl inline-flex mb-4">
                      <IconComponent className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* BENEFITS & PERKS */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Benefits & <span className="text-[#3d9392]">Perks</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We take care of our team with comprehensive benefits and a great work environment
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <AnimatedSection
                    key={index}
                    animation="fade-up"
                    delay={index * 100}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="bg-blue-100 p-3 rounded-xl inline-flex mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* ENHANCED CTA SECTION - Ready to Start Your Career */}
        <section className="py-32 bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#3d9392] text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/5 w-40 h-40 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white/8 rounded-full animate-pulse delay-500"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="text-center max-w-5xl mx-auto">
              {/* Career Icon */}
              <div className="mb-10">
                <div className="bg-white/20 backdrop-blur-sm p-8 rounded-full inline-flex mb-8 border border-white/30 shadow-2xl">
                  <Briefcase className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-6xl lg:text-7xl font-extrabold mb-8 text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Start Your <span className="text-white drop-shadow-lg">Career?</span>
              </h2>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-10">
                <div className="h-1 w-40 bg-gradient-to-r from-white via-[#1a2936] to-white rounded-full opacity-80"></div>
              </div>

              {/* Enhanced Description */}
              <p className="text-2xl lg:text-3xl text-[#1a2936] mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
                Join our growing team and be part of 
                <span className="font-bold text-white"> Laos' construction industry transformation</span>. 
                Build your future with 
                <span className="font-bold text-white"> industry leaders</span> and 
                <span className="font-bold text-white"> innovative projects</span>
              </p>

              {/* Career Benefits Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                  <div className="bg-white/30 p-4 rounded-full inline-flex mb-6 group-hover:scale-110 transition-all duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Career Growth
                  </h3>
                  <p className="text-[#1a2936] leading-relaxed">
                    Advance your career with clear progression paths and leadership development opportunities.
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                  <div className="bg-white/30 p-4 rounded-full inline-flex mb-6 group-hover:scale-110 transition-all duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Recognition & Rewards
                  </h3>
                  <p className="text-[#1a2936] leading-relaxed">
                    Be recognized for your contributions with competitive salaries and performance bonuses.
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                  <div className="bg-white/30 p-4 rounded-full inline-flex mb-6 group-hover:scale-110 transition-all duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Team Culture
                  </h3>
                  <p className="text-[#1a2936] leading-relaxed">
                    Work with passionate professionals in a collaborative and supportive environment.
                  </p>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <button
                  onClick={handleApplyNow}
                  className="bg-white text-[#1a2936] hover:bg-gray-100 px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center group border-2 border-white/20"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  <Briefcase className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  View Open Positions
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="border-2 border-white/50 hover:bg-white/10 text-white px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center justify-center group"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  <Users className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Contact HR Team
                </button>
              </div>

              {/* Career Stats & Social Proof */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      50+
                    </div>
                    <div className="text-[#1a2936] font-medium">Team Members</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      95%
                    </div>
                    <div className="text-[#1a2936] font-medium">Employee Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      10+
                    </div>
                    <div className="text-[#1a2936] font-medium">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      200+
                    </div>
                    <div className="text-[#1a2936] font-medium">Projects Completed</div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="border-t border-white/30 pt-8 mt-8">
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Equal Opportunity Employer</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Professional Development</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Competitive Benefits</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Work-Life Balance</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
      <Footer />
      {showNav && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <WhatsAppChatButton />
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)}
        source="footer_contact_now"
      />
    </>
  );
};

export default CareersPage;
