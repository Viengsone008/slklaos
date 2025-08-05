"use client";
// --- Hero luxury overlays and parallax ---
const HeroLuxuryOverlays = ({ scrollY }: { scrollY: number }) => {
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
        el.style.transform = `translate(${x}px, ${y}px) translateZ(30px) translateY(${scrollY * 0.2}px)`;
      }
      if (el2) {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 15; // max 7.5px
        const y = (e.clientY / innerHeight - 0.5) * 15;
        el2.style.transform = `translate(${x}px, ${y}px) translateZ(20px) translateY(${scrollY * 0.15}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [scrollY]);

  return (
    <>
      {/* Sparkles/gold dust - foreground */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-30" 
        style={{
          mixBlendMode:'screen',
          transform: `translateZ(40px) translateY(${scrollY * 0.1}px)`,
          transformStyle: 'preserve-3d'
        }}
      >
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
      <svg 
        ref={parallaxRef} 
        className="absolute left-0 top-0 w-full h-full z-20 pointer-events-none" 
        style={{
          transition:'transform 0.5s cubic-bezier(.4,0,.2,1)',
          transformStyle: 'preserve-3d'
        }}
      >
        <g>
          <rect x="10%" y="10%" width="80%" height="2" fill="#bfa76a" opacity="0.12" rx="1" />
          <rect x="20%" y="30%" width="60%" height="2" fill="#bfa76a" opacity="0.18" rx="1" />
          <ellipse cx="80%" cy="80%" rx="60" ry="12" fill="#bfa76a" opacity="0.08" />
          <ellipse cx="25%" cy="60%" rx="40" ry="8" fill="#bfa76a" opacity="0.10" />
        </g>
      </svg>
      {/* Parallax geometric shapes - subtle, background parallax */}
      <svg 
        ref={parallaxRef2} 
        className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none" 
        style={{
          transition:'transform 0.7s cubic-bezier(.4,0,.2,1)',
          transformStyle: 'preserve-3d'
        }}
      >
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
import { Building2, Shield, Layers, CheckCircle, ArrowRight, Star, Award, Users, Clock, ChevronLeft, ChevronRight, Phone, Calendar, MessageSquare, Package } from 'lucide-react';
import AnimatedSection from '../../components/AnimatedSection';
import QuoteModal from '../../components/QuoteModal';
// import LuxuryTestimonialModal from '../../components/LuxuryTestimonialModal';
import { useLanguage } from '../../contexts/LanguageContext';
import ContactForm from '../../components/ContactForm';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ServicesPage = () => {
  const searchParams = useSearchParams();
  const sharedVideoUrl = searchParams?.get('video');
  
  // Show notification if video was shared
  useEffect(() => {
    if (sharedVideoUrl) {
      // Scroll to testimonials section to show the shared video
      setTimeout(() => {
        const testimonialsSection = document.getElementById('testimonials');
        if (testimonialsSection) {
          testimonialsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    }
  }, [sharedVideoUrl]);

  // Section refs for floating nav
  // (keep only one set of refs, state, and sectionNav)
  const [showNav, setShowNav] = useState(false);
  const [showQuoteButton, setShowQuoteButton] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('All');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // 3D Carousel Testimonials State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Mr. Somchai Vongphrachanh",
      title: "CEO, VongTech Solutions",
      location: "Sisattanak District, Vientiane",
      service: "Luxury Design & Construction",
      projectValue: "$250,000+",
      quote: "SLK transformed our modest home into a breathtaking luxury villa. Their attention to architectural details and premium materials exceeded every expectation we had.",
      rating: 5,
      image: "/SLK-logo.png"
    },
    {
      id: 2,
      name: "Ms. Phonepadith Laothavixay",
      title: "Regional Property Manager",
      location: "Commercial District, Vientiane",
      service: "Waterproofing Solutions",
      projectValue: "$75,000+",
      quote: "Outstanding waterproofing expertise saved our commercial property! Three monsoon seasons later and still zero leaks. SLK's technical mastery is unmatched.",
      rating: 5,
      image: "/SLK-logo.png"
    },
    {
      id: 3,
      name: "Mr. Bounmy Keosavang",
      title: "Luxury Resort Owner",
      location: "Sisattanak District, Vientiane",
      service: "Premium Flooring & Materials",
      projectValue: "$120,000+",
      quote: "Exceptional premium marble flooring installation! Every guest compliments our home's transformation. SLK's craftsmanship exceeded our luxury expectations.",
      rating: 5,
      image: "/SLK-logo.png"
    },
    {
      id: 4,
      name: "Dr. Khamla Sysomphone",
      title: "Medical Center Director",
      location: "Chanthabouly District, Vientiane",
      service: "Healthcare Facility Construction",
      projectValue: "$180,000+",
      quote: "Professional healthcare facility construction with attention to medical standards. SLK delivered a state-of-the-art clinic that serves our community perfectly.",
      rating: 5,
      image: "/SLK-logo.png"
    },
    {
      id: 5,
      name: "Ms. Viengkham Phanthavong",
      title: "Boutique Hotel Owner", 
      location: "Luang Prabang Province",
      service: "Luxury Interior Design",
      projectValue: "$95,000+",
      quote: "Stunning luxury interior design that captures traditional Lao elegance with modern comfort. Our guests consistently praise the sophisticated atmosphere SLK created.",
      rating: 5,
      image: "/SLK-logo.png"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoRotating) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoRotating, testimonials.length]);

  const nextTestimonial = () => {
    setIsAutoRotating(false);
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoRotating(false);
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setIsAutoRotating(false);
    setCurrentTestimonial(index);
  };
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

  const slugify = (str: string) =>
    str.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');

  useEffect(() => {
    if (!searchParams) return;
    
    // Handle shared video parameter
    const sharedVideoUrl = searchParams.get('video');
    if (sharedVideoUrl) {
      // Scroll to testimonials section to show the shared video
      setTimeout(() => {
        const testimonialsSection = document.getElementById('testimonials');
        if (testimonialsSection) {
          testimonialsSection.scrollIntoView({ behavior: 'smooth' });
          
          // Show a notification about the shared video
          const notification = document.createElement('div');
          notification.innerHTML = `
            <div style="
              position: fixed; 
              top: 20px; 
              right: 20px; 
              background: linear-gradient(135deg, #bfa76a, #e5e2d6); 
              color: #1a2936; 
              padding: 16px 24px; 
              border-radius: 12px; 
              font-weight: bold; 
              box-shadow: 0 8px 32px rgba(191,167,106,0.3); 
              z-index: 9999;
              animation: slideIn 0.3s ease-out;
            ">
              🎥 Shared video highlighted below!
            </div>
            <style>
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            </style>
          `;
          document.body.appendChild(notification);
          
          // Remove notification after 4 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 4000);
        }
      }, 1500);
    }
    
    // Handle service navigation parameter
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
      bgGradient: "from-blue-50 to-indigo-50",
      productLink: "/products#construction-materials"
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
      bgGradient: "from-cyan-50 to-blue-50",
      productLink: "/products#waterproofing"
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
      bgGradient: "from-orange-50 to-amber-50",
      productLink: "/products#flooring"
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
        <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#f8fafc] text-[#1a2936] overflow-hidden" style={{ perspective: '1000px' }}>
          {/* Decorative overlays and parallax */}
          <HeroLuxuryOverlays scrollY={scrollY} />
          <div 
            className="absolute inset-0"
            style={{
              transform: `translateZ(0) translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0001}) rotateX(${scrollY * 0.01}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            <img
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image/Services/design01.jpg"
              alt="Construction services background luxury"
              className="w-full h-full object-cover opacity-20 scale-105 transition-all duration-700"
              style={{ 
                zIndex: 1,
                filter: `brightness(${1 - scrollY * 0.0003}) contrast(${1 + scrollY * 0.0002})`
              }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#bfa76a]/80 via-[#e5e2d6]/80 to-[#f8fafc]/90" 
              style={{ 
                zIndex: 2,
                transform: `translateZ(10px) translateY(${scrollY * 0.3}px)`,
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          <div 
            className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center h-full"
            style={{
              transform: `translateZ(50px) translateY(${scrollY * -0.1}px)`,
              transformStyle: 'preserve-3d'
            }}
          >
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
                              <div className="bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/40 p-6 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[#bfa76a]">Starting Price:</span>
                                  <span className="font-bold text-[#1a2936]">{service.pricing}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[#bfa76a]">Timeline:</span>
                                  <span className="font-semibold text-[#1a2936]">{service.timeline}</span>
                                </div>
                              </div>
                              
                              {/* View Products Button */}
                              <a
                                href={service.productLink}
                                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] px-6 py-3 rounded-xl hover:from-[#e5e2d6] hover:to-[#bfa76a] transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 group"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                              >
                                <span>View Products & Materials</span>
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </AnimatedSection>
                    </div>

                    {/* Image - Make clickable */}
                    <div className={isReversed ? 'lg:col-start-1' : ''}>
                      <AnimatedSection animation={isReversed ? "fade-right" : "fade-left"} delay={200}>
                        <a href={service.productLink} className="block group">
                          <div className="relative group-hover:scale-105 transition-all duration-500">
                            <img 
                              src={service.image}
                              alt={service.title}
                              className="w-full h-96 object-cover rounded-3xl shadow-2xl transition-all duration-500 border-4 border-[#bfa76a]/20 group-hover:border-[#bfa76a]/50"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#bfa76a]/40 to-transparent rounded-3xl group-hover:from-[#bfa76a]/60 transition-all duration-300"></div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a2936]/80 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8">
                              <div className="text-center text-white">
                                <div className="text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                                  View Products
                                </div>
                                <div className="text-sm opacity-90">
                                  Explore our materials & solutions
                                </div>
                              </div>
                            </div>
                            
                            <div className="absolute bottom-6 left-6 text-[#1a2936]">
                              <h4 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{service.title}</h4>
                              <p className="text-[#bfa76a] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{service.subtitle}</p>
                            </div>
                          </div>
                        </a>
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

        {/* Enhanced Video Testimonials with Better Styling */}
        <section ref={testimonialsRef} id="testimonials" className="py-20 bg-gradient-to-br from-[#f8fafc] to-[#e5e2d6]/20 border-t border-[#bfa76a]/20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-40 h-40 bg-[#bfa76a]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#e5e2d6]/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15,8V16H5.5L4,17.5V8H15M16,7H3A1,1 0 0,0 2,8V18A1,1 0 0,0 3,19H4V22L7,19H16A1,1 0 0,0 17,18V8A1,1 0 0,0 16,7Z"/>
                </svg>
              </div>
              <h3 className="text-5xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                Client <span className="text-[#bfa76a]">Video Stories</span>
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-[#1a2936] max-w-3xl mx-auto mb-12">
                Hear directly from our clients about their transformation experiences
              </p>
            </AnimatedSection>
            
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Enhanced Video 1 */}
              <AnimatedSection animation="fade-right" delay={0}>
                <div className={`group relative backdrop-blur-xl bg-white/80 border shadow-2xl rounded-3xl p-6 hover:shadow-3xl transition-all duration-500 ${
                  searchParams?.get('video') === 'https://drive.google.com/file/d/1AZQ8L1kvthSxMqRtWMqvGNKn6JuOnWME/view' 
                    ? 'border-[#bfa76a] ring-4 ring-[#bfa76a]/50 animate-pulse' 
                    : 'border-[#bfa76a]/30'
                }`}>
                  <div className="relative overflow-hidden rounded-2xl mb-6 aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://drive.google.com/file/d/1AZQ8L1kvthSxMqRtWMqvGNKn6JuOnWME/preview"
                      title="Luxury Villa Transformation - Client Testimonial"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                    {/* Video overlay badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                      </svg>
                      3:45
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/20 flex items-center justify-center overflow-hidden border-2 border-[#bfa76a]/40">
                          <img src="/SLK-logo.png" alt="Client" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                          <div className="text-[#bfa76a] font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Mr. Somchai Vong</div>
                          <div className="text-[#1a2936]/70 text-sm">Luxury Villa Owner</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-[#bfa76a] fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-[#1a2936] text-lg italic leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                      "The transformation exceeded our wildest dreams. From concept to completion, SLK delivered luxury beyond expectations."
                    </blockquote>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-[#bfa76a]/20">
                      <div className="text-[#bfa76a] font-medium text-sm">Design & Construction</div>
                      <div className="text-[#1a2936]/60 text-sm">Vientiane, Laos</div>
                    </div>
                    
                    {/* Share Video Button */}
                    <div className="flex items-center justify-center mt-4 pt-4 border-t border-[#bfa76a]/20">
                      <button
                        onClick={async () => {
                          try {
                            const videoUrl = "https://drive.google.com/file/d/1AZQ8L1kvthSxMqRtWMqvGNKn6JuOnWME/view";
                            const shareText = "Check out this amazing luxury villa transformation by SLK Construction! 🏗️✨";
                            
                            // Create shareable URL with video parameter
                            const currentUrl = window.location.origin + window.location.pathname;
                            const shareableUrl = `${currentUrl}?video=${encodeURIComponent(videoUrl)}`;
                            
                            if (navigator.share) {
                              await navigator.share({
                                title: "Luxury Villa Transformation - SLK Construction",
                                text: shareText,
                                url: shareableUrl
                              });
                            } else {
                              // Fallback: Copy shareable URL to clipboard
                              await navigator.clipboard.writeText(`${shareText}\n\n${shareableUrl}`);
                              alert("Shareable link copied to clipboard!");
                            }
                          } catch (error) {
                            // Handle user cancellation or other errors silently
                            if ((error as Error)?.name !== 'AbortError') {
                              console.log('Share failed:', error);
                              // Fallback to clipboard as last resort
                              try {
                                const videoUrl = "https://drive.google.com/file/d/1AZQ8L1kvthSxMqRtWMqvGNKn6JuOnWME/view";
                                const shareText = "Check out this amazing luxury villa transformation by SLK Construction! 🏗️✨";
                                const currentUrl = window.location.origin + window.location.pathname;
                                const shareableUrl = `${currentUrl}?video=${encodeURIComponent(videoUrl)}`;
                                await navigator.clipboard.writeText(`${shareText}\n\n${shareableUrl}`);
                                alert("Shareable link copied to clipboard!");
                              } catch (clipboardError) {
                                console.log('Clipboard fallback failed:', clipboardError);
                              }
                            }
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] px-4 py-2 rounded-full hover:from-[#e5e2d6] hover:to-[#bfa76a] transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                        </svg>
                        <span>Share Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Enhanced Video 2 */}
              <AnimatedSection animation="fade-left" delay={150}>
                <div className={`group relative backdrop-blur-xl bg-white/80 border shadow-2xl rounded-3xl p-6 hover:shadow-3xl transition-all duration-500 ${
                  searchParams?.get('video') === 'https://www.youtube.com/watch?v=9bZkp7q19f0' 
                    ? 'border-[#bfa76a] ring-4 ring-[#bfa76a]/50 animate-pulse' 
                    : 'border-[#bfa76a]/30'
                }`}>
                  <div className="relative overflow-hidden rounded-2xl mb-6 aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/9bZkp7q19f0"
                      title="Commercial Waterproofing Success - Client Review"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                    {/* Video overlay badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                      </svg>
                      2:18
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/20 flex items-center justify-center overflow-hidden border-2 border-[#bfa76a]/40">
                          <img src="/SLK-logo.png" alt="Client" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                          <div className="text-[#bfa76a] font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Ms. Phonepadith Lao</div>
                          <div className="text-[#1a2936]/70 text-sm">Property Manager</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-[#bfa76a] fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-[#1a2936] text-lg italic leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
                      "Zero leaks after two monsoon seasons. SLK's waterproofing expertise saved our commercial property investment."
                    </blockquote>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-[#bfa76a]/20">
                      <div className="text-[#bfa76a] font-medium text-sm">Waterproofing Solutions</div>
                      <div className="text-[#1a2936]/60 text-sm">Vientiane Capital</div>
                    </div>
                    
                    {/* Share Video Button */}
                    <div className="flex items-center justify-center mt-4 pt-4 border-t border-[#bfa76a]/20">
                      <button
                        onClick={async () => {
                          try {
                            const videoUrl = "https://www.youtube.com/watch?v=9bZkp7q19f0";
                            const shareText = "Watch this amazing waterproofing success story by SLK Construction! 💧🛡️";
                            
                            // Create shareable URL with video parameter
                            const currentUrl = window.location.origin + window.location.pathname;
                            const shareableUrl = `${currentUrl}?video=${encodeURIComponent(videoUrl)}`;
                            
                            if (navigator.share) {
                              await navigator.share({
                                title: "Commercial Waterproofing Success - SLK Construction",
                                text: shareText,
                                url: shareableUrl
                              });
                            } else {
                              // Fallback: Copy shareable URL to clipboard
                              await navigator.clipboard.writeText(`${shareText}\n\n${shareableUrl}`);
                              alert("Shareable link copied to clipboard!");
                            }
                          } catch (error) {
                            // Handle user cancellation or other errors silently
                            if ((error as Error)?.name !== 'AbortError') {
                              console.log('Share failed:', error);
                              // Fallback to clipboard as last resort
                              try {
                                const videoUrl = "https://www.youtube.com/watch?v=9bZkp7q19f0";
                                const shareText = "Watch this amazing waterproofing success story by SLK Construction! 💧🛡️";
                                const currentUrl = window.location.origin + window.location.pathname;
                                const shareableUrl = `${currentUrl}?video=${encodeURIComponent(videoUrl)}`;
                                await navigator.clipboard.writeText(`${shareText}\n\n${shareableUrl}`);
                                alert("Shareable link copied to clipboard!");
                              } catch (clipboardError) {
                                console.log('Clipboard fallback failed:', clipboardError);
                              }
                            }
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] px-4 py-2 rounded-full hover:from-[#e5e2d6] hover:to-[#bfa76a] transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                        </svg>
                        <span>Share Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
            
            
          </div>
        </section>

        {/* Premium Written Testimonials Section */}
        <section className="py-32 bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10 relative overflow-hidden">
          {/* Enhanced Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute top-20 left-10 w-40 h-40 text-[#bfa76a]/8" fill="currentColor" viewBox="0 0 100 100">
              <path d="M50 5L61.8 38.2L95 50L61.8 61.8L50 95L38.2 61.8L5 50L38.2 38.2z"/>
            </svg>
            <svg className="absolute bottom-20 right-10 w-32 h-32 text-[#bfa76a]/8" fill="currentColor" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45"/>
            </svg>
            <div className="absolute top-40 right-40 w-60 h-60 bg-[#bfa76a]/3 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-40 w-48 h-48 bg-[#e5e2d6]/8 rounded-full blur-2xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="text-center mb-24">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H7L2,22V4A2,2 0 0,1 4,2H20A2,2 0 0,1 22,4V15A2,2 0 0,1 20,17H16L14,19V17Z"/>
                </svg>
              </div>
              <h2 className="text-6xl font-extrabold mb-8" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                What Our <span className="text-[#bfa76a]">Clients Say</span>
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-10 mx-auto opacity-80" />
              <p className="text-2xl text-[#1a2936] max-w-4xl mx-auto leading-relaxed">
                Real stories from real clients who experienced the SLK difference in luxury construction and premium services
              </p>
            </AnimatedSection>

            {/* 3D Floating Testimonials Carousel */}
            <div className="relative max-w-7xl mx-auto mb-20 h-96">
              {/* Carousel Container with 3D perspective */}
              <div className="relative h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
                {testimonials.map((testimonial, index) => {
                  const isCenter = index === currentTestimonial;
                  const isLeft = index === (currentTestimonial - 1 + testimonials.length) % testimonials.length;
                  const isRight = index === (currentTestimonial + 1) % testimonials.length;
                  const isVisible = isCenter || isLeft || isRight;
                  
                  let transform = 'translateX(-50%) scale(0.7) rotateY(45deg)';
                  let zIndex = 1;
                  let opacity = 0.3;
                  let blur = 'blur(3px)';
                  
                  if (isCenter) {
                    transform = 'translateX(-50%) scale(1.1) rotateY(0deg) translateZ(100px)';
                    zIndex = 10;
                    opacity = 1;
                    blur = 'blur(0px)';
                  } else if (isLeft) {
                    transform = 'translateX(-120%) scale(0.8) rotateY(25deg) translateZ(0px)';
                    zIndex = 5;
                    opacity = 0.6;
                    blur = 'blur(1px)';
                  } else if (isRight) {
                    transform = 'translateX(20%) scale(0.8) rotateY(-25deg) translateZ(0px)';
                    zIndex = 5;
                    opacity = 0.6;
                    blur = 'blur(1px)';
                  }

                  return (
                    <div
                      key={testimonial.id}
                      className={`absolute left-1/2 transition-all duration-700 ease-in-out cursor-pointer ${
                        isVisible ? 'pointer-events-auto' : 'pointer-events-none'
                      }`}
                      style={{
                        transform,
                        zIndex,
                        opacity: isVisible ? opacity : 0,
                        filter: blur,
                        transformStyle: 'preserve-3d'
                      }}
                      onClick={() => !isCenter && goToTestimonial(index)}
                    >
                      <div className={`relative w-80 h-80 ${isCenter ? 'animate-float' : ''}`}>
                        <div className="group relative w-full h-full backdrop-blur-xl bg-white/95 border border-[#bfa76a]/50 shadow-3xl rounded-4xl p-8 flex flex-col items-center justify-center gap-4 hover:shadow-4xl transition-all duration-500" 
                             style={{
                               boxShadow: isCenter 
                                 ? '0 40px 100px 0 rgba(191,167,106,0.4), 0 0 50px rgba(191,167,106,0.2)' 
                                 : '0 20px 60px 0 rgba(191,167,106,0.2)'
                             }}>
                          
                          {/* Large Floating Quote Icon */}
                          <div className={`absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full flex items-center justify-center shadow-3xl transition-all duration-500 ${
                            isCenter ? 'scale-125 rotate-12' : 'scale-100'
                          }`}>
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6,17C6,15 7,13.65 8.5,13.65C9.55,13.65 10.45,14.55 10.45,15.6C10.45,16.65 9.55,17.55 8.5,17.55C7.95,17.55 7.45,17.3 7.05,16.9C7.35,18.1 8.65,19 10.35,19C10.73,19 11.1,18.9 11.4,18.75L12,20.05C11.5,20.35 10.95,20.5 10.35,20.5C7.85,20.5 5.85,18.5 5.85,16H6.05C6.05,16.55 6.05,17 6,17Z M14,17C14,15 15,13.65 16.5,13.65C17.55,13.65 18.45,14.55 18.45,15.6C18.45,16.65 17.55,17.55 16.5,17.55C15.95,17.55 15.45,17.3 15.05,16.9C15.35,18.1 16.65,19 18.35,19C18.73,19 19.1,18.9 19.4,18.75L20,20.05C19.5,20.35 18.95,20.5 18.35,20.5C15.85,20.5 13.85,18.5 13.85,16H14.05C14.05,16.55 14.05,17 14,17Z"/>
                            </svg>
                          </div>
                          
                          {/* Client Photo */}
                          <div className="relative">
                            <div className={`rounded-full bg-gradient-to-br from-[#bfa76a]/30 to-[#e5e2d6]/30 flex items-center justify-center mb-4 overflow-hidden border-4 border-[#bfa76a]/50 shadow-2xl transition-all duration-300 ${
                              isCenter ? 'w-20 h-20' : 'w-16 h-16'
                            }`}>
                              <img src={testimonial.image} alt={testimonial.name} className={`object-contain ${isCenter ? 'w-12 h-12' : 'w-8 h-8'}`} />
                            </div>
                            {/* Company Badge */}
                            <div className={`absolute -bottom-2 -right-2 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                              isCenter ? 'w-8 h-8 scale-110' : 'w-6 h-6'
                            }`}>
                              <svg className={`text-white ${isCenter ? 'w-4 h-4' : 'w-3 h-3'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Quote */}
                          <blockquote className={`font-semibold text-[#1a2936] mb-4 text-center leading-relaxed transition-all duration-300 ${
                            isCenter ? 'text-lg' : 'text-sm'
                          }`} style={{ 
                            fontFamily: 'Playfair Display, serif', 
                            textShadow: '0 2px 12px rgba(191,167,106,0.15)' 
                          }}>
                            "{isCenter ? testimonial.quote : testimonial.quote.substring(0, 80) + '...'}"
                          </blockquote>
                          
                          {/* Client Details */}
                          <div className="text-center w-full space-y-2">
                            <div className={`text-[#bfa76a] font-bold transition-all duration-300 ${
                              isCenter ? 'text-xl' : 'text-base'
                            }`} style={{ fontFamily: 'Playfair Display, serif' }}>
                              {testimonial.name}
                            </div>
                            <div className={`text-[#1a2936]/80 font-medium transition-all duration-300 ${
                              isCenter ? 'text-base' : 'text-sm'
                            }`} style={{ fontFamily: 'Playfair Display, serif' }}>
                              {testimonial.title}
                            </div>
                            
                            {/* Rating - only show on center */}
                            {isCenter && (
                              <div className="flex justify-center gap-1 my-3">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-[#bfa76a] fill-current animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
                                ))}
                              </div>
                            )}
                            
                            {/* Service Badge - only show on center */}
                            {isCenter && (
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#bfa76a]/30 to-[#e5e2d6]/30 border border-[#bfa76a]/40 rounded-full px-3 py-1 mt-2">
                                <span className="text-[#bfa76a] font-medium text-xs" style={{ fontFamily: 'Playfair Display, serif' }}>
                                  {testimonial.service}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
                <button
                  onClick={prevTestimonial}
                  className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                </button>
              </div>
              
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
                <button
                  onClick={nextTestimonial}
                  className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6 group-hover:transform group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'bg-[#bfa76a] scale-125 shadow-lg'
                        : 'bg-[#bfa76a]/40 hover:bg-[#bfa76a]/70'
                    }`}
                  />
                ))}
              </div>

              {/* Auto-play Control */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20">
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-lg border border-[#bfa76a]/30 rounded-full px-4 py-2 text-[#1a2936] hover:bg-white/95 transition-all duration-300 text-sm"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {isAutoRotating ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6,19H8V5H6V19ZM16,5V19H18V5H16Z"/>
                      </svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                      </svg>
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Testimonial Section removed as requested */}

        {/* Get Quote and Book Consultation Section */}
        <section ref={contactRef} id="contact" className="py-32 bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#3d9392] text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/5 w-40 h-40 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white/8 rounded-full animate-pulse delay-500"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="text-center">
              {/* Main Icon */}
              <div className="mb-10">
                <div className="bg-white/20 p-8 rounded-full inline-flex mb-8 backdrop-blur-sm border border-white/30 shadow-2xl">
                  <MessageSquare className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-6xl lg:text-7xl font-extrabold mb-8 text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Start Your <span className="text-white drop-shadow-lg">Project?</span>
              </h2>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-10">
                <div className="h-1 w-40 bg-gradient-to-r from-white via-[#1a2936] to-white rounded-full opacity-80"></div>
              </div>

              {/* Subtitle */}
              <p className="text-2xl lg:text-3xl text-[#1a2936] mb-16 max-w-5xl mx-auto leading-relaxed font-medium">
                Get a <span className="font-bold text-white">free consultation</span> and 
                <span className="font-bold text-white"> personalized quote</span> for your construction project
              </p>

              {/* Contact Options Grid */}
              <div className="grid lg:grid-cols-2 gap-12 mb-16 max-w-6xl mx-auto">
                {/* Get Quote Option */}
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                  <div className="bg-white/30 p-6 rounded-full inline-flex mb-8 group-hover:scale-110 transition-all duration-300">
                    <Package className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Get Instant Quote
                  </h3>
                  <p className="text-lg text-[#1a2936] mb-8 leading-relaxed">
                    Fill out our quick form and receive a detailed quote within 24 hours. 
                    Our experts will analyze your requirements and provide transparent pricing.
                  </p>
                  
                  {/* Benefits list */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Free detailed quote within 24h</span>
                    </div>
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">No hidden costs or surprises</span>
                    </div>
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Expert material recommendations</span>
                    </div>
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Timeline and project planning</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="w-full bg-white text-[#1a2936] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center group"
                  >
                    <ArrowRight className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                    Get Free Quote Now
                  </button>
                </div>

                {/* Book Consultation Option */}
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                  <div className="bg-white/30 p-6 rounded-full inline-flex mb-8 group-hover:scale-110 transition-all duration-300">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Book Consultation
                  </h3>
                  <p className="text-lg text-[#1a2936] mb-8 leading-relaxed">
                    Schedule a personal consultation with our construction experts. 
                    We'll visit your site and provide professional guidance tailored to your needs.
                  </p>
                  
                  {/* Benefits list */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Free on-site consultation</span>
                    </div>
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Professional site assessment</span>
                    </div>
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Customized project planning</span>
                    </div>
                    <div className="flex items-center text-[#1a2936]">
                      <CheckCircle className="w-6 h-6 mr-3 text-white flex-shrink-0" />
                      <span className="font-medium">Material selection guidance</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full border-2 border-white hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center group"
                    onClick={() => setIsContactFormOpen(true)}
                  >
                    <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    Book Consultation
                  </button>
                </div>
              </div>

              {/* Why Choose Us Section */}
              <div className="mb-16">
                <h3 className="text-3xl font-bold text-[#1a2936] mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Why Choose SLK Construction?
                </h3>
                <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <Award className="w-10 h-10 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">15+ Years</h4>
                    <p className="text-sm text-[#1a2936]">Construction Experience</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <Users className="w-10 h-10 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">500+</h4>
                    <p className="text-sm text-[#1a2936]">Satisfied Clients</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <Clock className="w-10 h-10 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">24/7</h4>
                    <p className="text-sm text-[#1a2936]">Customer Support</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <Star className="w-10 h-10 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">100%</h4>
                    <p className="text-sm text-[#1a2936]">Quality Guarantee</p>
                  </div>
                </div>
              </div>

              

              {/* Trust Indicators */}
              <div className="border-t border-white/30 pt-12">
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Licensed & Insured</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Free Consultation</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Transparent Pricing</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Quality Materials</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">On-Time Delivery</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>

      <Footer />
      {showQuoteButton && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <WhatsAppChatButton />
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="hero_get_free_quote"
      />
      
      {/* Contact Form Modal */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Book Your Consultation
                </h2>
                <button
                  onClick={() => setIsContactFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100/50 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Fill out the form below and our experts will contact you to schedule your free consultation.
              </p>
            </div>
            <div className="p-6">
              <ContactForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicesPage;
