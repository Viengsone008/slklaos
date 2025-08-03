"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight,
  Filter,
  Search,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';
import Navbar from "../Navbar";
import Footer from "../Footer";
import AnimatedSection from "../../components/AnimatedSection";
import { supabase } from "../../lib/supabase";

const CareerCataloguePage = () => {
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = searchParams.get('category');
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Utility function to slugify category names
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/\//g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Utility function to format category display name
  const formatCategoryName = (slug: string) => {
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "Open")  // Changed from "Open" to "open" (lowercase)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching jobs:", error);
          setJobs([]);
          setAllJobs([]);
          setLoading(false);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Process jobs with date filtering
        const processedJobs = (data || []).map((job: any) => {
          // Parse start and end dates
          const start = job.application_start ? new Date(job.application_start) : null;
          const end = job.application_end ? new Date(job.application_end) : null;

          let isWithinPeriod = true; // Default to true if no dates specified

          if (start && end) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            isWithinPeriod = start <= today && today <= end;
          }

          return {
            ...job,
            isWithinPeriod,
            tasks: Array.isArray(job.tasks) ? job.tasks : [],
            requirements: Array.isArray(job.requirements) 
              ? job.requirements 
              : typeof job.requirements === "string"
              ? job.requirements.split(/\r?\n/).filter(Boolean)
              : [],
          };
        });

        // Filter jobs that are within application period
        const availableJobs = processedJobs.filter(job => job.isWithinPeriod);

        setAllJobs(availableJobs);
        setJobs(availableJobs);

        // Get unique categories
        const uniqueCategories = Array.from(
          new Set(availableJobs.map((job: any) => job.category).filter(Boolean))
        );
        setCategories(uniqueCategories);

      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
        setAllJobs([]);
      }
      
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // Filter jobs based on category and search term
  useEffect(() => {
    let filtered = allJobs;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => 
        slugify(job.category) === slugify(selectedCategory) || 
        job.category === selectedCategory
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setJobs(filtered);
  }, [selectedCategory, searchTerm, allJobs]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL without page reload
    const params = new URLSearchParams();
    if (category !== 'all') {
      params.set('category', category);
    }
    
    const newUrl = params.toString() 
      ? `/career-catalogue?${params.toString()}`
      : '/career-catalogue';
    
    window.history.replaceState({}, '', newUrl);
  };

  // Updated function to navigate to career-details page
  const handleJobClick = (jobId: string) => {
    router.push(`/career-details?id=${jobId}`);
  };

  // Updated function for "View Details" button
  const handleViewDetails = (jobId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click if needed
    }
    router.push(`/career-details?id=${jobId}`);
  };

  const title = categoryFromUrl 
    ? formatCategoryName(categoryFromUrl)
    : 'All Career Opportunities';

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
      
      {/* Hero Section - Luxury Upgrade */}
      <div
        className="relative w-full h-[50vh] bg-cover bg-center luxury-card-glass shadow-gold overflow-hidden"
        style={{ 
          backgroundImage: "url('https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Career-Banner2.png')" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#3d9392]/80 via-[#bfa76a]/30 to-[#1b3d5a]/80" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white luxury-card-glass bg-white/30 backdrop-blur-xl border border-[#bfa76a]/30 rounded-3xl shadow-gold px-8 py-10">
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-4 luxury-gradient-text drop-shadow-[0_6px_32px_rgba(191,167,106,0.45)]">
              <span className="luxury-gold-text luxury-fade-text drop-shadow-gold">{title}</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#bfa76a] luxury-fade-text drop-shadow-gold font-medium">
              {categoryFromUrl 
                ? `Explore ${formatCategoryName(categoryFromUrl).toLowerCase()} opportunities`
                : 'Find your perfect career opportunity with us'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen py-16 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          
          {/* Filters Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6dbeb0]" />
                  <input 
                    type="text"
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d9392] focus:border-transparent"   
                  /> 
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#3d9392] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-[#6dbeb0] hover:text-white'
                    }`}
                  >
                    All Positions ({allJobs.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full font-medium transition-colors ${
                        selectedCategory === category || slugify(selectedCategory) === slugify(category)
                          ? 'bg-[#3d9392] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-[#6dbeb0] hover:text-white'
                      }`}
                    >
                      {category} ({allJobs.filter(job => job.category === category).length})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' 
                    ? 'All Available Positions' 
                    : `${formatCategoryName(selectedCategory)} Positions`
                  }
                </h2>
                <p className="text-gray-600">
                  {jobs.length} position{jobs.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3d9392] focus:border-transparent">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Oldest</option>
                  <option>Sort by: Title A-Z</option>
                  <option>Sort by: Title Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No positions found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `No jobs match your search "${searchTerm}"`
                  : selectedCategory !== 'all'
                  ? `No jobs available in ${formatCategoryName(selectedCategory)}`
                  : 'No job openings available at the moment'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleCategoryChange('all');
                    }}
                    className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    View All Positions
                  </button>
                )}
                <button
                  onClick={() => router.push('/contact?source=careers')}
                  className="border-2 border-[#3d9392] text-[#3d9392] hover:bg-[#3d9392] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Contact HR Team
                </button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {jobs.map((job, idx) => (
                <AnimatedSection 
                  key={job.id} 
                  animation="fade-up" 
                  delay={idx * 100}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  {/* Job Image */}
                  {job.hero_image_url && (
                    <div 
                      className="relative h-48 overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                    >
                      <img
                        src={job.hero_image_url}
                        alt={`${job.title} image`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/50 transition-all duration-300"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#3d9392] text-white shadow-lg">
                          {job.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Job Content - Make entire content area clickable */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job.id);
                    }}
                  >
                    <div className="mb-4">
                      {/* Job Title - Enhanced clickability */}
                      <h3 
                        className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#3d9392] transition-colors line-clamp-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                      >
                        {job.title}
                      </h3>
                      
                      {/* Location and Employment Type - Make clickable */}
                      <div 
                        className="flex items-center text-gray-600 text-sm mb-2 cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location || 'Vientiane, Laos'}
                        <span className="mx-2">•</span>
                        <Briefcase className="w-4 h-4 mr-1" />
                        {job.employment_type || job.type || 'Full-time'}
                      </div>

                      {/* Salary Range - Make clickable */}
                      {job.salary_range && (
                        <div 
                          className="flex items-center text-gray-600 text-sm mb-2 cursor-pointer hover:text-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job.id);
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          {job.salary_range}
                        </div>
                      )}
                    </div>

                    {/* Job Description - Make clickable */}
                    <p 
                      className="text-gray-600 text-sm mb-4 line-clamp-3 cursor-pointer hover:text-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                    >
                      {job.description}
                    </p>

                    {/* Requirements Preview - Make clickable */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div 
                        className="mb-4 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm hover:text-[#3d9392] transition-colors">
                          Key Requirements:
                        </h4>
                        <div className="space-y-1">
                          {job.requirements.slice(0, 2).map((req: string, reqIndex: number) => (
                            <div key={reqIndex} className="flex items-start text-sm text-gray-600 hover:text-gray-700 transition-colors">
                              <div className="w-1.5 h-1.5 bg-[#3d9392] rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              {req}
                            </div>
                          ))}
                          {job.requirements.length > 2 && (
                            <div className="text-sm text-gray-500 hover:text-[#3d9392] transition-colors">
                              +{job.requirements.length - 2} more requirements
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Deadline - Make clickable */}
                    {job.application_end && (
                      <div 
                        className="mb-4 p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                      >
                        <div className="flex items-center text-sm text-orange-700">
                          <Clock className="w-4 h-4 mr-2" />
                          Apply before: {new Date(job.application_end).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {/* Footer - Enhanced clickability */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      {/* Posted Date - Make clickable */}
                      <div 
                        className="flex items-center text-sm text-gray-500 cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      
                      {/* View Details Button - Enhanced styling */}
                      <button 
                        onClick={(e) => handleViewDetails(job.id, e)}
                        className="flex items-center text-[#3d9392] font-medium group-hover:text-[#6dbeb0] transition-colors hover:underline"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}

          {/* Back to Careers */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/careers')}
              className="text-[#3d9392] hover:text-[#6dbeb0] font-medium flex items-center justify-center mx-auto transition-colors"
            >
              ← Back to Careers Page
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CareerCataloguePage;
