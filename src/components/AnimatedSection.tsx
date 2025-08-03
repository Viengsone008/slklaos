"use client";
import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'rotate-in' | 'bounce-in';
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  repeatOnScroll?: boolean;
  onClick?: () => void;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 800,
  threshold = 0.15,
  triggerOnce = false,
  repeatOnScroll = true,
  onClick
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (!isClient) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (repeatOnScroll ? false : triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (repeatOnScroll && !triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, triggerOnce, repeatOnScroll, isClient]);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out`;
    const durationClass = duration <= 300 ? 'duration-300' : 
                         duration <= 500 ? 'duration-500' : 
                         duration <= 700 ? 'duration-700' : 'duration-1000';
    
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return `${baseClasses} ${durationClass} opacity-0 translate-y-4 scale-98`;
        case 'fade-down':
          return `${baseClasses} ${durationClass} opacity-0 -translate-y-4 scale-98`;
        case 'fade-left':
          return `${baseClasses} ${durationClass} opacity-0 translate-x-4 scale-98`;
        case 'fade-right':
          return `${baseClasses} ${durationClass} opacity-0 -translate-x-4 scale-98`;
        case 'scale':
          return `${baseClasses} ${durationClass} opacity-0 scale-95`;
        case 'fade-in':
          return `${baseClasses} ${durationClass} opacity-0`;
        case 'slide-up':
          return `${baseClasses} ${durationClass} opacity-0 translate-y-6`;
        case 'slide-down':
          return `${baseClasses} ${durationClass} opacity-0 -translate-y-6`;
        case 'zoom-in':
          return `${baseClasses} ${durationClass} opacity-0 scale-90`;
        case 'rotate-in':
          return `${baseClasses} ${durationClass} opacity-0 scale-95 rotate-3`;
        case 'bounce-in':
          return `${baseClasses} ${durationClass} opacity-0 scale-95 -translate-y-2`;
        default:
          return `${baseClasses} ${durationClass} opacity-0 translate-y-4 scale-98`;
      }
    }
    
    return `${baseClasses} ${durationClass} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`;
  };

  // Don't render animations on server-side
  if (!isClient) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClasses()} ${className}`}
      onClick={onClick}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;