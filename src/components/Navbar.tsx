"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { useRouter, usePathname } from 'next/navigation';
 
const sectionIds = ['home', 'services', 'products', 'projects', 'about', 'blog', 'contact'];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isMobile) {
        if (currentScrollY < 100) {
          setIsVisible(true);
        } else {
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false);
            setIsMobileMenuOpen(false);
          } else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
          }
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Section highlight logic (only on home page)
      if (pathname === '/') {
        const scrollPosition = window.scrollY + 100;
        for (const section of sectionIds) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setCurrentSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const navbar = document.querySelector('[data-navbar]');
        if (navbar && !navbar.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleNavigation = (path: string, sectionId?: string) => {
    if (path === '/' && sectionId) {
      if (pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    } else {
      router.push(path);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
    setIsMobileMenuOpen(false);
  };
  
  const navItems = [
    { name: t('SERVICES'), path: '/services', sectionId: 'services', key: 'SERVICES' },
    { name: t('PRODUCTS'), path: '/products', sectionId: 'products', key: 'PRODUCTS' },
    { name: t('PROJECTS'), path: '/projects', sectionId: 'projects', key: 'PROJECTS' },
    { name: t('ABOUT US'), path: '/about', sectionId: 'about', key: 'ABOUT US' },
    { name: t('NEWS'), path: '/news', sectionId: 'blog', key: 'NEWS' },
    { name: t('CONTACT'), path: '/contact', sectionId: 'contact', key: 'CONTACT' },
    { name: t('CAREERS'), path: '/careers', sectionId: undefined, key: 'CAREERS' },
  ];

   // Dynamic styling based on current section or page
  const getNavStyles = () => {
    const isDarkSection = currentSection === 'home' || currentSection === 'contact' || pathname !== '/';
    return {
      navBg: isDarkSection 
        ? 'bg-white/25 backdrop-blur-md border-white/30' 
        : 'bg-[#1b3d5a]/25 backdrop-blur-md border-[#1b3d5a]/20',
      logoText: 'text-white drop-shadow-lg',
      logoSubtext: 'text-white/90 drop-shadow-md',
      navLinks: isDarkSection 
        ? 'text-[#1b3d5a] hover:text-[#6dbeb0] drop-shadow-md font-medium' // dark text for light bg
        : 'text-white hover:text-[#6dbeb0] drop-shadow-md font-medium',    // white text for dark bg
      mobileButton: 'text-white hover:bg-white/20 drop-shadow-md',
      mobileLinks: 'text-white/95 hover:bg-white/20 hover:text-[#6dbeb0]',
      mobileBorder: 'border-white/30'
    };
  };
  
  const styles = getNavStyles();

  const isActiveNavItem = (item: any) => {
    if (pathname === '/' && item.path === '/') {
      return currentSection === item.sectionId;
    }
    return pathname === item.path;
  };

  // SSR-safe: Always show navbar on desktop and during SSR
  const isSSR = typeof window === 'undefined';
  return (
    <nav
      data-navbar
      className={`fixed top-0 left-0 right-0 z-[9999] px-6 pt-2 transition-all duration-300 ${
        !isMobile
          ? 'translate-y-0'
          : (isVisible ? 'translate-y-0' : '-translate-y-full')
      } lg:translate-y-0`}
    >
      <div className={`${styles.navBg} border-2 rounded-2xl px-4 md:px-6 py-4 transition-all duration-500 shadow-lg`}>
        <div className="flex items-center justify-between w-full gap-y-4">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/', 'home')}>
            <div className="mr-3">
              <img
                src="/SLK-logo.png"
                alt="SLK Trading & Design Construction Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${styles.logoText} transition-all duration-500`}>
                SLK Trading
              </h1>
              <p className={`text-xs ${styles.logoSubtext} transition-all duration-500`}>
                & Design Construction
              </p>
            </div> 
          </div>

          {/* Desktop Navigation */}
         <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path, item.sectionId)}
                className={`${styles.navLinks} transition-all duration-500 hover:scale-105 relative text-base`}
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }} // for extra visibility
              >
                <span className="relative z-10">{item.name}</span>
                {isActiveNavItem(item) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#6dbeb0] rounded-full"></div>
                )}
              </button>
            ))}
            {/* <LanguageSelector /> */}
            {/* Updated Admin button to link to admin-login page */}
            <button
              onClick={() => handleNavigation('/admin-login')}
              className="bg-[#6dbeb0] hover:bg-[#3d9392] text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ml-4"
            >
              {t('Admin')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg ${styles.mobileButton} transition-all duration-500`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden mt-4 pt-4 border-t-2 ${styles.mobileBorder} transition-all duration-500 animate-fade-in max-h-[80vh] overflow-y-auto rounded-xl`}>
            <div className="space-y-3 px-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.path, item.sectionId)}
                  className={`block w-full text-left py-2 px-3 rounded-lg font-medium ${styles.mobileLinks} transition-all duration-500 relative`}
                >
                  {item.name}
                  {isActiveNavItem(item) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6dbeb0] rounded-r-full"></div>
                  )}
                </button>
              ))}

              <div className="py-2 px-3">
                <LanguageSelector />
              </div>

              {/* Updated Mobile Admin button to link to admin-login page */}
              <button
                onClick={() => handleNavigation('/admin-login')}
                className="block w-full bg-[#6dbeb0] hover:bg-[#3d9392] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-lg mt-4 text-center"
              >
                {t('Admin')}
              </button>
            </div>
          </div>
        )}
      </div>

      {isMobile && !isVisible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm z-40 animate-fade-in">
          Scroll up to show menu
        </div>
      )}
    </nav>
  );
};

export default Navbar;
