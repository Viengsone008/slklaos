"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  fullScreen?: boolean;
  isOpen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  title, 
  children, 
  onClose, 
  fullScreen = false, 
  isOpen = true,
  size = 'md' // Changed from 'lg' to 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Size classes for different modal sizes - optimized for medium
  const sizeClasses = {
    sm: 'max-w-sm',     // 384px
    md: 'max-w-2xl',    // 672px - Better medium size
    lg: 'max-w-4xl',    // 896px
    xl: 'max-w-7xl'     // 1280px
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white relative ${
          fullScreen 
            ? "w-full h-full max-w-full max-h-full rounded-none" 
            : `w-full ${sizeClasses[size]} max-h-[90vh] rounded-xl`
        } overflow-hidden shadow-2xl border border-gray-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close modal"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-72px)] p-6">
          <div className="text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
