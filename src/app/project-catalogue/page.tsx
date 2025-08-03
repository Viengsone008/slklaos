"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // ✅ Changed from "next/router"
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Search,
  ExternalLink,
  Star,
  CheckCircle,
  ChevronUp,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import Navbar from "../Navbar";
import Footer from "../Footer";
import QuoteModal from "../../components/QuoteModal";
import AnimatedSection from "../../components/AnimatedSection";

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
}

const testimonials = [
  {
    name: "Mr. Somchai Vong",
    company: "Lao Construction Group",
    text: "SLK exceeded our expectations in every way. Their professionalism and attention to detail are unmatched.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Ms. Noy Chanthavong",
    company: "Vientiane Real Estate",
    text: "The team delivered our project on time and with exceptional quality. Highly recommended!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Mr. Bounthavy Phommasane",
    company: "Golden Lotus Hotels",
    text: "From start to finish, SLK was a true partner. We look forward to working with them again.",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = Math.ceil(value / (duration / 16));
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{display}</span>;
}

const ProjectCataloguePage: React.FC = () => {
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
  const router = useRouter(); // ✅ Next.js router
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [testimonialIdx, setTestimonialIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"year" | "budget" | "location">("year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

 useEffect(() => {
  const fetchProjects = async () => {
    setIsLoading(true);

    let query = supabase
      .from("projects")
      .select("*")
      .eq("is_published", true); // only fetch published

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
    }

    const { data, error } = await query;

    if (error) setError(error.message);
    else setProjects(data as Project[]);

    setIsLoading(false); 
  };

  fetchProjects();
}, [sortBy, sortOrder]);



  

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categories = [
    { id: "all", name: "All Projects", count: projects.length },
    ...Array.from(new Set(projects.map((p) => p.category))).map((cat) => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: projects.filter((p) => p.category === cat).length,
    })),
  ];

  const filtered = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (selectedCategory === "all" || p.category === selectedCategory) &&
      (selectedStatus === "all" || p.status === selectedStatus) &&
      (p.title.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.client.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term))
    );
  });

  // ✅ Updated navigation function
  const handleViewProject = (id: string) => {
    router.push(`/project-details?id=${id}`);
  };

  // ✅ Updated navigation function
  const handleContactTeam = () => {
    router.push("/contact");
  };


  // Stats for animated counters
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const ongoingProjects = projects.filter((p) => p.status === "ongoing").length;
  const uniqueClients = new Set(projects.map((p) => p.client)).size;

  // Featured project (highest rating)
  const featuredProject = projects.reduce((prev, curr) => (curr.rating > (prev?.rating || 0) ? curr : prev), null);

  // Parallax effect for hero
  const [parallax, setParallax] = useState(0);
  useEffect(() => {
    const onScroll = () => setParallax(window.scrollY * 0.2);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-animate stats
  useEffect(() => {
    setShowStats(true);
  }, [isLoading]);

  // Testimonials auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-[999] h-2 bg-gradient-to-r from-[#3d9392]/30 to-[#6dbeb0]/30">
        <div
          className="h-full bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] rounded-r-full shadow-lg transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />

      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Hero Background Image with Parallax */}
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${parallax}px)` }}>
          <img
            src="https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Project catalogue hero"
            className="w-full h-full object-cover object-center opacity-50"
            draggable="false"
          />
          {/* Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/60 to-slate-900/70"></div>
        </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        </div>
        <div className="relative z-20 container mx-auto px-4 text-center flex flex-col justify-center min-h-screen">
          <AnimatedSection animation="fade-down">
            <h1 className="text-5xl lg:text-7xl font-bold mb-4 drop-shadow-2xl">
              Project <span className="text-[#6dbeb0]">Catalogue</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
              A comprehensive archive of all our construction achievements across Laos
            </p>
          </AnimatedSection>
          {/* Animated Stats Section */}
          <div className="mt-12 flex flex-col md:flex-row gap-8 justify-center items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={showStats ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-amber-400">
                <AnimatedNumber value={totalProjects} />
              </div>
              <div className="text-lg text-white/80 mt-2">Total Projects</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={showStats ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }} className="bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-green-400">
                <AnimatedNumber value={completedProjects} />
              </div>
              <div className="text-lg text-white/80 mt-2">Completed</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={showStats ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }} className="bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-blue-400">
                <AnimatedNumber value={ongoingProjects} />
              </div>
              <div className="text-lg text-white/80 mt-2">Ongoing</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={showStats ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8 }} className="bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-emerald-400">
                <AnimatedNumber value={uniqueClients} />
              </div>
              <div className="text-lg text-white/80 mt-2">Clients</div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white shadow-sm">
        {/* Project Status Filter */}
        <div className="container mx-auto px-4 flex flex-wrap gap-4 items-center justify-center mb-6">
          <button
            className={`px-5 py-2 rounded-full font-semibold border transition-all duration-300 ${selectedStatus === "all" ? "bg-[#3d9392] text-white border-[#3d9392] shadow-lg" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-[#6dbeb0]"}`}
            onClick={() => setSelectedStatus("all")}
          >
            All Status
          </button>
          <button
            className={`px-5 py-2 rounded-full font-semibold border transition-all duration-300 ${selectedStatus === "completed" ? "bg-green-500 text-white border-green-500 shadow-lg" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-green-100"}`}
            onClick={() => setSelectedStatus("completed")}
          >
            Completed
          </button>
          <button
            className={`px-5 py-2 rounded-full font-semibold border transition-all duration-300 ${selectedStatus === "ongoing" ? "bg-blue-500 text-white border-blue-500 shadow-lg" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-blue-100"}`}
            onClick={() => setSelectedStatus("ongoing")}
          >
            Ongoing
          </button>
        </div>
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d9392] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "year" | "budget" | "location")}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="year">Year</option>
              <option value="budget">Budget</option>
              <option value="location">Location</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "bg-[#3d9392] text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-[#6dbeb0]"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

       {isLoading && <div className="text-center py-20 text-gray-600">Loading projects…</div>}
      {error && <div className="text-center py-20 text-red-600">{error}</div>}

      {!isLoading && !error && (
        <>
          <section className="py-16 bg-[#eef4f4]">
            <div className="container mx-auto px-4">
              {/* Featured Project */}
              {featuredProject && (
                <AnimatedSection animation="fade-in" className="mb-12">
                  <div className="relative bg-gradient-to-br from-[#3d9392]/90 to-[#6dbeb0]/90 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 border-4 border-amber-400/30">
                    <div className="w-full md:w-1/2 h-72 rounded-2xl overflow-hidden shadow-lg">
                      <img src={featuredProject.image} alt={featuredProject.title} className="w-full h-full object-cover object-center" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="mb-2">
                        <span className="inline-block bg-amber-400/80 text-slate-900 px-4 py-1 rounded-full font-bold text-xs mr-2">Featured</span>
                        <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full font-bold text-xs">{featuredProject.category}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">{featuredProject.title}</h2>
                      <p className="text-white/80 mb-4 line-clamp-3">{featuredProject.description}</p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {featuredProject.features?.map((tag, i) => (
                          <span key={i} className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center text-white/80"><MapPin className="w-4 h-4 mr-1 text-orange-400" />{featuredProject.location}</div>
                        <div className="flex items-center text-white/80"><Calendar className="w-4 h-4 mr-1 text-orange-400" />{featuredProject.year}</div>
                        <div className="flex items-center text-white/80"><Users className="w-4 h-4 mr-1 text-orange-400" />{featuredProject.client}</div>
                      </div>
                      <button
                        onClick={() => handleViewProject(featuredProject.id)}
                        className="mt-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg"
                      >
                        View Project
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              )}

              {/* Project Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.slice(0, visibleCount).map((project, index) => (
                  <AnimatedSection
                    key={project.id}
                    animation="fade-up"
                    delay={index * 100}
                    className="relative rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 group border-2 border-transparent hover:border-[#6dbeb0]/60 bg-white/70 backdrop-blur-xl overflow-hidden"
                  >
                    {/* Badge Ribbon */}
                    <div
                      className={`absolute top-4 left-4 z-20 px-5 py-1.5 rounded-full font-black shadow-lg border-2 ${
                      project.status === 'completed'
                        ? 'border-green-400'
                        : 'border-blue-400'
                    } font-sans backdrop-blur-md`}
                    style={{
                      background: project.status === 'completed'
                        ? 'linear-gradient(90deg, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.15) 100%)'
                        : 'linear-gradient(90deg, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.15) 100%)',
                      color: '#fff',
                      textAlign: 'center',
                      letterSpacing: '0.05em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 2px #fff',
                      fontSize: '1rem',
                      fontWeight: 900,
                      lineHeight: '32px',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08)'
                    } as any}
                  >
                    <span
                      style={{
                        background: 'linear-gradient(90deg,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.10) 100%)',
                        borderRadius: '9999px',
                        padding: '0 10px',
                        boxShadow: '0 1px 4px 0 rgba(255,255,255,0.10)'
                      }}
                    >
                      {project.status === 'completed' ? 'Completed' : 'Ongoing'}
                    </span>
                  </div>
                  {/* Favorite Button */}
                  <button
                    className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-[#6dbeb0]/80 text-[#3d9392] rounded-full p-2 shadow transition-all"
                    title="Bookmark project"
                    tabIndex={0}
                    aria-label="Bookmark project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
                    </svg>
                  </button>
                  {/* Card Image with Hover Overlay */}
                  <div className="relative h-64 overflow-hidden group">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-6">
                      <p className="text-white text-sm mb-2 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.features?.map((tag, i) => (
                          <span key={i} className="bg-[#eef4f4]/80 text-[#3d9392] px-3 py-1 rounded-full text-xs font-semibold">{tag}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleViewProject(project.id)}
                        className="mt-2 w-full bg-[#3d9392]/90 hover:bg-[#6dbeb0]/90 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 group"
                      >
                        View Details
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    {/* Client Avatar */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-white/80 overflow-hidden flex items-center justify-center">
                        <span className="text-[#3d9392] font-bold text-lg">{project.client?.charAt(0)}</span>
                      </div>
                      <span className="text-xs text-white/80 bg-black/40 px-2 py-1 rounded-lg font-semibold">{project.client}</span>
                    </div>
                  </div>
                  {/* Quick Stats Row */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.features?.map((tag, i) => (
                        <span key={i} className="bg-[#eef4f4] text-[#3d9392] px-3 py-1 rounded-full text-xs font-semibold">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {project.year}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {project.rating}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        {project.client}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-left">
                        <div className="text-xs text-gray-500">Budget</div>
                        <div className="font-bold text-orange-600 text-lg">{project.budget}</div>
                      </div>
                      <button
                        onClick={() => handleViewProject(project.id)}
                        className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 group"
                      >
                        View Project
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
                ))}
              </div>

              {visibleCount < filtered.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="bg-[#6dbeb0] hover:bg-[#3d9392] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
                  >
                    Load More Projects
                  </button>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </section>
          {/* Testimonials Carousel */}
          <section className="py-20 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.15),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.15),transparent_50%)]"></div>
            </div>
            <div className="relative z-10 container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
              <div className="max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIdx}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center flex flex-col items-center"
                  >
                    <img src={testimonials[testimonialIdx].image} alt={testimonials[testimonialIdx].name} className="w-20 h-20 rounded-full mb-4 border-4 border-amber-400/40 object-cover" />
                    <p className="text-xl text-white/90 mb-4 font-light">“{testimonials[testimonialIdx].text}”</p>
                    <div className="font-bold text-amber-300">{testimonials[testimonialIdx].name}</div>
                    <div className="text-white/60 text-sm">{testimonials[testimonialIdx].company}</div>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      className={`w-3 h-3 rounded-full ${i === testimonialIdx ? "bg-amber-400" : "bg-white/30"}`}
                      onClick={() => setTestimonialIdx(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}



      <section className="py-24 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-3xl text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.3),transparent_50%)]"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <AnimatedSection className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-amber-400/20 to-amber-500/20 backdrop-blur-xl border border-amber-400/30 rounded-full px-8 py-4 mb-8 shadow-2xl">
              <span className="text-amber-200 font-bold text-lg">Start Your Journey</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-extralight mb-8 tracking-tight">
              Ready to Create Your 
              <span className="block bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent font-light">
                Luxury Project?
              </span>
            </h2>
            <p className="text-2xl text-slate-300 mb-12 leading-relaxed font-light max-w-4xl mx-auto">
              Join our satisfied clients and let us bring your vision to life
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="group bg-gradient-to-r from-amber-400/90 to-amber-500/90 backdrop-blur-xl hover:from-amber-500/90 hover:to-amber-600/90 text-slate-900 px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center text-xl border border-amber-400/30"
              >
                Get a Quote
              </button>
              <button
                onClick={handleContactTeam}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white px-12 py-6 rounded-2xl font-bold transition-all duration-300 shadow-2xl flex items-center justify-center text-xl"
              >
                Contact Our Team
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#3d9392] text-white rounded-full shadow-lg hover:bg-[#6dbeb0] transition-all duration-300"
          aria-label="Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="website"
      />
    </>
  );
};

export default ProjectCataloguePage;
