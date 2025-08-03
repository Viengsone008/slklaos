"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ...existing code...

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClient]);

  // Close dropdown on escape key
  useEffect(() => {
    if (!isClient) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isClient]);

  // Don't render on server-side to prevent hydration mismatches
  if (!isClient) {
    return (
      <div className="relative">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white/90 border border-white/20 backdrop-blur-sm">
          <Globe className="w-4 h-4" />
          <span className="text-lg">🇺🇸</span>
          <span className="hidden sm:block text-sm font-medium">English</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }

  const currentLang = languages?.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleDropdown();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label="Select Language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg" aria-hidden="true">{currentLang?.flag || '🇺🇸'}</span>
        <span className="hidden sm:block text-sm font-medium">
          {currentLang?.nativeName || 'English'}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
          role="listbox"
          aria-label="Language options"
        >
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-600 px-3 py-2 border-b border-gray-200 mb-2">
              {t('common.selectLanguage') || 'Select Language'} / ເລືອກພາສາ / เลือกภาษา / 选择语言 / Chọn ngôn ngữ / Válasszon nyelvet / Sprache wählen / Seleziona lingua
            </div>
            
            {languages?.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                  currentLanguage === language.code
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={currentLanguage === language.code}
                type="button"
              >
                <span className="text-xl" aria-hidden="true">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className={`text-xs ${
                    currentLanguage === language.code ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {language.name}
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div 
                    className="w-2 h-2 bg-white rounded-full" 
                    aria-hidden="true"
                  ></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              🌐 Multi-language support by SLK Trading
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for fade-in animation */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;