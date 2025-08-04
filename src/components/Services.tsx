"use client";
import React, { useState } from 'react';
import { Building2, Shield, Layers, CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Trans from '../components/Trans';

const SkeletonImage = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" aria-hidden="true" />
      )}
      <img
        {...props}
        className={className}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </>
  );
};


const Services = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const services = [
    {
      icon: Building2,
      title: "Design & Construction",
      description: "Complete construction solutions for residential, commercial, and industrial projects. From concept to completion, we handle every aspect of your building needs.",
      features: [
        "Architectural Design & Planning",
        "Structural Engineering",
        "Project Management",
        "Quality Control & Inspection",
        "Interior Design Services",
        "Landscape Architecture"
      ],
      image: "https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920",
      gallery: [
        "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      testimonials: [
        { name: "John D.", text: "SLK exceeded our expectations!", avatar: "https://randomuser.me/api/portraits/men/32.jpg" }
      ],
      brochureUrl: "#",
      faqs: [
        { q: "Do you offer design consultations?", a: "Yes, we provide full consultations for all projects." }
      ],
      productLink: "/products#construction-materials"
    },
    {
      icon: Shield,
      title: "Waterproofing Solutions",
      description: "Premium waterproofing solutions to protect your property from water damage. We supply and install high-quality waterproofing materials for all applications.",
      features: [
        "Roof Waterproofing",
        "Foundation Protection",
        "Basement Waterproofing",
        "Bathroom & Kitchen Sealing",
        "Swimming Pool Waterproofing",
        "Industrial Waterproofing"
      ],
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//WaterproofingService.png",
      gallery: [
        "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      testimonials: [
        { name: "Samantha L.", text: "No more leaks! Highly recommend." }
      ],
      brochureUrl: "#",
      faqs: [
        { q: "What materials do you use?", a: "We use only premium, certified waterproofing materials." }
      ],
      productLink: "/products#waterproofing"
    },
    {
      icon: Layers,
      title: "Flooring Materials & Installation",
      description: "Extensive range of premium flooring materials for every space. We provide high-quality flooring solutions that combine aesthetics with durability.",
      features: [
        "Ceramic & Porcelain Tiles",
        "Natural Stone Flooring",
        "Hardwood & Laminate",
        "Vinyl & LVT Flooring",
        "Epoxy Floor Coatings",
        "Custom Design Solutions"
      ],
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//FlooringHomePage.png",
      gallery: [
        "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      testimonials: [
        { name: "Michael T.", text: "Beautiful floors, great service!" }
      ],
      brochureUrl: "#",
      faqs: [
        { q: "Can you do custom designs?", a: "Absolutely! We specialize in custom flooring solutions." }
      ],
      productLink: "/products#flooring"
    }
  ];



  const handleQuickQuote = () => {
    // Scroll to or open quote form/modal (implement as needed)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <section id="services" className="py-20 bg-[#e5f1f1] relative">
        <div className="container mx-auto px-4">
          
          {/* Section Header */}
          <AnimatedSection animation="fade-up" repeatOnScroll={true} className="text-center mb-16">
            <div className="mb-2 text-base font-semibold tracking-widest uppercase text-[#6dbeb0]">
              <Trans as="span">What We Offer</Trans>
            </div>
            <h2 className="relative inline-block text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <Trans as="span">Our</Trans> <span className="text-[#3d9392]"><Trans as="span">Services</Trans></span>
              <span className="block absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-32 h-2 pointer-events-none select-none">
                <svg width="100%" height="12" viewBox="0 0 128 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6 Q 64 18 122 6" stroke="url(#headerGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.25"/>
                  <defs>
                    <linearGradient id="headerGradient" x1="0" y1="0" x2="128" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6dbeb0"/>
                      <stop offset="0.5" stopColor="#3d9392"/>
                      <stop offset="1" stopColor="#1b3d5a"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <Trans as="span">Comprehensive construction and building material solutions for all your needs</Trans>
            </p>
          </AnimatedSection>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <a
                  key={index}
                  href={service.productLink}
                  className="block group no-underline focus:outline-none focus:ring-2 focus:ring-[#6dbeb0]"
                  style={{ color: 'inherit' }}
                  tabIndex={0}
                  role="link"
                  aria-label={`View ${service.title} products and materials`}
                >
                  <AnimatedSection
                    animation="fade-up"
                    delay={index * 200}
                    repeatOnScroll={true}
                    className="glass-morphism bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-[#e5f1f1] hover:border-[#6dbeb0] transition-all duration-300 transform hover:-translate-y-3 hover:rotate-[1.5deg] hover:scale-[1.03] hover:shadow-2xl overflow-hidden group"
                  >
                    <div className="relative h-52 md:h-56 lg:h-48 overflow-hidden group">
                      <SkeletonImage src={service.image} alt={service.title} className="w-full h-full object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500 z-10 relative" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-gradient-to-br from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] p-3 rounded-xl shadow-lg animate-pulse group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-7 h-7 text-white drop-shadow" />
                        </div>
                      </div>
                    </div>


                    {/* Content */}
                    <div className="p-8">
                      <AnimatedSection animation="fade-up" delay={index * 200 + 200} repeatOnScroll={true}>
                        {/* Title - Clickable */}
                        <h3
                          className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-[#6dbeb0] transition-colors"
                          tabIndex={0}
                          aria-label={t(service.title)}
                          style={{ outline: 'none' }}
                        >
                          <Trans as="span">{service.title}</Trans>
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          <Trans as="span">{service.description}</Trans>
                        </p>
                      </AnimatedSection>

                      {/* Animated Stats */}
                      <div className="flex gap-4 mb-6">
                        <div className="bg-white/60 rounded-xl px-4 py-2 shadow font-bold text-base text-[#1a2936] flex flex-col items-center min-w-[90px]" aria-label="Projects Completed">
                          <span className="text-2xl text-[#6dbeb0] font-extrabold animate-pulse">{index === 0 ? '500+' : index === 1 ? '200+' : '100+'}</span>
                          <span className="text-xs font-medium">
                            <Trans as="span">Projects</Trans>
                          </span>
                        </div>
                        <div className="bg-white/60 rounded-xl px-4 py-2 shadow font-bold text-base text-[#1a2936] flex flex-col items-center min-w-[90px]" aria-label="5-Star Rated">
                          <span className="text-2xl text-[#6dbeb0] font-extrabold animate-pulse">5.0</span>
                          <span className="text-xs font-medium">
                            <Trans as="span">Stars</Trans>
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <AnimatedSection animation="fade-up" delay={index * 200 + 300} repeatOnScroll={true}>
                        <ul className="space-y-3 mb-6">
                          {service.features.map((feature, featureIndex) => (
                            <AnimatedSection
                              key={featureIndex}
                              animation="fade-right"
                              delay={index * 200 + 400 + (featureIndex * 50)}
                              repeatOnScroll={true}
                            >
                              <li className="flex items-center text-sm text-gray-700">
                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] flex items-center justify-center mr-3 shadow-md animate-bounce-slow">
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                </span>
                                <Trans as="span">{feature}</Trans>
                              </li>
                            </AnimatedSection>
                          ))}
                        </ul>
                      </AnimatedSection>

                      <AnimatedSection animation="scale" delay={index * 200 + 500} repeatOnScroll={true}>
                        <div
                          className="w-full inline-block bg-gradient-to-r from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] hover:from-[#3d9392] hover:to-[#6dbeb0] text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6dbeb0] focus:ring-offset-2"
                          style={{ pointerEvents: 'none' }}
                          aria-hidden="true"
                        >
                          <span className="flex items-center gap-2">
                            <Trans as="span">View Products</Trans>
                            <ArrowRight className="w-5 h-5 align-middle" />
                          </span>
                        </div>
                      </AnimatedSection>
                    </div>
                  </AnimatedSection>
                </a>
              );
            })}
          </div> 
        </div>
      </section>
    </>
  );
};

export default Services;