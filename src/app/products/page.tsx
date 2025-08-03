"use client";
import React, { useEffect, useState, useRef } from "react";
import Head from 'next/head';
import { Shield, Layers, Package, Star, CheckCircle, ArrowRight, Award, Truck, Phone, Search, Filter } from 'lucide-react';
import AnimatedSection from '../../components/AnimatedSection';
import QuoteModal from '../../components/QuoteModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WhatsAppChatButton from '../../components/WhatsAppChatButton';
import FloatingQuoteButton from '../../components/FloatingQuoteButton';

// Sparkle overlay SVG component
const SparkleOverlay = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{mixBlendMode:'screen'}}>
    <g>
      <circle cx="10%" cy="30%" r="2.5" fill="#fff8e1" opacity="0.7">
        <animate attributeName="r" values="2.5;5;2.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="80%" cy="20%" r="1.5" fill="#bfa76a" opacity="0.8">
        <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60%" cy="70%" r="2" fill="#fff" opacity="0.5">
        <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="30%" cy="80%" r="1.2" fill="#e5e2d6" opacity="0.7">
        <animate attributeName="r" values="1.2;2.5;1.2" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);

// Animated stat/trust badge
const AnimatedStat = ({ icon: Icon, value, label, delay }) => (
  <div className="flex flex-col items-center mx-4" style={{animation: `fadeInUp 0.7s ${delay}ms both`}}>
    <div className="bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] p-4 rounded-full shadow-lg mb-2">
      <Icon className="w-7 h-7 text-[#1a2936]" />
    </div>
    <span className="text-2xl font-extrabold text-[#bfa76a]" style={{fontFamily:'Playfair Display, serif'}}>{value}</span>
    <span className="text-sm text-[#1a2936] font-medium text-center" style={{fontFamily:'Playfair Display, serif'}}>{label}</span>
  </div>
);

