"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

interface FloatingQuoteButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingQuoteButton: React.FC<FloatingQuoteButtonProps> = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={
      `fixed bottom-24 right-8 z-[9999] bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] px-6 py-4 rounded-full shadow-2xl font-bold text-lg flex items-center gap-2 border-2 border-[#bfa76a] hover:scale-105 transition-all duration-300 ${className || ''}`
    }
    style={{ boxShadow: "0 4px 24px 0 rgba(191,167,106,0.18)" }}
  >
    Get a Quote
    <ArrowRight className="w-5 h-5" />
  </button>
);

export default FloatingQuoteButton;
