
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages array
export const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English', name: 'English' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch', name: 'German' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt', name: 'Vietnamese' },
  { code: 'lo', label: 'Lao', flag: '🇱🇦', nativeName: 'ລາວ', name: 'Lao' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย', name: 'Thai' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺', nativeName: 'Magyar', name: 'Hungarian' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano', name: 'Italian' },
  // Add more as needed
];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  languages: typeof languages;
  isLoading: boolean;
}



const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';
const GOOGLE_API_KEY = 'AIzaSyCBgu7_wcOokxRxrwle59tbJHw-2oxBHKQ';
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const initializeLanguage = () => {
      try {
        // Load saved language preference from localStorage
        const savedLanguage = localStorage.getItem('slk_language');
        
        if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
          setCurrentLanguage(savedLanguage);
        } else {
          // Try to detect browser language
          const browserLang = navigator.language.split('-')[0];
          if (languages.some(lang => lang.code === browserLang)) {
            setCurrentLanguage(browserLang);
          }
        }
      } catch (error) {
        console.warn('Failed to load language preference:', error);
        // Fallback to English
        setCurrentLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure proper hydration
    const timer = setTimeout(initializeLanguage, 100);
    
    return () => clearTimeout(timer);
  }, [isClient]);

  const setLanguage = (language: string) => {
    if (!languages.some(lang => lang.code === language)) {
      console.warn(`Language ${language} is not supported`);
      return;
    }

    setCurrentLanguage(language);
    
    if (isClient) {
      try {
        localStorage.setItem('slk_language', language);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  };

  // Main translation function: always use dynamic translation (Google API), fallback to key
  const t = (text: string): string => {
    if (!text) return '';
    if (currentLanguage === 'en') return text;
    if (dynamicTranslations[text]) return dynamicTranslations[text];
    return text;
  };

  // Auto-translate all visible strings and cache them
  useEffect(() => {
    if (!isClient || currentLanguage === 'en') return;
    setIsTranslating(true);
    console.log('[i18n] Attempting translation for language:', currentLanguage);
    // Find all visible strings in the DOM
    const elements = Array.from(document.querySelectorAll('[data-i18n]')) as HTMLElement[];
    const texts = Array.from(new Set(elements.map(el => el.getAttribute('data-i18n') || '').filter(Boolean)));
    const toTranslate = texts.filter(t => !dynamicTranslations[t]);
    if (toTranslate.length === 0) {
      setIsTranslating(false);
      return;
    }
    const fetchTranslations = async () => {
      const newTranslations: Record<string, string> = { ...dynamicTranslations };
      for (const text of toTranslate) {
        try {
          const cacheKey = `slk_dyntrans_${currentLanguage}_${text}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            newTranslations[text] = cached;
            continue;
          }
          console.log(`[i18n] Translating "${text}" to ${currentLanguage}`);
          const res = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: text,
              source: 'en',
              target: currentLanguage,
            }),
          });
          const data = await res.json();
          console.log('[i18n] API response:', data);
          const translated = data?.data?.translations?.[0]?.translatedText;
          if (translated) {
            newTranslations[text] = translated;
            localStorage.setItem(cacheKey, translated);
          } else {
            console.warn('Google Translate API did not return a translation:', data);
          }
        } catch (e) {
          console.error('Translation API error:', e);
        }
      }
      setDynamicTranslations(newTranslations);
      setIsTranslating(false);
    };
    fetchTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, isClient]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    languages,
    isLoading
  };

  // Don't render children until client-side hydration is complete
  if (!isClient || isLoading || isTranslating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{isTranslating ? 'Translating...' : 'Loading Language Settings...'}</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;