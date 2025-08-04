"use client";
import React, { useState, useRef } from 'react';
import SparkleParticles from '../../components/SparkleParticles';
import Head from 'next/head';
import { Award, Users, Target, Clock, Building2, Shield, Layers, Star, CheckCircle, ArrowRight, Heart, Globe, Zap } from 'lucide-react';
import FloatingQuoteButton from '../../components/FloatingQuoteButton';
import AnimatedSection from '../../components/AnimatedSection';
import QuoteModal from '../../components/QuoteModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WhatsAppChatButton from '../../components/WhatsAppChatButton';

const AboutPage = () => {
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [showNav, setShowNav] = useState(false);
  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      // Section spy
      const sections = [
        { id: 'hero', ref: heroRef },
        { id: 'story', ref: storyRef },
        { id: 'journey', ref: journeyRef },
        { id: 'team', ref: teamRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
      setShowNav(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  }; 

  const scrollToTeam = () => {
    teamRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToJourney = () => {
    journeyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigateToContact = () => {
    router.push('/contact');
  };

  const stats = [
    {
      icon: Award, 
      number: "20+",
      label: "Years of Excellence",
      description: "Proven track record in Laos construction industry"
    },
    {
      icon: Users,
      number: "20+",
      label: "Projects Completed",
      description: "Successfully delivered across various sectors"
    },
    {
      icon: Target,
      number: "99%",
      label: "Client Satisfaction",
      description: "Committed to exceeding expectations"
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Support Available",
      description: "Always here when you need us"
    }
  ];

  const values = [
    {
      icon: Award,
      title: "Quality Excellence",
      description: "We never compromise on quality. Every project reflects our commitment to superior craftsmanship and attention to detail.",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-500"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Our skilled professionals bring years of experience and continuous training to deliver exceptional results.",
      bgColor: "bg-blue-100", 
      iconColor: "text-blue-600"
    },
    {
      icon: Target,
      title: "Timely Delivery",
      description: "We understand the importance of deadlines and consistently deliver projects on time and within budget.",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description: "Your satisfaction is our priority. We listen, understand, and deliver solutions that exceed expectations.",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Globe,
      title: "Sustainable Practices",
      description: "We're committed to environmentally responsible construction practices for a better future.",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We embrace new technologies and methods to provide cutting-edge construction solutions.",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ];

  const team = [
    {
      name: "Mark Janos Juhasz",
      position: "Founder & CEO",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Mr.%20Mark%20Janos%20Juhasz.JPG",
      description: "With over 25 years in construction, Mark founded SLK Trading with a vision to transform Laos' construction industry.",
      specialties: ["Strategic Planning", "Business Development", "Industry Relations"]
    },
    { 
      name: "Chitpaseut Somlith",  
      position: "Founder & CEO", 
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Mr.%20Chitpaseut%20Somlith.JPG",
      description: "Leading our technical team with expertise in structural engineering and project management.",
      specialties: ["Structural Engineering", "Project Management", "Quality Control"]
    },
    {
      name: "Khamla Sisavath",
      position: "Operations Director",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Mr.%20Mark%20Janos%20Juhasz.JPG",
      description: "Ensuring smooth operations and maintaining our high standards across all projects.",
      specialties: ["Operations Management", "Supply Chain", "Team Leadership"]
    },
    {
      name: "Viengxay Chanthabouly",
      position: "Design Manager",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Mr.%20Chitpaseut%20Somlith.JPG",
      description: "Creative visionary behind our innovative designs and architectural solutions.",
      specialties: ["Architectural Design", "3D Modeling", "Interior Design"]
    }
  ];

  const milestones = [
    {
      year: "2008",
      title: "Company Founded",
      description: "SLK Trading & Design Construction was established with a mission to provide quality construction services in Laos."
    },
    {
      year: "2012",
      title: "First Major Project",
      description: "Completed our first major commercial project, establishing our reputation for quality and reliability."
    },
    {
      year: "2015",
      title: "Expansion",
      description: "Expanded our services to include premium waterproofing and flooring materials supply."
    },
    {
      year: "2018",
      title: "100 Projects Milestone",
      description: "Celebrated completing our 100th project, marking a significant achievement in our growth."
    },
    {
      year: "2020",
      title: "Technology Integration",
      description: "Integrated advanced project management and design technologies to enhance our services."
    },
    {
      year: "2023",
      title: "Industry Leadership",
      description: "Recognized as one of the leading construction companies in Laos with 200+ completed projects."
    }
  ];

  const certifications = [
    {
      name: "ISO 9001:2015",
      description: "Quality Management System",
      icon: Award
    },
    {
      name: "ISO 14001:2015",
      description: "Environmental Management",
      icon: Globe
    },
    {
      name: "OHSAS 18001",
      description: "Occupational Health & Safety",
      icon: Shield
    },
    {
      name: "Lao Construction License",
      description: "Grade A Construction License",
      icon: Building2
    }
  ]; 

  // Parallax state for hero image
  const [parallax, setParallax] = useState(0);
  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const onScroll = () => setParallax(window.scrollY * 0.3);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animated number counter
  const AnimatedNumber = ({ value }: { value: number | string }) => {
    const [display, setDisplay] = React.useState(0);
    React.useEffect(() => {
      if (typeof value === 'string' && value.endsWith('+')) {
        value = parseInt(value);
      }
      let start = 0;
      const end = typeof value === 'number' ? value : parseInt(value as string);
      if (isNaN(end)) return;
      const duration = 800;
      const step = Math.ceil(end / (duration / 16));
      if (end === 0) {
        setDisplay(0);
        return;
      }
      const interval = setInterval(() => {
        start += step;
        if (start >= end) {
          setDisplay(end);
          clearInterval(interval);
        } else {
          setDisplay(start);
        }
      }, 16);
      return () => clearInterval(interval);
    }, [value]);
    return <span>{typeof value === 'string' && value.endsWith('+') ? display + '+' : display}</span>;
  };

  // Floating section nav
  const sectionNav = [
    { id: 'hero', label: 'Hero', ref: heroRef },
    { id: 'story', label: 'Our Story', ref: storyRef },
    { id: 'journey', label: 'Journey', ref: journeyRef },
    { id: 'team', label: 'Team', ref: teamRef },
  ];


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
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f9e7d2]">
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
        {/* Hero Section */}
        <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#f8fafc] text-[#1a2936] overflow-hidden luxury-card-glass shadow-gold">
          <SparkleParticles className="" />
          <div className="absolute inset-0" style={{ transform: `translateY(${parallax}px)` }}>
            <img 
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//About_Hero.png"  
              alt="SLK Trading team at work"
              className="w-full h-full object-cover opacity-20 transition-opacity duration-500 scale-105 blur-[2px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a2936]/70 via-[#bfa76a]/20 to-transparent"></div>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          </div>
          <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center h-full">
            <AnimatedSection className="text-center max-w-4xl mx-auto luxury-card-glass bg-white/40 backdrop-blur-2xl border border-[#bfa76a]/30 rounded-3xl shadow-gold px-8 py-14">
              <h1 className="text-6xl lg:text-7xl font-extrabold mb-6 luxury-gradient-text drop-shadow-[0_6px_32px_rgba(191,167,106,0.45)]" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}>
                About <span className="luxury-gold-text luxury-fade-text drop-shadow-gold">SLK Trading & Design Construction</span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-90 shadow-gold" />
              <p className="text-2xl mb-8 leading-relaxed font-semibold luxury-fade-text text-[#bfa76a] drop-shadow-gold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Building Laos' future with <span className="luxury-gold-text font-bold">quality</span>, <span className="luxury-gold-text font-bold">innovation</span>, and <span className="luxury-gold-text font-bold">excellence</span>
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mt-4">
                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="luxury-card-glass bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] text-[#1a2936] px-8 py-4 rounded-xl font-extrabold text-lg shadow-gold border border-[#bfa76a]/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 12px #fff, 0 2px 8px #f1ce76ff, 0 1px 2px #1a2936' }}
                >
                  Work With Us
                  <ArrowRight className="w-5 h-5 ml-2 inline text-[#bfa76a]" />
                </button>
                <button 
                  onClick={scrollToStory}
                  className="luxury-card-glass border-2 border-[#bfa76a] hover:bg-[#bfa76a]/10 text-white px-8 py-4 rounded-xl font-extrabold text-lg shadow-gold transition-all duration-300 outline-none focus:ring-4 focus:ring-[#bfa76a]/40"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 12px #fff, 0 2px 8px #f5d575ff, 0 1px 2px #1a2936' }}
                >
                  Our Story
                </button>
                <button 
                  onClick={scrollToJourney}
                  className="luxury-card-glass border-2 border-[#bfa76a] hover:bg-[#bfa76a]/10 text-white px-8 py-4 rounded-xl font-extrabold text-lg shadow-gold transition-all duration-300 outline-none focus:ring-4 focus:ring-[#bfa76a]/40"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 12px #fff, 0 2px 8px #f5ce6aff, 0 1px 2px #1a2936' }}
                >
                  Our Journey
                </button>
                <button 
                  onClick={scrollToTeam}
                  className="luxury-card-glass border-2 border-[#bfa76a] hover:bg-[#bfa76a]/10 text-white px-8 py-4 rounded-xl font-extrabold text-lg shadow-gold transition-all duration-300 outline-none focus:ring-4 focus:ring-[#bfa76a]/40"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 12px #fff, 0 2px 8px #f3cc6cff, 0 1px 2px #1a2936' }}
                >
                  Meet Our Team
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-[#3d9392]">Achievements</span> 
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Numbers that reflect our commitment to excellence
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <AnimatedSection
                    key={index}
                  animation="fade-up"
                    delay={index * 100}
                    className="text-center"
                  >
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#bfa76a] group relative">
                      <div className="bg-orange-100 p-4 rounded-xl inline-flex mb-4 border-2 border-[#bfa76a]/30 group-hover:border-[#bfa76a] transition-all duration-300">
                        <IconComponent className="w-8 h-8 text-orange-600" />
                      </div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        <AnimatedNumber value={stat.number} />
                      </div>
                      <div className="font-semibold text-gray-700 mb-2">
                        {stat.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.description}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story */} 
        <section ref={storyRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection animation="fade-right">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our <span className="text-[#3d9392]">Story</span>
                </h2>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p className="text-lg">
                    Founded in 2008, SLK Trading & Design Construction began with a simple yet ambitious vision: 
                    to transform the construction landscape in Laos through quality, innovation, and unwavering 
                    commitment to excellence.
                  </p>
                  <p>
                    What started as a small construction company has grown into one of Laos' most trusted names 
                    in construction and building materials supply. Our journey has been marked by continuous 
                    learning, adaptation, and an relentless pursuit of perfection.
                  </p>
                  <p>
                    Today, we stand proud as a company that has not only built structures but has also built 
                    lasting relationships with our clients, partners, and the communities we serve. Every project 
                    we undertake is a testament to our values and our commitment to building a better Laos.
                  </p>
                </div>
                <div className="mt-8">
                  <button 
                    onClick={scrollToJourney}
                    className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Learn More About Our Journey
                  </button>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fade-left">
                <div className="relative">
                  <img 
                    src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Services.jpg" 
                    alt="SLK Trading construction team"
                    className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h4 className="text-xl font-bold mb-2">Building Excellence Since 2008</h4>
                    <p className="text-white/90">Committed to quality and innovation</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-[#3d9392]">Values</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <AnimatedSection
                    key={index}
                    animation="fade-up"
                    delay={index * 150}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className={`${value.bgColor} p-4 rounded-xl inline-flex mb-4`}>
                      <IconComponent className={`w-8 h-8 ${value.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section ref={teamRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Meet Our <span className="text-[#3d9392]">Team</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The experts behind our success
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <AnimatedSection
                  key={index}
                  animation="fade-left"
                  delay={index * 150}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-2 border-transparent hover:border-[#bfa76a] group relative"
                >
                  <div className="relative h-64">
                    <img  
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#bfa76a]/90 to-[#e5e2d6]/90 opacity-0 group-hover:opacity-95 transition-all duration-300 flex flex-col justify-center items-center p-6 text-center">
                      <p className="text-lg font-bold text-[#1a2936] mb-2">{member.name}</p>
                      <p className="text-[#3d9392] font-medium mb-2">{member.position}</p>
                      <p className="text-[#1a2936] text-sm mb-2">{member.description}</p>
                      <div className="flex flex-wrap gap-2 justify-center mb-2">
                        {member.specialties.map((specialty, specialtyIndex) => (
                          <span key={specialtyIndex} className="bg-white/80 text-[#bfa76a] px-3 py-1 rounded-full text-xs font-semibold border border-[#bfa76a]">{specialty}</span>
                        ))}
                      </div>
                      {/* Socials placeholder */}
                      <div className="flex gap-3 justify-center mt-2">
                        <a href="#" className="text-[#3d9392] hover:text-[#bfa76a] transition-colors" aria-label="LinkedIn"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.003 3.604 4.605v5.591z"/></svg></a>
                        <a href="#" className="text-[#3d9392] hover:text-[#bfa76a] transition-colors" aria-label="Facebook"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.729 0 1.322-.593 1.322-1.326v-21.349c0-.734-.593-1.326-1.326-1.326z"/></svg></a>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-[#3d9392] font-medium mb-3">{member.position}</p>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.description}</p>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Specialties:</h4>
                      <div className="space-y-1">
                        {member.specialties.map((specialty, specialtyIndex) => (
                          <div key={specialtyIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section ref={journeyRef} className="py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-[#3d9392]">Journey</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Key milestones in our growth and development
              </p>
            </AnimatedSection>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#6dbeb0]"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <AnimatedSection
                    key={index}
                    animation={index % 2 === 0 ? "fade-right" : "fade-left"}
                    delay={index * 200}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="text-2xl font-bold text-[#3d9392] mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline Dot */}
                    <div className="relative z-10 w-4 h-4 bg-[#3d9392] rounded-full border-4 border-white shadow-lg"></div>
                    
                    <div className="w-1/2"></div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Certifications & <span className="text-[#3d9392]">Licenses</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our commitment to quality and compliance
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {certifications.map((cert, index) => {
                const IconComponent = cert.icon;
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
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* Luxury Client Testimonial Section */}
        <section className="py-24 bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-20">
              <h2 className="text-5xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                What Our <span className="text-[#bfa76a]">Clients Say</span>
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 mx-auto opacity-80" />
              <p className="text-xl text-[#1a2936] max-w-3xl mx-auto">
                Discover how we deliver luxury, trust, and excellence through the voices of our clients
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Testimonial 1 */}
              <AnimatedSection animation="fade-up" delay={0} className="relative">
                <div className="backdrop-blur-lg bg-white/70 border border-[#bfa76a]/30 p-10 rounded-3xl shadow-2xl hover:shadow-gold transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <img src="/SLK-logo.png" alt="Client" className="w-16 h-16 rounded-full border-4 border-[#bfa76a]/40 shadow-lg mr-4" />
                    <div>
                      <span className="text-lg font-bold text-[#bfa76a]" style={{ fontFamily: 'Playfair Display, serif' }}>Sokpaseuth V.</span>
                      <div className="text-sm text-[#1a2936]">CEO, Luxury Real Estate Group</div>
                    </div>
                  </div>
                  <p className="text-lg text-[#1a2936] font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    “SLK exceeded our expectations in every way. Their attention to detail and commitment to luxury is unmatched. Our new headquarters is a true masterpiece.”
                  </p>
                  <div className="flex gap-1 justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#bfa76a]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
              {/* Testimonial 2 */}
              <AnimatedSection animation="fade-up" delay={150} className="relative">
                <div className="backdrop-blur-lg bg-white/70 border border-[#bfa76a]/30 p-10 rounded-3xl shadow-2xl hover:shadow-gold transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <img src="/SLK-logo.png" alt="Client" className="w-16 h-16 rounded-full border-4 border-[#bfa76a]/40 shadow-lg mr-4" />
                    <div>
                      <span className="text-lg font-bold text-[#bfa76a]" style={{ fontFamily: 'Playfair Display, serif' }}>Chansamone T.</span>
                      <div className="text-sm text-[#1a2936]">Managing Director, Golden Palace</div>
                    </div>
                  </div>
                  <p className="text-lg text-[#1a2936] font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    “From start to finish, SLK’s team was professional, creative, and responsive. The final result is both luxurious and functional. Highly recommended!”
                  </p>
                  <div className="flex gap-1 justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#bfa76a]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
              {/* Testimonial 3 */}
              <AnimatedSection animation="fade-up" delay={300} className="relative">
                <div className="backdrop-blur-lg bg-white/70 border border-[#bfa76a]/30 p-10 rounded-3xl shadow-2xl hover:shadow-gold transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <img src="/SLK-logo.png" alt="Client" className="w-16 h-16 rounded-full border-4 border-[#bfa76a]/40 shadow-lg mr-4" />
                    <div>
                      <span className="text-lg font-bold text-[#bfa76a]" style={{ fontFamily: 'Playfair Display, serif' }}>Thipphavanh S.</span>
                      <div className="text-sm text-[#1a2936]">Owner, Luxe Boutique Hotel</div>
                    </div>
                  </div>
                  <p className="text-lg text-[#1a2936] font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    “The SLK team brought our vision to life with elegance and precision. The craftsmanship and luxury finishes are truly world-class.”
                  </p>
                  <div className="flex gap-1 justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#bfa76a]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#6dbeb0] text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="text-center">
              {/* Icon */}
              <div className="mb-8">
                <div className="bg-white/20 p-6 rounded-full inline-flex mb-6 backdrop-blur-sm border border-white/30">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-5xl lg:text-6xl font-extrabold mb-6 text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Work With <span className="text-white drop-shadow-lg">Us?</span>
              </h2>
              
              {/* Decorative line */}
              <div className="flex justify-center mb-8">
                <div className="h-1 w-32 bg-gradient-to-r from-white via-[#1a2936] to-white rounded-full opacity-80"></div>
              </div>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-[#1a2936] mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
                Join our family of <span className="font-bold text-white">500+</span> satisfied clients and experience the 
                <span className="font-bold text-white"> SLK Trading difference</span> - where vision meets reality
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-sm text-[#1a2936] font-medium">Happy Clients</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">15+</div>
                  <div className="text-sm text-[#1a2936] font-medium">Years Experience</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-sm text-[#1a2936] font-medium">Success Rate</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm text-[#1a2936] font-medium">Support</div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-[#1a2936] mb-6">Why Choose SLK Trading?</h3>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Award className="w-8 h-8 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">Premium Quality</h4>
                    <p className="text-sm text-[#1a2936]">World-class materials and craftsmanship</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Clock className="w-8 h-8 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">On-Time Delivery</h4>
                    <p className="text-sm text-[#1a2936]">Projects completed within schedule</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Shield className="w-8 h-8 text-white mx-auto mb-4" />
                    <h4 className="font-bold text-white mb-2">Guaranteed Results</h4>
                    <p className="text-sm text-[#1a2936]">Full warranty and ongoing support</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-white text-[#1a2936] hover:bg-gray-100 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center group"
                >
                  <ArrowRight className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                  Start Your Project Today
                </button>
                <button 
                  onClick={handleNavigateToContact}
                  className="border-2 border-white hover:bg-white/20 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center group"
                >
                  <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Meet Our Team
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="border-t border-white/30 pt-8">
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
                    <span className="font-medium">Quality Guarantee</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">Competitive Pricing</span>
                  </div>
                  <div className="flex items-center text-[#1a2936]">
                    <CheckCircle className="w-5 h-5 mr-2 text-white" />
                    <span className="font-medium">24/7 Customer Support</span>
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
        source="products_get_product_quote"
      />
    </>
  );
};

export default AboutPage;