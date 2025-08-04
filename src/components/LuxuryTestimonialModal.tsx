"use client";

import React, { useState, useEffect } from 'react';
import { X, Star, Quote, ChevronLeft, ChevronRight, Award, MapPin, Calendar, DollarSign, CheckCircle, Sparkles } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  service: string;
  projectValue: string;
  date: string;
  quote: string;
  fullTestimonial: string;
  rating: number;
  image: string;
  projectImages: string[];
  highlights: string[];
}

interface LuxuryTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonials: Testimonial[];
  initialIndex?: number;
}

const LuxuryTestimonialModal: React.FC<LuxuryTestimonialModalProps> = ({
  isOpen,
  onClose,
  testimonials,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [showFullTestimonial, setShowFullTestimonial] = useState(false);

  const currentTestimonial = testimonials[currentIndex];

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle modal opening animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsLoaded(true), 100);
    } else {
      setIsLoaded(false);
    }
  }, [isOpen]);

  // Auto-cycle project images
  useEffect(() => {
    if (!currentTestimonial?.projectImages?.length) return;
    
    const interval = setInterval(() => {
      setImageIndex((prev) => 
        (prev + 1) % currentTestimonial.projectImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [currentTestimonial]);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setImageIndex(0);
    setShowFullTestimonial(false);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setImageIndex(0);
    setShowFullTestimonial(false);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') prevTestimonial();
    if (e.key === 'ArrowRight') nextTestimonial();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !currentTestimonial) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with Enhanced Blur and Particles */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl transition-all duration-700"
        onClick={onClose}
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(191,167,106,0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(229,226,214,0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(191,167,106,0.1) 0%, rgba(0,0,0,0.8) 100%)
          `
        }}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#bfa76a]/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Modal Container with Glassmorphism */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Luxury Glass Container */}
        <div 
          className={`relative bg-white/95 backdrop-blur-3xl border border-[#bfa76a]/30 rounded-3xl shadow-[0_40px_100px_rgba(191,167,106,0.3)] transform transition-all duration-700 ${
            isLoaded 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-8'
          } ${
            isAnimating 
              ? direction === 'right' 
                ? 'translate-x-2' 
                : '-translate-x-2' 
              : 'translate-x-0'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(229,226,214,0.9) 100%)',
            boxShadow: `
              0 40px 100px rgba(191,167,106,0.3),
              inset 0 1px 0 rgba(255,255,255,0.6),
              inset 0 -1px 0 rgba(191,167,106,0.2),
              0 0 0 1px rgba(191,167,106,0.1)
            `
          }}
        >
          {/* Decorative Golden Accents with Animation */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#bfa76a] to-transparent opacity-80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3 animate-shimmer" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#bfa76a] to-transparent opacity-80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3 animate-shimmer" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#bfa76a]/40 rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#bfa76a]/40 rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#bfa76a]/40 rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#bfa76a]/40 rounded-br-xl" />
          
          {/* Close Button with Counter */}
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            {/* Testimonial Counter */}
            <div className="bg-white/90 backdrop-blur-xl border border-[#bfa76a]/30 rounded-full px-4 py-2 text-sm font-medium text-[#1a2936]">
              <span className="text-[#bfa76a]">{currentIndex + 1}</span>
              <span className="text-[#1a2936]/60 mx-1">of</span>
              <span className="text-[#1a2936]">{testimonials.length}</span>
            </div>
            
            <button
              onClick={onClose}
              className="group w-12 h-12 bg-white/80 backdrop-blur-xl border border-[#bfa76a]/30 rounded-full flex items-center justify-center hover:bg-[#bfa76a] hover:border-[#bfa76a] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <X className="w-6 h-6 text-[#1a2936] group-hover:text-white transition-colors duration-300" />
            </button>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            disabled={isAnimating}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-40 group w-14 h-14 bg-white/90 backdrop-blur-xl border border-[#bfa76a]/40 rounded-full flex items-center justify-center hover:bg-[#bfa76a] hover:border-[#bfa76a] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <ChevronLeft className="w-7 h-7 text-[#1a2936] group-hover:text-white transition-colors duration-300" />
          </button>

          <button
            onClick={nextTestimonial}
            disabled={isAnimating}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-40 group w-14 h-14 bg-white/90 backdrop-blur-xl border border-[#bfa76a]/40 rounded-full flex items-center justify-center hover:bg-[#bfa76a] hover:border-[#bfa76a] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <ChevronRight className="w-7 h-7 text-[#1a2936] group-hover:text-white transition-colors duration-300" />
          </button>

          {/* Modal Content */}
          <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
            {/* Left Side - Project Images */}
            <div className="lg:w-1/2 relative overflow-hidden">
              <div className="relative h-64 lg:h-full min-h-[400px]">
                {/* Project Image Carousel */}
                {currentTestimonial.projectImages?.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ${
                      index === imageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentTestimonial.service} project ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                ))}
                
                {/* Image Indicators */}
                {currentTestimonial.projectImages?.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {currentTestimonial.projectImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === imageIndex
                            ? 'bg-[#bfa76a] scale-125'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Floating Quote Icon */}
                <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Right Side - Testimonial Content */}
            <div className="lg:w-1/2 p-8 lg:p-12 overflow-y-auto">
              <div className="space-y-6">
                {/* Client Header */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#bfa76a]/30 to-[#e5e2d6]/30 flex items-center justify-center overflow-hidden border-4 border-[#bfa76a]/50 shadow-xl">
                        <img 
                          src={currentTestimonial.image} 
                          alt={currentTestimonial.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {currentTestimonial.name}
                      </h2>
                      <p className="text-lg text-[#bfa76a] font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {currentTestimonial.title}
                      </p>
                      <p className="text-sm text-[#1a2936]/70">
                        {currentTestimonial.company}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-center lg:justify-start gap-1 mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-6 h-6 text-[#bfa76a] fill-current transform transition-transform duration-200 hover:scale-110" 
                        style={{animationDelay: `${i * 100}ms`}}
                      />
                    ))}
                    <span className="ml-2 text-[#1a2936]/60 font-medium">
                      {currentTestimonial.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-[#bfa76a]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#bfa76a]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#1a2936]/60 uppercase tracking-wide">Location</p>
                      <p className="font-semibold text-[#1a2936]">{currentTestimonial.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#bfa76a]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#1a2936]/60 uppercase tracking-wide">Project Value</p>
                      <p className="font-semibold text-[#1a2936]">{currentTestimonial.projectValue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#bfa76a]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#1a2936]/60 uppercase tracking-wide">Completed</p>
                      <p className="font-semibold text-[#1a2936]">{currentTestimonial.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bfa76a]/20 to-[#e5e2d6]/20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#bfa76a]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#1a2936]/60 uppercase tracking-wide">Service</p>
                      <p className="font-semibold text-[#1a2936]">{currentTestimonial.service}</p>
                    </div>
                  </div>
                </div>

                {/* Full Testimonial with Expand/Collapse */}
                <div className="space-y-4">
                  <div className="relative">
                    <blockquote className={`text-xl lg:text-2xl font-semibold text-[#1a2936] leading-relaxed transition-all duration-500 ${
                      showFullTestimonial ? 'max-h-none' : 'max-h-32 overflow-hidden'
                    }`} style={{ 
                      fontFamily: 'Playfair Display, serif',
                      textShadow: '0 2px 12px rgba(191,167,106,0.15)'
                    }}>
                      "{currentTestimonial.fullTestimonial}"
                    </blockquote>
                    
                    {!showFullTestimonial && currentTestimonial.fullTestimonial.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                    )}
                  </div>
                  
                  {currentTestimonial.fullTestimonial.length > 200 && (
                    <button
                      onClick={() => setShowFullTestimonial(!showFullTestimonial)}
                      className="inline-flex items-center gap-2 text-[#bfa76a] hover:text-[#1a2936] font-medium transition-colors duration-300 text-sm"
                    >
                      <span>{showFullTestimonial ? 'Show Less' : 'Read More'}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${showFullTestimonial ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Project Highlights with Enhanced Design */}
                {currentTestimonial.highlights && currentTestimonial.highlights.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#bfa76a]" />
                      <h3 className="text-lg font-bold text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Project Highlights
                      </h3>
                    </div>
                    <div className="grid gap-3">
                      {currentTestimonial.highlights.map((highlight, index) => (
                        <div 
                          key={index} 
                          className="group flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-[#bfa76a]/5 to-transparent hover:from-[#bfa76a]/10 transition-all duration-300"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-[#1a2936]/80 leading-relaxed flex-1">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation Dots with Progress Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
            <div className="flex flex-col items-center gap-3">
              {/* Progress Bar */}
              <div className="w-48 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((currentIndex + 1) / testimonials.length) * 100}%` }}
                />
              </div>
              
              {/* Navigation Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 'right' : 'left');
                      setCurrentIndex(index);
                      setShowFullTestimonial(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-[#bfa76a] scale-125 shadow-lg'
                        : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryTestimonialModal;
