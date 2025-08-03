"use client";
// --- Hero luxury overlays and parallax ---
const HeroLuxuryOverlays = () => {
  const parallaxRef = React.useRef<SVGSVGElement>(null);
  const parallaxRef2 = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = parallaxRef.current;
      const el2 = parallaxRef2.current;
      if (el) {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 30; // max 15px
        const y = (e.clientY / innerHeight - 0.5) * 30;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      if (el2) {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 15; // max 7.5px
        const y = (e.clientY / innerHeight - 0.5) * 15;
        el2.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Sparkles/gold dust - foreground */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{mixBlendMode:'screen'}}>
        <g>
          {/* Large animated sparkles */}
          <circle cx="12%" cy="28%" r="2.5" fill="#fff8e1" opacity="0.7">
            <animate attributeName="r" values="2.5;5;2.5" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="18%" r="1.5" fill="#bfa76a" opacity="0.8">
            <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="70%" r="2" fill="#fff" opacity="0.5">
            <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="30%" cy="80%" r="1.2" fill="#e5e2d6" opacity="0.7">
            <animate attributeName="r" values="1.2;2.5;1.2" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* Extra sparkles and gold dust */}
          <circle cx="55%" cy="22%" r="1.8" fill="#fffbe6" opacity="0.6">
            <animate attributeName="r" values="1.8;3.2;1.8" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="60%" r="1.1" fill="#bfa76a" opacity="0.5">
            <animate attributeName="r" values="1.1;2.2;1.1" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="40%" cy="40%" r="1.5" fill="#fff8e1" opacity="0.5">
            <animate attributeName="r" values="1.5;2.8;1.5" dur="2.7s" repeatCount="indefinite" />
          </circle>
          {/* Geometric shapes - animated */}
          <rect x="20%" y="15%" width="8" height="8" fill="#bfa76a" opacity="0.18">
            <animateTransform attributeName="transform" type="rotate" from="0 24 19" to="360 24 19" dur="7s" repeatCount="indefinite" />
          </rect>
          <polygon points="90,10 95,20 85,20" fill="#fffbe6" opacity="0.13">
            <animateTransform attributeName="transform" type="rotate" from="0 90 15" to="360 90 15" dur="9s" repeatCount="indefinite" />
          </polygon>
        </g>
      </svg>
      {/* Parallax gold lines/abstract shapes - main parallax */}
      <svg ref={parallaxRef} className="absolute left-0 top-0 w-full h-full z-20 pointer-events-none" style={{transition:'transform 0.5s cubic-bezier(.4,0,.2,1)'}}>
        <g>
          <rect x="10%" y="10%" width="80%" height="2" fill="#bfa76a" opacity="0.12" rx="1" />
          <rect x="20%" y="30%" width="60%" height="2" fill="#bfa76a" opacity="0.18" rx="1" />
          <ellipse cx="80%" cy="80%" rx="60" ry="12" fill="#bfa76a" opacity="0.08" />
          <ellipse cx="25%" cy="60%" rx="40" ry="8" fill="#bfa76a" opacity="0.10" />
        </g>
      </svg>
      {/* Parallax geometric shapes - subtle, background parallax */}
      <svg ref={parallaxRef2} className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none" style={{transition:'transform 0.7s cubic-bezier(.4,0,.2,1)'}}>
        <g>
          <polygon points="10,90 30,110 20,120" fill="#bfa76a" opacity="0.07">
            <animateTransform attributeName="transform" type="rotate" from="0 20 105" to="360 20 105" dur="12s" repeatCount="indefinite" />
          </polygon>
          <rect x="80%" y="80%" width="16" height="16" fill="#fffbe6" opacity="0.09">
            <animateTransform attributeName="transform" type="rotate" from="0 88 88" to="360 88 88" dur="10s" repeatCount="indefinite" />
          </rect>
        </g>
      </svg>
    </>
  );
};
import ProjectGallery from '../components/ProjectGallery';
import WhatsAppChatButton from '../../components/WhatsAppChatButton';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import FloatingQuoteButton from '../../components/FloatingQuoteButton';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { Fragment } from 'react';
import Head from 'next/head';
import { Building2, Shield, Layers, CheckCircle, ArrowRight, Star, Award, Users, Clock } from 'lucide-react';
import AnimatedSection from '../../components/AnimatedSection';
import QuoteModal from '../../components/QuoteModal';
import { useLanguage } from '../../contexts/LanguageContext';
import ContactForm from '../ContactForm';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../Navbar';
import Footer from '../Footer';

