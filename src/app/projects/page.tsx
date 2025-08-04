"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Award,
  Filter,
  Search,
  ExternalLink,
  Star,
  CheckCircle,
  Crown,
  Sparkles,
  Eye,
  ArrowRight,
} from "lucide-react";

import AnimatedSection from "../../components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import QuoteModal from "../../components/QuoteModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { supabase } from "../../lib/supabase";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WhatsAppChatButton from '../../components/WhatsAppChatButton';
import FloatingQuoteButton from '../../components/FloatingQuoteButton';

interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  duration: string;
  budget: string;
  client: string;
  status: "completed" | "ongoing";
  image: string;
  description: string;
  features: string[];
  rating: number;
  is_featured?: boolean;
}

const ProjectsPage: React.FC = () => {
  // Section refs for floating nav
  const heroRef = React.useRef<HTMLDivElement>(null);
  const filtersRef = React.useRef<HTMLDivElement>(null);
  const showcaseRef = React.useRef<HTMLDivElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = React.useState("hero");
  const [showNav, setShowNav] = React.useState(false);
  const [showQuoteButton, setShowQuoteButton] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "hero", ref: heroRef },
        { id: "filters", ref: filtersRef },
        { id: "showcase", ref: showcaseRef },
        { id: "cta", ref: ctaRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
      setShowNav(window.scrollY > 0);
      setShowQuoteButton(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionNav = [
    { id: "hero", label: "Hero", ref: heroRef },
    { id: "filters", label: "Filters", ref: filtersRef },
    { id: "showcase", label: "Showcase", ref: showcaseRef },
    { id: "cta", label: "CTA", ref: ctaRef },
  ];
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setScrollY(scrollTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .order("year", { ascending: false })
        .limit(6);

      if (error) {
        console.error("❌ Supabase error:", error.message);
        setError(error.message);
        setProjects([]);
      } else {
        const transformed = (data ?? []).map((p: any) => ({
          ...p,
          features: typeof p.key_features === "string"
            ? p.key_features
                .split('\n')
                .map((f: string) => f.trim())
                .filter(Boolean)
            : [],
        }));

        setProjects(transformed);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  /* —— derived helpers —— */
  const categories = useMemo(() => {
    return [
      { id: "all", name: "All Projects", count: projects.length },
      ...Array.from(new Set(projects.map((p) => p.category))).map((cat) => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: projects.filter((p) => p.category === cat).length,
      })),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(term) ||
        project.location.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchTerm]);

  const stats = [
    { number: "200+", label: "Premium Projects", icon: Building2, gradient: "from-blue-500/20 to-blue-600/20" },
    { number: "10+", label: "Years of Excellence", icon: Award, gradient: "from-amber-500/20 to-amber-600/20" },
    { number: "100%", label: "Client Satisfaction", icon: Star, gradient: "from-emerald-500/20 to-emerald-600/20" },
    { number: "24/7", label: "Luxury Support", icon: Users, gradient: "from-purple-500/20 to-purple-600/20" },
  ];

  const handleViewProject = (projectId: string) => {
    router.push(`/project-details?id=${projectId}`);
  };

  const handleViewAllProjects = () => {
    router.push('/project-catalogue');
  };

  const handleStartProject = () => {
    setIsQuoteModalOpen(true);
  };

  const handleContactTeam = () => {
    router.push("/contact");
  };

  /* ────────────────────────────────────────
     RENDER
  ──────────────────────────────────────── */
  return (
    <>
      <style jsx>{`
        /* 3D Parallax Effects */
        .hero-3d-container {
          perspective: 1000px;
          transform-style: preserve-3d;
          overflow: hidden;
        }
        
        .hero-3d-layer {
          transform-style: preserve-3d;
          will-change: transform;
        }
        
        /* Smooth transitions for 3D elements */
        .hero-3d-smooth {
          transition: transform 0.1s ease-out;
        }
      `}</style>
      {/* Floating Section Navigation (dots) */}
      {showNav && (
        <nav className="fixed left-4 top-1/2 z-[9999] flex flex-col gap-2 -translate-y-1/2 hidden sm:flex bg-white/40 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/30">
          {sectionNav.map((s) => (
            <button
              key={s.id}
              onClick={() => s.ref.current?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-2.5 h-2.5 rounded-full border-2 ${activeSection === s.id ? 'bg-yellow-300 border-yellow-400 scale-110 shadow-yellow-200' : 'bg-white border-yellow-200'} shadow transition-all duration-300`}
              aria-label={s.label}
            />
          ))}
        </nav>
      )}
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      
      {/* ───────── LIQUID GLASS HERO ───────── */}

      <section ref={heroRef} id="hero" className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden" style={{ perspective: '1000px' }}>
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            transform: `translateZ(0) translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0001}) rotateX(${scrollY * 0.01}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <img
            src="https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Construction projects background"
            className="w-full h-full object-cover object-center opacity-30"
            draggable="false"
            style={{
              filter: `brightness(${1 - scrollY * 0.0003}) contrast(${1 + scrollY * 0.0002})`
            }}
          />
          {/* Overlay for contrast - lighter for more visible bg */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/60 to-slate-900/70"
            style={{
              transform: `translateZ(10px) translateY(${scrollY * 0.3}px)`,
              transformStyle: 'preserve-3d'
            }}
          ></div>
        </div>
        {/* Animated Background Elements */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            transform: `translateZ(20px) translateY(${scrollY * 0.2}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        </div>


        <div 
          className="relative z-10 container mx-auto px-6 py-32 flex items-center min-h-screen"
          style={{
            transform: `translateZ(30px) translateY(${scrollY * -0.1}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              {/* Luxury Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center bg-black/30 backdrop-blur-xl border border-white/30 rounded-full px-8 py-4 mb-8 shadow-2xl"
              >
                <Crown className="w-5 h-5 text-amber-400 mr-3" />
                <span className="text-white font-semibold text-lg drop-shadow-lg">Premium Construction Excellence</span>
                <Sparkles className="w-5 h-5 text-amber-400 ml-3" />
              </motion.div>

              {/* Luxury Animated Title */}
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl lg:text-8xl font-extralight mb-8 tracking-tight text-white drop-shadow-2xl"
              >
                Our Luxury <br />
                <motion.span
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent font-light drop-shadow-lg"
                >
                  Projects
                </motion.span>
              </motion.h1>

              {/* Luxury Animated Description */}
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl lg:text-3xl text-slate-100 mb-12 leading-relaxed font-light max-w-4xl mx-auto drop-shadow-lg"
              >
                Crafting architectural masterpieces and construction excellence across Laos with unparalleled sophistication
              </motion.p>

              {/* Luxury Animated CTA Buttons */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.18,
                      delayChildren: 1.0,
                    },
                  },
                }}
                className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
              >
                <motion.button
                  onClick={handleViewAllProjects}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="group bg-gradient-to-r from-amber-400 to-amber-500 backdrop-blur-xl hover:from-amber-500 hover:to-amber-600 text-slate-900 px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center text-xl border border-amber-400/50"
                >
                  <Eye className="w-6 h-6 mr-3" />
                  Explore Portfolio
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={handleStartProject}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.98 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="group bg-black/40 backdrop-blur-xl border border-white/40 hover:bg-black/60 text-white px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl flex items-center justify-center text-xl"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Start Your Project
                </motion.button>
              </motion.div>
            </div>

            {/* Enhanced Liquid Glass Stats */}
            <AnimatedSection animation="fade-up" delay={200}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <AnimatedSection key={index} animation="scale" delay={index * 100}>
                      <div className="bg-black/20 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-center hover:bg-black/30 transition-all duration-300 group shadow-2xl">
                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${stat.gradient} backdrop-blur-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-4xl lg:text-5xl font-light text-white mb-3 tracking-tight drop-shadow-lg">{stat.number}</div>
                        <div className="text-slate-200 font-medium drop-shadow-md">{stat.label}</div>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ───────── LIQUID GLASS FILTERS & SEARCH ───────── */}
      <section ref={filtersRef} id="filters" className="py-16 bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 backdrop-blur-3xl">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                  {/* Liquid Glass Search */}
                  <div className="relative flex-1 max-w-lg">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search luxury projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 text-lg font-medium placeholder-slate-400 shadow-inner"
                    />
                  </div>

                  {/* Liquid Glass Category Filters */}
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-xl text-sm lg:text-base shadow-lg ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-amber-400/90 to-amber-500/90 text-slate-900 border border-amber-400/30 shadow-amber-400/25"
                            : "bg-white/30 border border-white/30 text-slate-600 hover:bg-white/50 hover:border-amber-400/30 hover:text-amber-600"
                        }`}
                      >
                        {category.name}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs backdrop-blur-xl ${
                          selectedCategory === category.id 
                            ? "bg-slate-900/20 text-slate-900 border border-slate-900/10" 
                            : "bg-white/40 text-slate-500 border border-white/20"
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ───────── LIQUID GLASS PROJECTS SHOWCASE ───────── */}
      <section ref={showcaseRef} id="showcase" className="py-24 bg-gradient-to-br from-slate-50/95 via-white/95 to-slate-50/95 backdrop-blur-3xl">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-amber-50/80 to-amber-100/80 backdrop-blur-xl rounded-full px-8 py-4 mb-8 border border-amber-200/30 shadow-xl">
              <Crown className="w-5 h-5 text-amber-600 mr-3" />
              <span className="text-amber-700 font-bold text-lg">Featured Portfolio</span>
              <Sparkles className="w-5 h-5 text-amber-600 ml-3" />
            </div>
            <h2 className="text-5xl lg:text-6xl font-extralight text-slate-900 mb-8 tracking-tight">
              Luxury <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
              Discover our curated collection of premium construction projects that exemplify excellence, innovation, and sophisticated craftsmanship
            </p>
          </AnimatedSection>

          {/* Premium Loading State */}
          {loading && (
            <AnimatedSection>
              <div className="text-center py-20">
                <div className="relative inline-flex">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto mb-8"></div>
                  <div className="absolute inset-2 h-12 w-12 animate-pulse rounded-full bg-white/80 backdrop-blur-xl"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-amber-500" />
                </div>
                <p className="text-slate-600 font-medium text-xl">Curating luxury projects...</p>
              </div>
            </AnimatedSection>
          )}

          {/* Error State */}
          {error && (
            <AnimatedSection>
              <div className="text-center py-20 bg-gradient-to-r from-red-50/80 to-red-100/80 backdrop-blur-xl rounded-3xl border border-red-200/30 shadow-xl">
                <div className="text-red-600 mb-4">
                  <Building2 className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Unable to Load Projects</h3>
                  <p className="text-lg">{error}</p>
                </div>
              </div>
            </AnimatedSection>
          )}

          {!loading && !error && (
            <>
              {/* Liquid Glass Projects Grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
                {filteredProjects.map((project, index) => (
                  <AnimatedSection
                    key={project.id}
                    animation="fade-up"
                    delay={index * 100}
                    className="group"
                  >
                    <div 
                      className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden border border-white/30 hover:border-amber-200/50 hover:bg-white/80"
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                    >
                      {/* Premium Project Image */}
                      <div className="relative h-80 overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Liquid Glass Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                        {/* Liquid Glass Badges */}
                        <div className="absolute top-6 left-6">
                          {project.is_featured && (
                            <div className="bg-gradient-to-r from-amber-400/90 to-amber-500/90 backdrop-blur-xl text-slate-900 px-4 py-2 rounded-full text-sm font-bold mb-3 flex items-center shadow-xl border border-amber-400/30">
                              <Crown className="w-4 h-4 mr-2" />
                              Featured
                            </div>
                          )}
                          <div className="bg-white/20 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-semibold capitalize border border-white/30 shadow-xl">
                            {project.category}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                          <div className="bg-emerald-500/80 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-xl border border-white/30">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {project.status}
                          </div>
                        </div>

                        {/* Rating */}
                        {project.rating && (
                          <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-xl text-white px-3 py-2 rounded-full border border-white/30 shadow-xl">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-2" />
                              <span className="font-semibold">{project.rating}</span>
                            </div>
                          </div>
                        )}

                        {/* Liquid Glass Action Button */}
                        <div className="absolute bottom-6 right-6">
                          <button
                            onClick={() => handleViewProject(project.id)}
                            className={`bg-white/20 backdrop-blur-xl text-white p-3 rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-xl ${
                              hoveredProject === project.id ? 'scale-110 shadow-2xl' : ''
                            }`}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Liquid Glass Project Info */}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                          {project.title}
                        </h3>
                        
                        <p className="text-slate-600 leading-relaxed mb-6 font-light line-clamp-2">
                          {project.description}
                        </p>

                        {/* Project Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-slate-500">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100/80 to-blue-200/80 backdrop-blur-xl rounded-xl flex items-center justify-center mr-4 border border-blue-200/30">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{project.location}</span>
                          </div>
                          <div className="flex items-center text-slate-500">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-100/80 to-emerald-200/80 backdrop-blur-xl rounded-xl flex items-center justify-center mr-4 border border-emerald-200/30">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="font-medium">Completed in {project.year}</span>
                          </div>
                          <div className="flex items-center text-slate-500">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-100/80 to-purple-200/80 backdrop-blur-xl rounded-xl flex items-center justify-center mr-4 border border-purple-200/30">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">{project.client}</span>
                          </div>
                        </div>

                        {/* Features */}
                        {project.features && project.features.length > 0 && (
                          <div className="mb-8 bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-inner">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                              <Award className="w-5 h-5 text-amber-500 mr-2" />
                              Key Features
                            </h4>
                            <div className="space-y-3">
                              {project.features.slice(0, 3).map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center">
                                  <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mr-4 flex-shrink-0"></div>
                                  <span className="text-slate-700 font-medium">{feature}</span>
                                </div>
                              ))}
                              {project.features.length > 3 && (
                                <div className="flex items-center text-amber-600 font-semibold">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  <span>+{project.features.length - 3} more premium features</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Liquid Glass Action Button */}
                        <button
                          onClick={() => handleViewProject(project.id)}
                          className="w-full bg-gradient-to-r from-amber-400/90 to-amber-500/90 backdrop-blur-xl hover:from-amber-500/90 hover:to-amber-600/90 text-slate-900 py-4 px-6 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center group text-lg border border-amber-400/30"
                        >
                          <Eye className="w-5 h-5 mr-3" />
                          View Project Details
                          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <AnimatedSection>
                  <div className="text-center py-20 bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl">
                    <div className="w-24 h-24 bg-gradient-to-r from-slate-200/80 to-slate-300/80 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-300/30">
                      <Building2 className="w-12 h-12 text-slate-500" />
                    </div>
                    <h3 className="text-3xl font-light text-slate-700 mb-4">No Projects Found</h3>
                    <p className="text-slate-500 text-lg font-light">
                      Refine your search criteria to discover more luxury projects
                    </p>
                  </div>
                </AnimatedSection>
              )}
            </>
          )}
        </div>

        {/* Liquid Glass View All Button */}
        {!loading && filteredProjects.length > 0 && (
          <div className="mt-20 text-center">
            <AnimatedSection>
              <button
                onClick={handleViewAllProjects}
                className="group bg-slate-800/90 backdrop-blur-xl hover:bg-slate-900/90 text-white px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center mx-auto text-xl border border-slate-700/30"
              >
                <Building2 className="w-6 h-6 mr-4" />
                Explore Complete Portfolio
                <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </AnimatedSection>
          </div>
        )}
      </section>

      {/* ───────── LIQUID GLASS CTA SECTION ───────── */}
      <section ref={ctaRef} id="cta" className="py-24 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-3xl text-white relative overflow-hidden" style={{ perspective: '800px' }}>
        {/* Background Effects */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateZ(0) translateY(${scrollY * 0.1}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.3),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <AnimatedSection className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-amber-400/20 to-amber-500/20 backdrop-blur-xl border border-amber-400/30 rounded-full px-8 py-4 mb-8 shadow-2xl">
              <Crown className="w-5 h-5 text-amber-400 mr-3" />
              <span className="text-amber-200 font-bold text-lg">Start Your Journey</span>
              <Sparkles className="w-5 h-5 text-amber-400 ml-3" />
            </div>

            <h2 className="text-5xl lg:text-6xl font-extralight mb-8 tracking-tight">
              Ready to Create Your 
              <span className="block bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent font-light">
                Luxury Project?
              </span>
            </h2>

            <p className="text-2xl text-slate-300 mb-12 leading-relaxed font-light max-w-4xl mx-auto">
              Join our distinguished clientele and experience unparalleled construction excellence with our premium services
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={handleStartProject}
                className="group bg-gradient-to-r from-amber-400/90 to-amber-500/90 backdrop-blur-xl hover:from-amber-500/90 hover:to-amber-600/90 text-slate-900 px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center text-xl border border-amber-400/30"
              >
                <Sparkles className="w-6 h-6 mr-4" />
                Start Your Luxury Project
                <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleContactTeam}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl flex items-center justify-center text-xl"
              >
                <Users className="w-6 h-6 mr-4" />
                Consult Our Experts
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Floating Quote Button */}
      {showQuoteButton && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <Footer />
      <WhatsAppChatButton />

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="products_get_product_quote"
      />
    </>
  );
};

export default ProjectsPage;
