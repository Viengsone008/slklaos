"use client";
import React, { useEffect, useState } from 'react';
import { Building2, Layers, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadingSteps = [
    { icon: Building2, text: t('loading.steps.database'), color: "text-orange-400" },
    { icon: Shield, text: t('loading.steps.auth'), color: "text-blue-400" },
    { icon: Layers, text: t('loading.steps.interface'), color: "text-green-400" },
    { icon: Building2, text: t('loading.steps.portal'), color: "text-orange-400" }
  ];

  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete(), 200);
          return 100;
        }
        
        // Faster progress increment
        const newProgress = prev + Math.random() * 8 + 4;
        const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
        setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1));
        
        return Math.min(newProgress, 100);
      });
    }, 20); // Reduced interval from 100ms to 20ms

    return () => clearInterval(interval);
  }, [isClient, onLoadingComplete, loadingSteps.length]);

  // Don't render on server-side
  if (!isClient) {
    return null;
  }

  const CurrentIcon = loadingSteps[currentStep]?.icon || Building2;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden background-3d-container">
      {/* Hero-Matching Background with Construction Theme */}
      <div className="absolute inset-0 background-3d-layer">
        <Image 
          src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Modern house construction and design background"
          fill
          className="object-cover animate-background-zoom gpu-accelerated"
          priority
          quality={75}
          sizes="100vw"
        />
        {/* Matching overlay from hero section */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Additional gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-orange-900/20 animate-background-pulse"></div>
      </div>

      {/* Floating Particles with 3D depth - matching hero */}
      <div className="particles-container">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="particle animate-particle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              transform: `translateZ(${Math.random() * 100}px)`,
              background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`
            }}
          />
        ))}
      </div>

      {/* Animated Grid Lines - subtle construction theme */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="construction-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="30" cy="30" r="2" fill="white" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#construction-grid)" />
        </svg>
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-white">
        {/* Logo Section - matching hero style */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="glass-morphism p-4 rounded-2xl border border-white/20 shadow-glow-white">
                <Image 
                  src="/SLK-logo.png" 
                  alt="SLK Trading & Design Construction Logo"
                  width={208}
                  height={208}
                  className="object-contain animate-pulse"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping"></div> 
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 animate-fade-in drop-shadow-2xl">
            {t('loading.title')}
          </h1>
          <p className="text-xl text-[#6dbeb0] font-semibold animate-fade-in drop-shadow-2xl">
            {t('loading.subtitle')}
          </p>
          <div className="inline-flex items-center glass-morphism text-green-200 px-4 py-2 rounded-full text-sm font-medium mt-4 animate-pulse border border-orange-400/30 shadow-glow">
            <Building2 className="w-4 h-4 mr-2" />
            {t('loading.badge')}
          </div>
        </div>

        {/* Loading Animation */}
        <div className="w-full max-w-md mb-8">
          {/* Progress Bar - enhanced with glass morphism */}
          <div className="relative mb-6">
            <div className="w-full h-3 glass-morphism-dark rounded-full overflow-hidden border border-white/20">
              <div 
                className="h-full bg-gradient-to-r from-[#6dbeb0] via-green-500 to-orange-600 rounded-full transition-all duration-200 ease-out relative shadow-glow"
                style={{ width: `${progress}%` }}
              > 
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" style={{ animationDuration: '1.5s' }}></div>
              </div>
            </div>
            <div className="text-center mt-3 text-white/90 font-bold text-lg drop-shadow-lg">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Current Step Indicator - enhanced styling */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="glass-morphism p-6 rounded-2xl border border-white/20 shadow-glow-white">
                <CurrentIcon className={`w-10 h-10 ${loadingSteps[currentStep]?.color || 'text-orange-400'} animate-bounce drop-shadow-lg`} />
              </div>
            </div>
            <p className="text-white/95 font-medium text-xl mb-3 drop-shadow-lg">
              {loadingSteps[currentStep]?.text || t('loading.steps.portal')}
            </p>
            <div className="flex justify-center space-x-3">
              {loadingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-orange-400 shadow-glow' 
                      : 'bg-white/30 border border-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Loading Dots - enhanced with glow effects */}
        <div className="flex space-x-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-orange-400 rounded-full animate-bounce shadow-glow"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Construction-themed status messages */}
        <div className="glass-morphism px-6 py-4 rounded-xl border border-white/20 shadow-glow-white max-w-lg text-center">
          <div className="flex items-center justify-center space-x-2 text-white/90 text-sm">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>{t('loading.waiting')}</span>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-white/70">
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-blue-400" />
              {t('loading.status.secure')}
            </span>
            <span className="flex items-center">
              <Layers className="w-3 h-3 mr-1 text-green-400" />
              {t('loading.status.professional')}
            </span>
            <span className="flex items-center">
              <Building2 className="w-3 h-3 mr-1 text-orange-400" />
              {t('loading.status.multiAccess')}
            </span>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 text-center text-white/70">
          <p className="text-sm drop-shadow-md">
            {t('loading.preparing')}
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2 text-xs">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span>{t('loading.powered')}</span>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enhanced floating construction elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            <div className="w-8 h-8 border-2 border-white rounded-lg animate-float transform rotate-45"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;