const ServicesPage = () => { 
  // Section refs for floating nav
  // (keep only one set of refs, state, and sectionNav)
  const [showNav, setShowNav] = useState(false);
  const [showQuoteButton, setShowQuoteButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "hero", ref: heroRef },
        { id: "services", ref: servicesRef },
        { id: "gallery", ref: galleryRef },
        { id: "testimonials", ref: testimonialsRef },
        { id: "contact", ref: contactRef },
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
  // Section refs for floating nav
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "hero", ref: heroRef },
        { id: "services", ref: servicesRef },
        { id: "gallery", ref: galleryRef },
        { id: "testimonials", ref: testimonialsRef },
        { id: "contact", ref: contactRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionNav = [
    { id: "hero", label: "Hero", ref: heroRef },
    { id: "services", label: "Services", ref: servicesRef },
    { id: "gallery", label: "Gallery", ref: galleryRef },
    { id: "testimonials", label: "Testimonials", ref: testimonialsRef },
    { id: "contact", label: "Contact", ref: contactRef },
  ];
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Accessibility: scroll down indicator
  const handleScrollDown = () => {
    if (heroRef.current) {
      window.scrollTo({
        top: heroRef.current.clientHeight - 80,
        behavior: 'smooth',
      });
    }
  };
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('All');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      if (!error && data) {
        setPosts(data);
      }
      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slugify = (str: string) =>
    str.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');

  useEffect(() => {
    if (!searchParams) return;
    const serviceTitle = searchParams.get('service');
    if (serviceTitle) {
      const id = slugify(serviceTitle);
      const el = document.getElementById(id);

      if (el) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      }
    }
  }, [searchParams]);

  const services = [
    {
      icon: Building2,
      title: "Design & Construction",
      subtitle: "Complete construction solutions from concept to completion",
      description: "Our comprehensive design and construction services cover everything from initial planning to final handover. We specialize in residential, commercial, and industrial projects.",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image/Services/design01.jpg", 
      features: [
        "Architectural Design & Planning",
        "Structural Engineering",
        "Project Management",
        "Quality Control & Inspection",
        "Interior Design Services",
        "Landscape Architecture"
      ],
      benefits: [
        "15+ years of experience",
        "Licensed professionals",
        "On-time delivery guarantee",
        "Comprehensive warranty"
      ],
      pricing: "Starting from $50,000",
      timeline: "3-12 months",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: Shield,
      title: "Waterproofing Solutions",
      subtitle: "Advanced waterproofing systems for lasting protection",
      description: "Protect your investment with our state-of-the-art waterproofing solutions. We use premium materials and proven techniques to ensure long-lasting protection.",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//WaterproofingService.png",
      features: [
        "Roof Waterproofing",
        "Foundation Protection",
        "Basement Waterproofing",
        "Bathroom & Kitchen Sealing",
        "Swimming Pool Waterproofing",
        "Industrial Waterproofing"
      ],
      benefits: [
        "10-year warranty",
        "Premium materials",
        "Expert installation",
        "Maintenance support"
      ],
      pricing: "Starting from $5,000",
      timeline: "1-4 weeks",
      bgGradient: "from-cyan-50 to-blue-50"
    },
    {
      icon: Layers,
      title: "Flooring Materials & Installation",
      subtitle: "Premium flooring solutions for every space",
      description: "Transform your spaces with our extensive range of premium flooring materials. From luxury tiles to hardwood, we have the perfect solution for your needs.",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//ServiceFloor.png",
      features: [
        "Ceramic & Porcelain Tiles",
        "Natural Stone Flooring",
        "Hardwood & Laminate",
        "Vinyl & LVT Flooring",
        "Epoxy Floor Coatings",
        "Custom Design Solutions"
      ],
      benefits: [
        "Wide material selection",
        "Professional installation",
        "Competitive pricing",
        "After-sales service"
      ],
      pricing: "Starting from $15/sqm",
      timeline: "1-3 weeks",
      bgGradient: "from-orange-50 to-amber-50"
    }
  ];

  const serviceTabs = ['All', ...services.map(s => s.title)];

  const processSteps = [
    {
      step: "01",
      title: "Consultation",
      description: "Free initial consultation to understand your needs and requirements",
      icon: Users
    },
    {
      step: "02",
      title: "Planning",
      description: "Detailed planning and design phase with 3D visualizations",
      icon: Building2
    },
    {
      step: "03",
      title: "Execution",
      description: "Professional execution with regular progress updates",
      icon: CheckCircle
    },
    {
      step: "04",
      title: "Completion",
      description: "Final inspection, handover, and ongoing support",
      icon: Award
    }
  ];

  const handleViewPortfolio = () => {
    router.push('/projects');
  };

  return (
    <>
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
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
        <style>{`
          .hero-shine {
            position: relative;
            overflow: hidden;
          }
          .hero-shine-bar {
            position: absolute;
            top: 0;
            left: -75%;
            width: 50%;
            height: 100%;
            background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-20deg);
            pointer-events: none;
            animation: heroShineMove 2.2s cubic-bezier(.4,0,.2,1) 0.5s 1;
          }
          @keyframes heroShineMove {
            0% { left: -75%; }
            60% { left: 110%; }
            100% { left: 110%; }
          }
        `}</style>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f9e7d2]">
        {/* Hero Section */}
        <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#f8fafc] text-[#1a2936] overflow-hidden">
          {/* Decorative overlays and parallax */}
          <HeroLuxuryOverlays />
          <div className="absolute inset-0">
            <img
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image/Services/design01.jpg"
              alt="Construction services background luxury"
              className="w-full h-full object-cover opacity-20 scale-105 transition-all duration-700"
              style={{ zIndex: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#bfa76a]/80 via-[#e5e2d6]/80 to-[#f8fafc]/90" style={{ zIndex: 2 }}></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center h-full">
            <AnimatedSection className="text-center max-w-xl mx-auto animate-fade-in pt-32 sm:pt-0">
              <h1
                className="text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-2xl relative hero-shine"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936', textShadow: '0 2px 8px rgba(255,255,255,0.7)', overflow: 'hidden' }}
              >
                <span className="inline-block animate-fadeInUp">Our <span className="text-[#bfa76a]">Services</span></span>
                <span className="hero-shine-bar" />
              </h1>
              <div className="text-xl font-bold text-[#bfa76a] mb-2 tracking-wide" style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}>
                Building Excellence, Delivering Trust
              </div>
              <div className="h-1 w-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-6 mx-auto opacity-80" />
              <p
                className="text-2xl mb-8 leading-relaxed font-semibold"
                style={{ color: '#1a2936', fontFamily: 'Playfair Display, serif', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}
              >
                Comprehensive construction solutions tailored to your needs
              </p>
              {/* Glassmorphism Stat Card */}
              <div className="mx-auto mb-8 flex flex-col sm:flex-row gap-4 justify-center">
                <div className="backdrop-blur-lg bg-white/40 border border-[#bfa76a]/30 rounded-2xl px-8 py-4 flex flex-col items-center shadow-lg min-w-[220px]">
                  <div className="text-4xl font-extrabold text-[#bfa76a] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>500+</div>
                  <div className="text-lg font-semibold text-[#1a2936]">Projects Completed</div>
                </div>
                <div className="backdrop-blur-lg bg-white/40 border border-[#bfa76a]/30 rounded-2xl px-8 py-4 flex flex-col items-center shadow-lg min-w-[220px]">
                  <div className="text-4xl font-extrabold text-[#bfa76a] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>15+</div>
                  <div className="text-lg font-semibold text-[#1a2936]">Years Experience</div>
                </div>
                <div className="backdrop-blur-lg bg-white/40 border border-[#bfa76a]/30 rounded-2xl px-8 py-4 flex flex-col items-center shadow-lg min-w-[220px]">
                  <div className="text-4xl font-extrabold text-[#bfa76a] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>100%</div>
                  <div className="text-lg font-semibold text-[#1a2936]">Client Satisfaction</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] hover:from-[#e5e2d6] hover:to-[#bfa76a] px-8 py-4 rounded-lg font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}
                >
                  <span>Get Free Quote</span>
                  <ArrowRight className="w-5 h-5 inline" />
                </button>
                <button
                  onClick={handleViewPortfolio}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] font-extrabold px-8 py-4 rounded-lg shadow-xl border-2 border-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:scale-105"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1a2936]" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{marginRight:'0.5rem'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span>View Portfolio</span>
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="bg-gradient-to-r from-[#1a2936] to-[#bfa76a] text-white font-extrabold px-8 py-4 rounded-lg shadow-xl border-2 border-[#bfa76a] hover:from-[#bfa76a] hover:to-[#1a2936] transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:scale-105"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{marginRight:'0.5rem'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-7 4h4m-7 4h10" /></svg>
                  <span>Contact Now</span>
                </button>
              </div>
              {/* Accessibility: scroll down indicator */}
              <button
                onClick={handleScrollDown}
                className="mx-auto mt-10 flex flex-col items-center group bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[#bfa76a]"
                aria-label="Scroll down"
                tabIndex={0}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 group-hover:bg-[#bfa76a]/80 transition-all duration-300 shadow-lg">
                  <svg width="24" height="24" fill="none" stroke="#bfa76a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </span>
                <span className="text-xs text-[#bfa76a] mt-2 font-semibold tracking-wide" style={{fontFamily:'Playfair Display, serif'}}>Scroll Down</span>
              </button>
            </AnimatedSection>
          </div>
        </section>

        

        {/* Services Section */}
        <section ref={servicesRef} id="services" className="py-24 bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-20">
              <h2 className="text-5xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                What We <span className="text-[#bfa76a]">Offer</span>
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-[#1a2936] max-w-3xl mx-auto">
                From design to completion, we provide end-to-end construction solutions
              </p>
            </AnimatedSection>

            <div className="space-y-24">
              {services
                .filter(s => selectedTab === 'All' || s.title === selectedTab)
                .map((service, index) => {
                const IconComponent = service.icon;
                const isReversed = index % 2 === 1;
                return (
                  <div key={index} className={`grid lg:grid-cols-2 gap-16 items-center ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Content */}
                    <div className={isReversed ? 'lg:col-start-2' : ''}>
                      <AnimatedSection animation={isReversed ? "fade-left" : "fade-right"}>
                        <div className="mb-8">
                          <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] p-5 rounded-2xl mr-5 shadow-lg">
                              <IconComponent className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <h3 className="text-4xl font-extrabold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>{service.title}</h3>
                              <p className="text-lg text-[#bfa76a] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{service.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-[#1a2936] text-lg leading-relaxed mb-8 font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{service.description}</p>
                        </div>

                        {/* Features */}
                        <div className="mb-10">
                          <h4 className="text-2xl font-bold mb-4" style={{ color: '#bfa76a', fontFamily: 'Playfair Display, serif' }}>Services Include:</h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {service.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#bfa76a] mr-3 flex-shrink-0" />
                                <span className="text-[#1a2936] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Benefits & Pricing */}
                        <div className="backdrop-blur-lg bg-white/60 border border-[#bfa76a]/30 p-8 rounded-2xl shadow-xl">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="font-bold mb-3" style={{ color: '#bfa76a', fontFamily: 'Playfair Display, serif' }}>Key Benefits:</h4>
                              <ul className="space-y-2">
                                {service.benefits.map((benefit, benefitIndex) => (
                                  <li key={benefitIndex} className="flex items-center text-[#1a2936] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    <Star className="w-4 h-4 text-[#bfa76a] mr-2" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/40 p-6 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[#bfa76a]">Starting Price:</span>
                                  <span className="font-bold text-[#1a2936]">{service.pricing}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[#bfa76a]">Timeline:</span>
                                  <span className="font-semibold text-[#1a2936]">{service.timeline}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AnimatedSection>
                    </div>

                    {/* Image */}
                    <div className={isReversed ? 'lg:col-start-1' : ''}>
                      <AnimatedSection animation={isReversed ? "fade-right" : "fade-left"} delay={200}>
                        <div className="relative group">
                          <img 
                            src={service.image}
                            alt={service.title}
                            className="w-full h-96 object-cover rounded-3xl shadow-2xl transition-all duration-500 group-hover:scale-105 border-4 border-[#bfa76a]/20"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#bfa76a]/40 to-transparent rounded-3xl"></div>
                          <div className="absolute bottom-6 left-6 text-[#1a2936]">
                            <h4 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{service.title}</h4>
                            <p className="text-[#bfa76a] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{service.subtitle}</p>
                          </div>
                        </div>
                      </AnimatedSection>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive Project Gallery (Supabase) */}
        <section ref={galleryRef} id="gallery" className="py-16 bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-10">
              <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Project <span className="text-[#bfa76a]">Gallery</span></h2>
              <p className="text-lg text-[#1a2936] max-w-2xl mx-auto">Explore our best work</p>
            </AnimatedSection>
            <ProjectGallery />
          </div>
        </section>

        {/* Video Testimonials (placeholder) */}
        <section ref={testimonialsRef} id="testimonials" className="py-16 bg-white/60 border-t border-[#bfa76a]/20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Video Testimonials</h3>
            <div className="flex flex-wrap gap-8 justify-center">
              {/* Embedded YouTube videos */}
              <div className="w-[480px] h-[300px] rounded-3xl overflow-hidden shadow-xl bg-[#bfa76a]/10 flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video 1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="w-[480px] h-[300px] rounded-3xl overflow-hidden shadow-xl bg-[#bfa76a]/10 flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/9bZkp7q19f0"
                  title="YouTube video 2"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        
        {/* Live Chat/WhatsApp Button */}
        <WhatsAppChatButton />
        
        
        
        {/* Service Request/Booking Form - ContactForm only */}
        <section ref={contactRef} id="contact" className="py-16 bg-white/60 border-t border-[#bfa76a]/20">
          <div className="container mx-auto px-4 flex justify-center">
            <div className="w-full max-w-8xl mx-auto bg-white/80 rounded-2xl shadow-xl p-8 border border-[#bfa76a]/30">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                Request a Service / Book a Consultation
              </h2>
              <ContactForm />
            </div>
          </div>
        </section>
        
        {/* Service-Specific CTAs (placeholder) */}
        {/* Add a "Get Quote" or "Book Now" button to each service card if desired */}
        {/* Customer Logos/Partners Row (placeholder) */}
        <section className="py-12 bg-white/60 border-t border-[#bfa76a]/20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Our Clients & Partners</h3>
            <div className="flex flex-wrap gap-8 justify-center items-center">
              {/* Replace with real logos */}
              <div className="w-32 h-16 bg-[#bfa76a]/20 rounded-2xl flex items-center justify-center text-[#bfa76a] font-bold text-lg">Logo 1</div>
              <div className="w-32 h-16 bg-[#bfa76a]/20 rounded-2xl flex items-center justify-center text-[#bfa76a] font-bold text-lg">Logo 2</div>
              <div className="w-32 h-16 bg-[#bfa76a]/20 rounded-2xl flex items-center justify-center text-[#bfa76a] font-bold text-lg">Logo 3</div>
            </div>
          </div>
        </section>
        {/* Awards & Certifications Section (placeholder) */}
        <section className="py-12 bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Awards & Certifications</h3>
            <div className="flex flex-wrap gap-8 justify-center">
              {/* Replace with real awards/certifications */}
              <div className="w-40 h-24 bg-[#bfa76a]/20 rounded-2xl flex flex-col items-center justify-center text-[#bfa76a] font-bold text-lg">ISO 9001</div>
              <div className="w-40 h-24 bg-[#bfa76a]/20 rounded-2xl flex flex-col items-center justify-center text-[#bfa76a] font-bold text-lg">Safety Excellence</div>
              <div className="w-40 h-24 bg-[#bfa76a]/20 rounded-2xl flex flex-col items-center justify-center text-[#bfa76a] font-bold text-lg">Top Contractor</div>
            </div>
          </div>
        </section>
        {/* Blog/Insights Section (dynamic from Supabase) */}
        {/* Hero Section for Latest Insights & News */}
        <section className="relative py-32 bg-gradient-to-br from-[#3d9392] via-[#6dbeb0] to-[#1b3d5a] text-white overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//News_Hero.jpg" 
              alt="Latest news and updates"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3d9392]/80 to-[#1b3d5a]/80"></div> 
          </div>
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h3 className="text-4xl font-extrabold mb-8" style={{ fontFamily: 'Playfair Display, serif', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Latest Insights & News</h3>
            <div className="flex flex-wrap gap-8 justify-center">
              {loadingPosts ? (
                <div className="text-[#bfa76a] text-xl font-bold">Loading...</div>
              ) : posts.length === 0 ? (
                <div className="text-[#bfa76a] text-xl font-bold">No posts found.</div>
              ) : (
                <>
                  {posts.slice(0, 2).map((post, idx) => (
                    <a
                      key={post.id || idx}
                      href={`/news-details?id=${post.id}`}
                      className="w-[620px] h-[520px] bg-white/10 rounded-2xl flex flex-col items-start justify-between text-white font-bold text-2xl shadow-xl p-0 relative overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#bfa76a]/40"
                      style={{ textDecoration: 'none' }}
                    >
                      {/* Prominent Hero Image at the top, like news page */}
                      {(post.featuredImage || post.featured_image || post.image_url) && (
                        <div className="w-full h-[260px] relative">
                          <img
                            src={post.featuredImage || post.featured_image || post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover object-center rounded-t-2xl"
                            style={{ boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.12)' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1b3d5a]/60 to-transparent rounded-t-2xl" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between p-8 w-full">
                        <div className="mb-4 w-full">
                          <div className="text-[#bfa76a] text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{new Date(post.created_at).toLocaleDateString()}</div>
                          <h4 className="text-3xl font-extrabold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{post.title}</h4>
                          <p className="text-lg font-medium text-white mb-4 line-clamp-4" style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{post.summary || post.content?.slice(0, 180) + (post.content?.length > 180 ? '...' : '')}</p>
                        </div>
                        <div className="mt-auto w-full flex justify-between items-end">
                          <span className="text-[#bfa76a] text-base font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{post.author || 'SLK Team'}</span>
                          <span className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] font-bold px-6 py-3 rounded-lg shadow border-2 border-[#bfa76a] text-lg select-none cursor-pointer" style={{ fontFamily: 'Playfair Display, serif' }}>Read More</span>
                        </div>
                      </div>
                    </a>
                  ))}
                  <div className="w-full flex justify-center mt-10">
                    <a
                      href="/news"
                      className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] font-bold px-10 py-4 rounded-lg shadow-lg border-2 border-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] transition-all duration-300 text-2xl flex items-center justify-center"
                      style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}
                    >
                      View All Insights & News
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
        <section className="py-24 bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-20">
              <h2 className="text-5xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                Our <span className="text-[#bfa76a]">Process</span>
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-[#1a2936] max-w-3xl mx-auto">
                A streamlined approach to deliver exceptional results
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <AnimatedSection
                    key={index}
                    animation="fade-up"
                    delay={index * 150}
                    className="text-center"
                  >
                    <div className="backdrop-blur-lg bg-white/60 border border-[#bfa76a]/30 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-4xl font-extrabold text-[#bfa76a] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{step.step}</div>
                      <h3 className="text-2xl font-bold text-[#1a2936] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h3>
                      <p className="text-[#1a2936] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{step.description}</p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

       {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936]">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center">
              <h2 className="text-5xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Ready to Start Your Project?</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-[#1a2936] mb-8 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                Get in touch with our experts for a free consultation and detailed quote & to discuss your project needs and discover how we can help you achieve your construction goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] hover:from-[#e5e2d6] hover:to-[#bfa76a] px-8 py-4 rounded-lg font-bold shadow-lg transition-all duration-300 flex items-center justify-center"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                >
                  Get Free Quote
                </button>
                {/* Button opens phone dialer on mobile, does nothing on desktop */}
                <button
                  type="button"
                  className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] font-extrabold px-8 py-4 rounded-lg shadow-xl border-2 border-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] transition-all duration-300 flex items-center justify-center text-lg"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                      if (isMobile) {
                        window.location.href = "tel:+85621773737";
                      }
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-[#1a2936]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm12-12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Call Us Now +856 21 773 737
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>
        {/* Service Area Map (placeholder) */}
        <section className="py-16 bg-gradient-to-br from-[#e5e2d6] via-[#f8fafc] to-[#bfa76a]/10">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Our Service Area</h3>
            {/* Google Map embed for SLK Trading and Design-Construction Complete Sole Co LTD */}
            <div className="w-full h-80 rounded-2xl overflow-hidden shadow-xl border border-[#bfa76a]/30 relative">
              <iframe
                title="SLK Trading and Design-Construction Complete Sole Co LTD Map"
                src="https://www.google.com/maps?q=XHVX%2BQX3+SLK+Trading+and+Design-Construction+Complete+Sole+Co+LTD,+%E0%BA%AE%E0%BB%88%E0%BA%AD%E0%BA%A1+1,+Vientiane,+Laos&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              {/* Get Directions Button */}
              <div className="absolute bottom-4 right-4 z-10">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=XHVX%2BQX3+SLK+Trading+and+Design-Construction+Complete+Sole+Co+LTD,+%E0%BA%AE%E0%BB%88%E0%BA%AD%E0%BA%A1+1,+Vientiane,+Laos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#bfa76a] hover:bg-[#e5e2d6] text-[#1a2936] px-6 py-3 rounded-lg text-sm font-bold shadow-lg border-2 border-[#bfa76a] transition-colors duration-300 flex items-center"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-[#1a2936]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </section>
        {/*  Downloadable Resources (placeholder) */}
        <section className="py-12 bg-white/60 border-t border-[#bfa76a]/20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>Downloadable Resources</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/brochure/SLK-Company-Profile.pdf" download className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] font-bold px-6 py-3 rounded-lg shadow border-2 border-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] transition">Company Profile (PDF)</a>
              <a href="/brochure/SLK-Service-Brochure.pdf" download className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] font-bold px-6 py-3 rounded-lg shadow border-2 border-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] transition">Service Brochure (PDF)</a>
              {/* Add more resources as needed */}
            </div>
          </div>
        </section>
      </div>

      <Footer />
      {showQuoteButton && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="hero_get_free_quote"
      />
    </>
  );
};

export default ServicesPage;