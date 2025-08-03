"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import fireworks to prevent SSR issues
const FireworksDisplay = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [fireworksInstance, setFireworksInstance] = useState<any>(null);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if current date is within July 2025
  useEffect(() => {
    if (!isClient) return;

    const now = new Date();
    const start = new Date('2025-07-01');
    const end = new Date('2025-07-31T23:59:59');

    if (now >= start && now <= end) {
      setShowFireworks(true);
      setShowMessage(true);
    }
  }, [isClient]);

  // Initialize and start fireworks animation (client-side only)
  useEffect(() => {
    if (!isClient || !showFireworks || !containerRef.current || typeof window === 'undefined') return;

    let fireworks: any = null;

    const initFireworks = async () => {
      try {
        // Dynamically import fireworks-js only on client-side
        const { Fireworks } = await import('fireworks-js');
        
        if (!containerRef.current) return;

        fireworks = new Fireworks(containerRef.current, {
          autoresize: true,
          opacity: 0.7,
          acceleration: 1.05,
          friction: 0.95,
          gravity: 1.2,
          particles: 100,
          trace: 5,
          traceSpeed: 10,
          explosion: 8,
          intensity: 50,
          flickering: 50,
          lineWidth: {
            explosion: { min: 2, max: 4 },
            trace: { min: 1, max: 2 }
          },
          hue: { min: 0, max: 360 },
          delay: { min: 20, max: 40 },
          brightness: { min: 70, max: 90 },
          decay: { min: 0.015, max: 0.03 },
          mouse: { click: false, move: false, max: 0 }
        });

        setFireworksInstance(fireworks);

        // Use multiple requestAnimationFrame for better browser compatibility
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (fireworks && typeof fireworks.start === 'function') {
              fireworks.start();
            }
          });
        });

      } catch (error) {
        console.error('Error initializing fireworks:', error);
      }
    };

    initFireworks();

    // Auto-stop fireworks after 8 seconds
    const timer = setTimeout(() => {
      if (fireworks && typeof fireworks.stop === 'function') {
        fireworks.stop();
      }
      setShowMessage(false);
      setShowFireworks(false);
      setFireworksInstance(null);
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (fireworks && typeof fireworks.stop === 'function') {
        try {
          fireworks.stop();
        } catch (error) {
          console.error('Error stopping fireworks:', error);
        }
      }
      setFireworksInstance(null);
    };
  }, [isClient, showFireworks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fireworksInstance && typeof fireworksInstance.stop === 'function') {
        try {
          fireworksInstance.stop();
        } catch (error) {
          console.error('Error cleaning up fireworks:', error);
        }
      }
    };
  }, [fireworksInstance]);

  // Don't render on server-side or if not showing
  if (!isClient || (!showFireworks && !showMessage)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Fireworks Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-screen h-screen"
        style={{
          touchAction: showFireworks ? 'none' : 'auto',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: 'none', // Prevent interaction issues
        }}
      />

      {/* Launch Banner */}
      <AnimatePresence mode="wait">
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { 
                duration: 1.2, 
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.2
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -50,
              transition: { 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10000]"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.3, duration: 0.8 }
              }}
              className="bg-white/95 backdrop-blur-lg text-gray-900 rounded-3xl shadow-2xl px-8 md:px-12 py-8 md:py-10 text-center max-w-2xl w-full mx-4 md:mx-6 border border-white/40"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: 0.5, duration: 0.6 }
                }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
              >
                🎉 Celebrating
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.7, duration: 0.6 }
                }}
                className="space-y-3"
              >
                <p className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-800">
                  Launching a New Website
                </p>
                
                <p className="text-lg md:text-xl lg:text-2xl font-medium text-gray-700 leading-relaxed">
                  SLK Trading & Design Construction Co., Ltd
                </p>
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 1, duration: 0.8 }
                }}
                className="mt-6 flex justify-center space-x-2"
              >
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>🎊</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '100ms' }}>🎉</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>🎊</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FireworksDisplay;