const ProductsPage = () => {
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
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useLanguage();
  const router = useRouter();
 
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          rating,
          description,
          image,
          specifications,
          is_featured
        `)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Fetch error:", error.message);
        return;
      }

      const formatted = (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image || "https://via.placeholder.com/300x200?text=No+Image",
        price: item.price ? `$${item.price}/sqm` : "Price on Request",
        rating: item.rating ?? 0,
        description: item.description ?? "",
        features:
          item.specifications?.map((s: any) => `${s.name}: ${s.value}`) ?? [],
      }));

      setFeaturedProducts(formatted);
    };

    fetchFeatured();
  }, []);

  const productCategories = [
    { 
      id: 'waterproofing',
      icon: Shield,
      title: "Waterproofing Materials",
      subtitle: "Premium protection solutions",
      description: "Advanced waterproofing systems designed to provide long-lasting protection against moisture damage.",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Product_waterproofing.png",
      products: [
        "Liquid Applied Membranes",
        "Sheet Membranes",
        "Crystalline Waterproofing",
        "Injection Resins",
        "Sealants & Coatings",
        "Drainage Systems"
      ],
      applications: [
        "Roofing Systems",
        "Foundation Protection",
        "Basement Waterproofing",
        "Swimming Pools",
        "Bathrooms & Wet Areas",
        "Industrial Facilities"
      ],
      brands: ["Sika", "BASF", "Mapei", "Fosroc"],
      priceRange: "$25 - $150 per sqm",
      warranty: "10-15 years",
      bgColor: "bg-blue-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      id: 'flooring',
      icon: Layers,
      title: "Flooring Materials",
      subtitle: "Elegant and durable surfaces",
      description: "Comprehensive range of premium flooring materials for residential, commercial, and industrial applications.",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//FlooringHomePage.png",
      products: [
        "Ceramic & Porcelain Tiles",
        "Natural Stone",
        "Hardwood Flooring",
        "Laminate Flooring",
        "Vinyl & LVT",
        "Epoxy Coatings"
      ],
      applications: [
        "Residential Homes",
        "Commercial Spaces",
        "Industrial Facilities",
        "Healthcare Centers",
        "Educational Institutions",
        "Hospitality Venues"
      ],
      brands: ["Porcelanosa", "Mohawk", "Armstrong", "Tarkett"],
      priceRange: "$15 - $200 per sqm",
      warranty: "5-25 years",
      bgColor: "bg-orange-500",
      bgGradient: "from-orange-50 to-amber-50"
    },
    {
      id: 'rocksoil',
      icon: Package,
      title: "Rocksoil Materials",
      subtitle: "Geotechnical stability & tunneling support",
      description: "Engineered materials designed for soil stabilization, tunneling, and ground improvement. Our Rocksoil products are trusted in infrastructure, mining, and civil engineering projects.",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//RocksoilProduct.png",
      products: [
        "Soil Stabilizers",
        "Rock Bolts & Anchors",
        "Geotextiles & Geogrids",
        "Shotcrete Materials",
        "Tunnel Linings",
        "Grouting Compounds"
      ],
      applications: [
        "Tunnels & Underground Works",
        "Slope Stabilization",
        "Road & Rail Embankments",
        "Mining Operations",
        "Bridge Foundations",
        "Soil Improvement Zones"
      ],
      brands: ["Rocksoil", "Geobrugg", "Maccaferri", "Tensar"],
      priceRange: "$35 - $300 per unit",
      warranty: "5-10 years",
      bgColor: "bg-green-500",
      bgGradient: "from-green-50 to-emerald-50"
    }  
  ];

  const qualityFeatures = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "Only the finest materials from trusted international brands"
    },
    {
      icon: Star,
      title: "Expert Selection",
      description: "Carefully curated products tested for Laos climate conditions"
    },
    {
      icon: Truck,
      title: "Reliable Supply",
      description: "Consistent availability with efficient logistics network"
    },
    {
      icon: CheckCircle,
      title: "Technical Support",
      description: "Professional guidance for product selection and application"
    }
  ];

  const handleViewProductCategory = (categoryId: string) => {
    router.push(`/product-catalogue#${categoryId}`);
    setTimeout(() => {
      const el = document.getElementById(categoryId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleViewProductDetail = (productId: string) => {
    router.push(`/products/item/${productId}`);
  };

  const handleDownloadCatalog = () => {
    router.push('/product-catalogue');
  };

  const handleCallExpert = () => {
    window.open('tel:+85621773737', '_self');
  };

  // Section refs for floating nav
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const qualityRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Floating nav state
  const [activeSection, setActiveSection] = useState('hero');
  const [showNav, setShowNav] = useState(false);
  const [showQuoteButton, setShowQuoteButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'hero', ref: heroRef },
        { id: 'categories', ref: categoriesRef },
        { id: 'featured', ref: featuredRef },
        { id: 'quality', ref: qualityRef },
        { id: 'cta', ref: ctaRef },
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionNav = [
    { id: 'hero', label: 'Hero', ref: heroRef },
    { id: 'categories', label: 'Categories', ref: categoriesRef },
    { id: 'featured', label: 'Featured', ref: featuredRef },
    { id: 'quality', label: 'Quality', ref: qualityRef },
    { id: 'cta', label: 'Contact', ref: ctaRef },
  ];

  // Accessibility: scroll down indicator
  const handleScrollDown = () => {
    if (heroRef.current) {
      window.scrollTo({
        top: (heroRef.current as HTMLDivElement).clientHeight - 80,
        behavior: 'smooth',
      });
    }
  };

  // Button ripple effect
  const addRipple = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
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
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      </Head>
      {/* Floating Section Navigation (dots) */}
      {showNav && (
        <nav className="fixed left-4 top-1/2 z-[9999] flex flex-col gap-2 -translate-y-1/2 hidden sm:flex bg-white/40 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/30">
          {sectionNav.map((s) => (
            <button
              key={s.id}
              onClick={() => (s.ref.current as HTMLDivElement | null)?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-2.5 h-2.5 rounded-full border-2 ${activeSection === s.id ? 'bg-yellow-300 border-yellow-400 scale-110 shadow-yellow-200' : 'bg-white border-yellow-200'} shadow transition-all duration-300`}
              aria-label={s.label}
            />
          ))}
        </nav>
      )}
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f9e7d2]">

        {/* ─── Hero ─── */}
        <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#f8fafc] text-[#1a2936] overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Product_waterproofing.png"
              alt="Premium construction materials background"
              className="w-full h-full object-cover opacity-30 scale-105 transition-all duration-700"
              style={{ zIndex: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#bfa76a]/80 to-[#e5e2d6]/80" style={{ zIndex: 2 }} />
            {/* Sparkle overlay */}
            <SparkleOverlay />
          </div>

          <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center h-full">
            <AnimatedSection className="text-center max-w-4xl mx-auto">
              {/* Hero headline with shine animation */}
              <h1 className="text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-2xl relative hero-shine" style={{ fontFamily: 'Playfair Display, serif', overflow: 'hidden' }}>
                <span className="inline-block animate-fadeInUp">Premium <span className="text-[#bfa76a]">Products</span></span>
                <span className="hero-shine-bar" />
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80 animate-fadeInUp" style={{animationDelay:'200ms'}} />
              <p 
                className="text-2xl mb-8 leading-relaxed font-bold text-[#1a2936] px-6 py-3 rounded-xl shadow-lg animate-fadeInUp"
                style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 2px 12px #bfa76a88, 0 1px 0 #fff', animationDelay:'400ms' }}
              >
                High-quality construction materials for lasting results
              </p>
              {/* Animated stats/trust badges */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fadeInUp" style={{animationDelay:'600ms'}}>
                <AnimatedStat icon={Award} value="10+" label="Years Experience" delay={0} />
                <AnimatedStat icon={Star} value="500+" label="Projects Completed" delay={150} />
                <AnimatedStat icon={CheckCircle} value="100%" label="Satisfaction" delay={300} />
                <AnimatedStat icon={Truck} value="24h" label="Fast Delivery" delay={450} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay:'800ms'}}>
                <button
                  onClick={e => { addRipple(e); setIsQuoteModalOpen(true); }}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] hover:from-[#e5e2d6] hover:to-[#bfa76a] px-8 py-4 rounded-lg font-bold shadow-lg transition-all duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#bfa76a]/60 relative overflow-hidden hero-btn-glow"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                  tabIndex={0}
                  aria-label="Get Product Quote"
                >
                  Get Product Quote
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
                <button
                  onClick={e => { addRipple(e); handleDownloadCatalog(); }}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] border-2 border-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] hover:text-[#bfa76a] px-8 py-4 rounded-lg font-extrabold shadow-lg transition-all duration-300 flex items-center justify-center ring-2 ring-[#bfa76a]/30 focus:ring-4 focus:ring-[#bfa76a]/50 relative overflow-hidden hero-btn-glow"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px #fff, 0 1px 0 #bfa76a' }}
                  tabIndex={0}
                  aria-label="Our Product Catalogue"
                >
                  Our Product Catalogue
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

        {/* Product Categories */}
        <section ref={categoriesRef} id="categories" className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#bfa76a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Our Product <span className="text-[#1a2936]">Categories</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Comprehensive range of premium construction materials
              </p>
            </AnimatedSection>

            <div className="space-y-20">
              {productCategories.map((category, index) => {
                const IconComponent = category.icon;
                const isReversed = index % 2 === 1;
                
                return (
                  <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Content */}
                    <div className={isReversed ? 'lg:col-start-2' : ''}>
                      <AnimatedSection animation={isReversed ? "fade-left" : "fade-right"}>
                        <div className="mb-6">
                          <div className="flex items-center mb-4">
                            <div className={`${category.bgColor} p-4 rounded-xl mr-4`}>
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-3xl font-extrabold text-[#bfa76a]" style={{ fontFamily: 'Playfair Display, serif' }}>{category.title}</h3>
                              <p className="text-lg text-[#1a2936] font-medium">{category.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-lg leading-relaxed mb-8">{category.description}</p>
                        </div>

                        {/* Products & Applications */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Product Range:</h4>
                            <div className="space-y-2">
                              {category.products.map((product, productIndex) => (
                                <div key={productIndex} className="flex items-center">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                  <span className="text-gray-700">{product}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Applications:</h4>
                            <div className="space-y-2">
                              {category.applications.map((application, appIndex) => (
                                <div key={appIndex} className="flex items-center">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div> 
                                  <span className="text-gray-600">{application}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="bg-white/40 backdrop-blur-lg border border-[#bfa76a]/30 rounded-2xl p-6 shadow-xl" style={{ boxShadow: '0 4px 32px 0 rgba(191,167,106,0.10)' }}>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Trusted Brands:</h4>
                              <div className="flex flex-wrap gap-2">
                                {category.brands.map((brand, brandIndex) => (
                                  <span key={brandIndex} className="bg-gradient-to-r from-[#bfa76a]/20 to-[#e5e2d6]/20 px-3 py-1 rounded-full text-sm font-medium text-[#bfa76a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {brand}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Price Range:</span>
                                <span className="font-bold text-[#bfa76a]">{category.priceRange}</span>
                              </div>  
                              <div className="flex justify-between">
                                <span className="text-gray-600">Warranty:</span>
                                <span className="font-semibold text-[#1a2936]">{category.warranty}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* View All Products Button */}
                          <div className="mt-6 text-center">
                            <button 
                              onClick={() => handleViewProductCategory(category.id)}
                              className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] hover:from-[#e5e2d6] hover:to-[#bfa76a] px-6 py-3 rounded-lg font-extrabold transition-all duration-300 transform hover:scale-105 flex items-center mx-auto shadow-lg border border-[#bfa76a]"
                              style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                            >
                              View All {category.title}
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                          </div>
                        </div>
                      </AnimatedSection>
                    </div>

                    {/* Image */}
                    <div className={isReversed ? 'lg:col-start-1' : ''}>
                      <AnimatedSection animation={isReversed ? "fade-right" : "fade-left"} delay={200}>
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => handleViewProductCategory(category.id)}
                        >
                          <img 
                            src={category.image}
                            alt={category.title}
                            className="w-full h-96 object-cover rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
                          <div className="absolute bottom-6 left-6 text-white">
                            <h4 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#bfa76a' }}>{category.title}</h4>
                            <p className="text-white/90" style={{ fontFamily: 'Playfair Display, serif' }}>{category.subtitle}</p>
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

        {/* Featured Products */}
        <section ref={featuredRef} id="featured" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#bfa76a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Featured <span className="text-[#1a2936]">Products</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Our most popular and trusted construction materials
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, i) => (
                <AnimatedSection
                  key={product.id}
                  animation="fade-up"
                  delay={i * 150}
                  className="bg-white/40 backdrop-blur-lg border border-[#bfa76a]/30 rounded-2xl shadow-[0_4px_32px_0_rgba(191,167,106,0.10)] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Card links to product-item-details?id by id */}
                  <a
                    href={`/product-item-details?id=${product.id}`}
                    className="block relative h-48 cursor-pointer"
                    style={{ textDecoration: "none" }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-full">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </a>
                  <div className="p-6">
                    {/* Title links to product-item-details?id by id */}
                    <a
                      href={`/product-item-details?id=${product.id}`}
                      className="text-xl font-extrabold text-[#bfa76a] mb-2 cursor-pointer hover:text-[#1a2936] transition-colors block"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {product.name}
                    </a>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      {product.features.slice(0, 3).map((f: string, fi: number) => (
                        <div
                          key={fi}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#bfa76a]">
                        {product.price}
                      </span>
                      <button
                        onClick={() => setIsQuoteModalOpen(true)}
                        className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] hover:from-[#e5e2d6] hover:to-[#bfa76a] px-4 py-2 rounded-lg font-extrabold transition-colors border border-[#bfa76a]"
                        style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                      >
                        Get Quote
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Assurance */}
        <section ref={qualityRef} id="quality" className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-[#bfa76a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Why Choose Our <span className="text-[#1a2936]">Products</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Quality assurance and customer satisfaction are our top priorities
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {qualityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <AnimatedSection
                    key={index}
                    animation="scale"
                    delay={index * 150}
                    className="text-center"
                  >
                    <div className="bg-white/80 backdrop-blur-md border border-[#e5e2d6] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2" style={{ boxShadow: '0 2px 16px 0 rgba(191,167,106,0.08)' }}>
                      <div className="bg-orange-100 p-4 rounded-xl inline-flex mb-4">
                        <IconComponent className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* ─── CTA ─── */}
        <section ref={ctaRef} id="cta" className="py-20 bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] text-white">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center">
              <h2 className="text-4xl font-bold mb-6">
                Need Help Choosing Products?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Our experts are here to help you select the perfect materials for your project
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-white text-[#1b3d5a] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Get Product Quote
                </button>
                {/* Button opens phone dialer on mobile, does nothing on desktop */}
                <button
                  type="button"
                  className="border-2 border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                      if (isMobile) {
                        window.location.href = "tel:+85621773737";
                      }
                    }
                  }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Expert: +856&nbsp;21&nbsp;773&nbsp;737
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div> 

      {/* Show Floating Quote Button after scroll */}
      {showQuoteButton && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <Footer />
      <WhatsAppChatButton />

      {/* ─── Quote Modal ─── */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="products_get_product_quote"
      />
    </>
  );
};

export default ProductsPage;