"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Building2, Shield, Layers } from 'lucide-react';
import QuoteModal from '../components/QuoteModal';
import { useLanguage } from '../contexts/LanguageContext';
import Trans from '../components/Trans';

const Hero = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [stats, setStats] = useState({
    experience: 0,
    projects: 0,
    satisfaction: 0,
    support: 0
  });
  const statsTarget = useRef({
    experience: 10,
    projects: 200,
    satisfaction: 100,
    support: 24
  });
  const { t } = useLanguage();
  // Animate stats numbers on mount
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1200;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setStats({
        experience: Math.floor(progress * statsTarget.current.experience),
        projects: Math.floor(progress * statsTarget.current.projects),
        satisfaction: Math.floor(progress * statsTarget.current.satisfaction),
        support: Math.floor(progress * statsTarget.current.support)
      });
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setStats({
          experience: statsTarget.current.experience,
          projects: statsTarget.current.projects,
          satisfaction: statsTarget.current.satisfaction,
          support: statsTarget.current.support
        });
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth > 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      <section id="home" className="relative min-h-screen text-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Modern house construction and design background"
            className={`w-full h-full object-cover object-center ${isDesktop ? 'bg-zoom-animate' : ''}`}
            style={{
              transform: !isDesktop ? 'scale(1.05)' : undefined
            }}
          />
          {/* Enhanced overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/30"></div>
          {/* Subtle animated overlay - only on desktop */}
          <div className={`absolute inset-0 bg-gradient-to-br from-[#1b3d5a]/20 via-transparent to-[#3d9392]/20 ${
            window.innerWidth > 768 ? 'animate-background-pulse' : ''
          }`}></div>
        </div>

        {/* Simplified Floating Particles - Reduced for Mobile */}
        <div className="particles-container">
          {[...Array(window.innerWidth > 768 ? 15 : 8)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`,
                borderRadius: '50%',
                position: 'absolute',
                pointerEvents: 'none',
                animation: window.innerWidth > 768 
                  ? `particle-float ${8 + Math.random() * 4}s ease-in-out infinite`
                  : `particle-float ${12 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 8}s`
              }}
            />
          ))}
        </div>
        
        {/* Main Content Container with Mobile-Safe Padding */}
        <div className="relative z-10 container mx-auto px-4 pt-28 pb-16 sm:pt-24 lg:pt-8 lg:pb-16">
          <div className="flex flex-col items-start min-h-[calc(100vh-6rem)] lg:min-h-[65vh] relative animate-fade-in">
            {/* Main Content - All Left Aligned */}
            <div className="w-full flex flex-col justify-start z-10 max-w-4xl animate-slide-in">
              <div className="mb-6">
                {/* Main Title */}
                <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 mt-16 sm:mt-20 lg:mt-46 animate-fade-in">
                  <span className="block text-white drop-shadow-2xl tracking-tight" style={{textShadow:'0 4px 24px #6dbeb0aa'}}>{t('SLK Trading & Design')}</span>
                  <span className="relative inline-block">
                    <span className="block bg-gradient-to-r from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] bg-clip-text text-transparent drop-shadow-2xl tracking-tight">{t('Construction')}</span>
                    <span className="absolute left-0 right-0 -bottom-3 flex items-center justify-center pointer-events-none select-none">
                      <svg width="100%" height="22" viewBox="0 0 220 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
                        {/* Blush Glow - thick and round at start, sharp and thin at end */}
                        <path d="M20 18 Q 110 34 210 12" stroke="url(#blushGradient)" fill="none" opacity="0.38" filter="url(#blushBlur)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 18 Q 110 34 210 12" stroke="url(#blushOpacity)" fill="none" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 12 Q 110 28 210 10" stroke="url(#curveGradient)" strokeWidth="6" fill="none" strokeLinecap="round"/>
                        <defs>
                          <linearGradient id="curveGradient" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#6dbeb0"/>
                            <stop offset="0.5" stopColor="#3d9392"/>
                            <stop offset="1" stopColor="#1b3d5a"/>
                          </linearGradient>
                          <linearGradient id="blushGradient" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#6dbeb0"/>
                            <stop offset="0.5" stopColor="#3d9392"/>
                            <stop offset="1" stopColor="#1b3d5a"/>
                          </linearGradient>
                          <linearGradient id="blushOpacity" x1="20" y1="18" x2="210" y2="12" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fff" stopOpacity="0.35"/>
                            <stop offset="80%" stopColor="#fff" stopOpacity="0.08"/>
                            <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                          </linearGradient>
                          <filter id="blushBlur" x="-20" y="-20" width="260" height="62" filterUnits="userSpaceOnUse">
                            <feGaussianBlur stdDeviation="8" />
                          </filter>
                        </defs>
                      </svg>
                    </span>
                  </span>
                </h1>
                {/* Company Badge */}
                <div className="inline-flex items-center glass-morphism text-[#e5f1f1] px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse border border-[#6dbeb0]/30 shadow-glow">
                  <Building2 className="w-4 h-4 mr-2" />
                  {t('Leading Construction Company in Laos')}
                </div>
                {/* Description */}
                <p className="text-xl text-white/95 mb-8 leading-relaxed max-w-xl drop-shadow-lg">
                  {t('Your Trusted Partner in Construction & Materials Supply. Specializing in construction, waterproofing, and flooring solutions with over 10 years of experience in Laos.')}
                </p>
                <p className="text-xl text-white/95 mb-8 leading-relaxed max-w-xl drop-shadow-lg">
                  {t('We deliver quality design, durable construction, and top-grade waterproofing solutions across Laos.')}
                </p>
              </div>
              {/* Key Services Icons */}
              <div className="flex flex-wrap gap-4 lg:gap-6 mb-8">
                <div className="flex items-center text-white/90 glass-morphism px-3 py-2 rounded-lg text-sm lg:text-base border border-white/20 shadow-glow-white">
                  <Building2 className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-[#6dbeb0]" />
                  <Trans as="span">Design & Construction</Trans>
                </div>
                <div className="flex items-center text-white/90 glass-morphism px-3 py-2 rounded-lg text-sm lg:text-base border border-white/20 shadow-glow-white">
                  <Shield className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-[#6dbeb0]" />
                  <Trans as="span">Waterproofing Materials</Trans>
                </div>
                <div id="flooring-materials-card" className="flex items-center text-white/90 glass-morphism px-3 py-2 rounded-lg text-sm lg:text-base border border-white/20 shadow-glow-white min-w-[185px] justify-center">
                  <Layers className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-[#6dbeb0]" />
                  <Trans as="span">Flooring Materials</Trans>
                </div>
              </div>
              {/* CTA Buttons */}
              <div className="flex flex-row gap-3 items-center mb-8">
                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="relative bg-gradient-to-r from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-md font-semibold flex items-center justify-center text-sm lg:text-base transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow w-auto min-w-[222px] focus:outline-none focus:ring-2 focus:ring-[#6dbeb0] focus:ring-offset-2"
                  aria-label={t('Get Free Quote')}
                >
                  <span className="relative z-10">{t('Get Free Quote')}</span>
                  <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
                  <span className="absolute inset-0 rounded-md pointer-events-none bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                <button 
                  onClick={() => {
                    const projectsSection = document.getElementById('projects');
                    if (projectsSection) {
                      projectsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="relative border-2 border-white/40 hover:bg-white/15 glass-morphism hover:border-white text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-md font-semibold text-sm lg:text-base transition-all duration-300 shadow-glow-white w-auto min-w-[222px] focus:outline-none focus:ring-2 focus:ring-[#6dbeb0] focus:ring-offset-2"
                  aria-label={t('See Our Projects')}
                >
                  <span className="relative z-10">{t('Our Projects')}</span>
                  <span className="absolute inset-0 rounded-md pointer-events-none bg-gradient-to-r from-[#6dbeb0]/10 via-transparent to-[#3d9392]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className="w-full lg:w-auto lg:absolute lg:top-1/2 lg:right-0 lg:-translate-y-1/2 flex justify-right lg:justify-end z-20">
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Experience Card */}
                <div className="glass-morphism p-8 lg:p-6 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 shadow-glow-white min-w-[220px] lg:min-w-[320px] lg:w-[320px] border-2 border-transparent hover:border-gradient-to-r hover:from-[#6dbeb0] hover:to-[#3d9392] group relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(120deg, #6dbeb0 0%, #3d9392 100%)', filter: 'blur(32px)'}}></div>
                  <div className="relative z-10 text-3xl lg:text-4xl font-extrabold text-[#6dbeb0] mb-2 drop-shadow-lg">{stats.experience}+</div>
                  <div className="relative z-10 text-white/95 font-medium text-sm lg:text-base drop-shadow-md">
                    <Trans as="div">Years of Experience</Trans>
                  </div>
                  <div className="relative z-10 text-white/80 text-xs lg:text-sm drop-shadow-md">{t('In Construction Industry')}</div>
                </div>
                {/* Projects Card */}
                <div className="glass-morphism p-8 lg:p-6 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 shadow-glow-white min-w-[220px] lg:min-w-[320px] lg:w-[320px] border-2 border-transparent hover:border-gradient-to-r hover:from-[#6dbeb0] hover:to-[#3d9392] group relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(120deg, #6dbeb0 0%, #3d9392 100%)', filter: 'blur(32px)'}}></div>
                  <div className="relative z-10 text-3xl lg:text-4xl font-extrabold text-[#6dbeb0] mb-2 drop-shadow-lg">{stats.projects}+</div>
                  <div className="relative z-10 text-white/95 font-medium text-sm lg:text-base drop-shadow-md">
                    <Trans as="div">Projects Completed</Trans>
                  </div>
                  <div className="relative z-10 text-white/80 text-xs lg:text-sm drop-shadow-md">{t('Across Various Sectors')}</div>
                </div>
                {/* Satisfaction Card */}
                <div className="glass-morphism p-8 lg:p-6 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 shadow-glow-white min-w-[220px] lg:min-w-[320px] lg:w-[320px] border-2 border-transparent hover:border-gradient-to-r hover:from-[#6dbeb0] hover:to-[#3d9392] group relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(120deg, #6dbeb0 0%, #3d9392 100%)', filter: 'blur(32px)'}}></div>
                  <div className="relative z-10 text-3xl lg:text-4xl font-extrabold text-[#6dbeb0] mb-2 drop-shadow-lg">{stats.satisfaction}%</div>
                  <div className="relative z-10 text-white/95 font-medium text-sm lg:text-base drop-shadow-md">
                    <Trans as="div">Client Satisfaction</Trans>
                  </div>
                  <div className="relative z-10 text-white/80 text-xs lg:text-sm drop-shadow-md">{t('Exceeding Expectations')}</div>
                </div>
                {/* Support Card */}
                <div className="glass-morphism p-8 lg:p-6 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 shadow-glow-white min-w-[220px] lg:min-w-[320px] lg:w-[320px] border-2 border-transparent hover:border-gradient-to-r hover:from-[#6dbeb0] hover:to-[#3d9392] group relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(120deg, #6dbeb0 0%, #3d9392 100%)', filter: 'blur(32px)'}}></div>
                  <div className="relative z-10 text-3xl lg:text-4xl font-extrabold text-[#6dbeb0] mb-2 drop-shadow-lg">{stats.support}/7</div>
                  <div className="relative z-10 text-white/95 font-medium text-sm lg:text-base drop-shadow-md">
                    <Trans as="div">Support Available</Trans>
                  </div>
                  <div className="relative z-10 text-white/80 text-xs lg:text-sm drop-shadow-md">{t('Always Here For You')}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
          </div>  
        </div>
      </section>

      

      {/* Quote Modal */}
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)}
        source="hero_get_free_quote"
      />
    </>
  );
};

export default Hero;