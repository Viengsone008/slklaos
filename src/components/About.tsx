"use client";
import React, { useRef, useEffect, useState } from 'react';
// CountUp component for animated numbers
const CountUp = ({ end, duration = 1.2, suffix = '', className = '' }: { end: number|string, duration?: number, suffix?: string, className?: string }) => {
  const [count, setCount] = useState(typeof end === 'number' ? 0 : end);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (typeof end !== 'number') return;
    let start = 0;
    const increment = end / (duration * 60);
    let frame: number;
    function animate() {
      start += increment;
      if (typeof end === 'number' && start < end) {
        setCount(Math.floor(start));
        frame = requestAnimationFrame(animate);
      } else {
        setCount(end);
        cancelAnimationFrame(frame);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <span ref={ref} className={className}>{typeof end === 'number' ? count : end}{suffix}</span>;
};
import { Award, Users, Target, Clock } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const About = () => {
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
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

  const stats = [
    {
      icon: Award,
      number: 20,
      suffix: '+',
      label: t('Years of Experience'),
      description: t('Proven track record in Laos construction industry')
    },
    {
      icon: Users,
      number: 20,
      suffix: '+',
      label: t('Projects Completed'),
      description: t('Successfully delivered across various sectors')
    },
    {
      icon: Target,
      number: 99,
      suffix: '%',
      label: t('Client Satisfaction'),
      description: t('Committed to exceeding expectations')
    },
    {
      icon: Clock,
      number: '24/7',
      suffix: '',
      label: t('Support Available'),
      description: t('Always here when you need us')
    }
  ];
  // Animated stats on scroll into view
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;
    
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setStatsAnimated(true);
          }
        });
      },
      { threshold: 0.4 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

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
    }
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
      <section id="about" className="py-20 bg-gradient-to-br from-[#f8fafc] via-[#e0f7fa] to-[#f8fafc] relative overflow-hidden">
      {/* Subtle animated background + floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Animated background wave */}
        <svg className="w-full h-full opacity-10 animate-pulse" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#6dbeb0" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
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
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <AnimatedSection animation="fade-right" repeatOnScroll={true}>
              <div className="mb-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  About <span className="text-[#3d9392]">SLK Trading & Design Construction</span>
                </h2>
                {/* CEO Signature luxury touch */}
                <div className="mb-8">
                  <span
                    className="block text-3xl md:text-4xl text-[#3d9392] font-signature animate-fade-in"
                    style={{ fontFamily: 'var(--font-signature, "Dancing Script", cursive)', letterSpacing: '2px', fontWeight: 400 }}
                  >
                    Mark Janos Juhasz
                  </span>
                  <span className="block text-gray-500 text-base mt-1 ml-1">Founder & CEO</span>
                </div>
                <AnimatedSection animation="fade-up" delay={200} repeatOnScroll={true}>
                  <p className="text-xl text-gray-600 leading-relaxed mb-6">
                    SLK Trading & Design Construction Co., Ltd is a leading construction company in Laos, specializing in design construction, waterproofing materials, and flooring materials.
                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={300} repeatOnScroll={true}>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    With over 15 years of experience, we have successfully completed more than 200 projects across various sectors. Our commitment to quality, innovation, and customer satisfaction has made us a trusted partner for all construction needs in Laos.
                  </p>
                </AnimatedSection>
                
                {/* Learn More Button */}
                <AnimatedSection animation="scale" delay={350} repeatOnScroll={true}>
                  <Link href="/about">
                    <button 
                      className="group relative bg-white/60 glass-morphism backdrop-blur-lg border-2 border-[#6dbeb0]/40 hover:border-[#6dbeb0] hover:bg-[#6dbeb0] hover:text-white text-[#21706e] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-500 ease-out transform hover:scale-110 hover:shadow-2xl shadow-xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#6dbeb0]/50 active:scale-95"
                      aria-label="Learn more about SLK Trading & Design Construction"
                    >
                      <span className="relative z-10 flex items-center">
                        Learn More About Us
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      {/* Animated background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -top-2 -left-2 w-2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                    </button>
                  </Link>
                </AnimatedSection>
              </div>
            </AnimatedSection>

            {/* Key Values */}
            <div className="space-y-4">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <AnimatedSection 
                    key={index}
                    animation="fade-right"
                    delay={400 + (index * 150)}
                    repeatOnScroll={true}
                    className="flex items-start bg-white/70 glass-morphism rounded-xl shadow-lg border border-[#e5f1f1] hover:border-[#6dbeb0] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl backdrop-blur-md"
                  >
                    <AnimatedSection animation="bounce-in" delay={500 + (index * 150)} repeatOnScroll={true}>
                      <div className={`${value.bgColor} p-3 rounded-lg mr-4 flex-shrink-0 shadow-md`}>
                        <IconComponent className={`w-6 h-6 ${value.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                    </AnimatedSection>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-1">{value.title}</div>
                      <div className="text-gray-600 mb-2">{value.description}</div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>

          {/* Right Content - Stats */}
          <div>
            <AnimatedSection animation="fade-left" repeatOnScroll={true}>
              {/* Luxury SVG divider */}
              <div className="mb-8">
                <svg className="w-full h-8" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#6dbeb0" fillOpacity="0.12" d="M0,40L60,48C120,56,240,72,360,68C480,64,600,40,720,32C840,24,960,32,1080,44C1200,56,1320,72,1380,76L1440,80L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
                </svg>
              </div>
              <div ref={statsRef} className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <AnimatedSection
                      key={index}
                      animation="scale"
                      delay={index * 100}
                      repeatOnScroll={true}
                      className="bg-white/80 glass-morphism rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#e5f1f1] shadow-lg relative group overflow-hidden"
                    >
                      {/* Sparkle SVG */}
                      <svg className="absolute -top-3 -right-3 w-7 h-7 text-yellow-400 opacity-80 animate-pulse pointer-events-none" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" fill="currentColor"/></svg>
                      <AnimatedSection animation="bounce-in" delay={index * 100 + 200} repeatOnScroll={true}>
                        <div className="bg-white p-4 rounded-xl inline-flex mb-4 shadow-sm">
                          <IconComponent className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </AnimatedSection>
                      <AnimatedSection animation="fade-up" delay={index * 100 + 300} repeatOnScroll={true}>
                        <div className="text-3xl font-bold text-gray-900 mb-2 animate-glow">
                          {statsAnimated ? <CountUp end={stat.number} suffix={stat.suffix} /> : (typeof stat.number === 'number' ? 0 : stat.number)}
                        </div>
                        <div className="font-semibold text-gray-700 mb-2">
                          {stat.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.description}
                        </div>
                      </AnimatedSection>
                    </AnimatedSection>
                  );
                })}
              </div>
            </AnimatedSection>

            {/* Bottom Image */}
            <AnimatedSection animation="fade-up" delay={600} repeatOnScroll={true}>
              <div className="mt-8 relative parallax-container" style={{ perspective: '1000px' }}>
                <div className="parallax-image-wrapper" style={{ transformStyle: 'preserve-3d' }}>
                  <img 
                    src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Services.jpg" 
                    alt="SLK Construction team at work"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg parallax-image"
                    aria-label="SLK Construction team at work"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};



export default About;