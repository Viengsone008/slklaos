"use client";

import React, { useState } from 'react';
import LuxuryTestimonialModal from '../../components/LuxuryTestimonialModal';
import { sampleTestimonials } from '../../data/testimonials';
import { Star, Quote, Eye } from 'lucide-react';

const TestimonialModalDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedTestimonialIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/10">
      {/* Header */}
      <div className="pt-20 pb-16 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] rounded-full mb-8 shadow-2xl">
            <Quote className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
            Luxury Testimonial <span className="text-[#bfa76a]">Modal</span>
          </h1>
          <p className="text-xl text-[#1a2936]/80 max-w-3xl mx-auto leading-relaxed">
            Experience our premium testimonial modal with glassmorphism effects, golden accents, and smooth animations
          </p>
        </div>
      </div>

      {/* Testimonial Preview Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative backdrop-blur-xl bg-white/90 border border-[#bfa76a]/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
              onClick={() => openModal(index)}
            >
              {/* Hover Overlay with Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#bfa76a]/10 to-[#e5e2d6]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#bfa76a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-1/3 animate-shimmer" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Client Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#bfa76a]/30 to-[#e5e2d6]/30 flex items-center justify-center overflow-hidden border-2 border-[#bfa76a]/50">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2936]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-[#bfa76a] font-semibold">
                      {testimonial.title}
                    </p>
                    <p className="text-xs text-[#1a2936]/60">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#bfa76a] fill-current" />
                  ))}
                </div>

                {/* Quote Preview */}
                <blockquote className="text-[#1a2936] mb-4 line-clamp-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  "{testimonial.quote}"
                </blockquote>

                {/* Service Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#bfa76a]/20 to-[#e5e2d6]/20 border border-[#bfa76a]/30 rounded-full px-3 py-1 text-xs font-medium text-[#bfa76a]">
                    {testimonial.service}
                  </span>
                  
                  {/* View Details Button */}
                  <div className="flex items-center gap-2 text-[#bfa76a] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">View Details</span>
                  </div>
                </div>
              </div>

              {/* Project Value Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-br from-[#bfa76a] to-[#e5e2d6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {testimonial.projectValue}
              </div>
            </div>
          ))}
        </div>

        {/* Demo Instructions */}
        <div className="mt-16 text-center">
          <div className="backdrop-blur-xl bg-white/80 border border-[#bfa76a]/30 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h2 className="text-2xl font-bold text-[#1a2936] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              ✨ Enhanced Luxury Testimonial Modal
            </h2>
            <p className="text-[#1a2936]/70 mb-6">
              Click any testimonial card to experience the enhanced modal with advanced animations, expandable content, progress tracking, and sophisticated glassmorphism effects
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#bfa76a] font-medium mb-4">
              <span>• Advanced Glassmorphism</span>
              <span>• Shimmer Animations</span>
              <span>• Expandable Content</span>
              <span>• Progress Tracking</span>
              <span>• Floating Particles</span>
              <span>• Enhanced Highlights</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-[#1a2936]/60">
              <span>🎭 Direction-aware transitions</span>
              <span>📊 Progress indicators</span>
              <span>✨ Particle effects</span>
              <span>📱 Touch optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Testimonial Modal */}
      <LuxuryTestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testimonials={sampleTestimonials}
        initialIndex={selectedTestimonialIndex}
      />
    </div>
  );
};

export default TestimonialModalDemo;
