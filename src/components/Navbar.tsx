"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
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
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
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
      // Close products dropdown when clicking outside
      if (isProductsDropdownOpen) {
        const dropdown = document.querySelector('[data-products-dropdown]');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setIsProductsDropdownOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isProductsDropdownOpen]);

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
    setIsProductsDropdownOpen(false);
  };
  
  const navItems = [
    { name: t('SERVICES'), path: '/services', sectionId: 'services', key: 'SERVICES' },
    { 
      name: t('PRODUCTS'), 
      path: '/products', 
      sectionId: 'products', 
      key: 'PRODUCTS',
      hasDropdown: true,
      subItems: [
        { name: t('Waterproofing Materials'), path: '/product-catalogue#waterproofing', key: 'WATERPROOFING_MATERIALS' },
        { name: t('Flooring Materials'), path: '/product-catalogue#flooring', key: 'FLOORING_MATERIALS' },
        { name: t('Rocksoil Materials'), path: '/product-catalogue#rocksoil', key: 'ROCKSOIL' }
      ]
    },
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
        ? 'bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl shadow-white/10' 
        : 'bg-black/10 backdrop-blur-2xl border border-white/15 shadow-xl shadow-black/20',
      logoText: 'text-white drop-shadow-2xl font-bold',
      logoSubtext: 'text-white drop-shadow-xl font-medium',
      navLinks: 'text-white hover:text-[#6dbeb0] font-semibold',
      mobileButton: 'text-white hover:bg-white/10 drop-shadow-xl backdrop-blur-sm',
      mobileLinks: 'text-white hover:bg-white/10 hover:text-[#6dbeb0] backdrop-blur-sm font-medium',
      mobileBorder: 'border-white/20',
      dropdown: isDarkSection 
        ? 'bg-black/20 backdrop-blur-3xl border border-white/25 shadow-2xl shadow-black/30 text-white'
        : 'bg-black/20 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-black/30 text-white',
      dropdownItem: 'text-white hover:text-[#6dbeb0] hover:bg-white/15 hover:shadow-lg backdrop-blur-sm font-medium'
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
      <div className={`${styles.navBg} rounded-3xl px-4 md:px-6 py-4 transition-all duration-500 ring-1 ring-white/10`}>
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
              <h1 className={`text-lg font-bold ${styles.logoText} transition-all duration-500`}
                  style={{ 
                    textShadow: '0 0 12px rgba(184, 184, 184, 0.9), 0 3px 8px rgba(123, 123, 123, 1), 0 0 25px rgba(76, 75, 75, 0.7)',
                    filter: 'contrast(1.3) brightness(1.2)'
                  }}>
                SLK Trading
              </h1>
              <p className={`text-xs ${styles.logoSubtext} transition-all duration-500`}
                 style={{ 
                   textShadow: '0 0 10px rgba(97, 95, 95, 0.8), 0 2px 6px rgba(92, 90, 90, 0.9)',
                   filter: 'contrast(1.2) brightness(1.1)'
                 }}>
                & Design Construction
              </p>
            </div> 
          </div>

          {/* Desktop Navigation */}
         <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <div 
                key={item.key} 
                className="relative group" 
                data-products-dropdown={item.hasDropdown ? true : undefined}
                onMouseEnter={() => item.hasDropdown && setIsProductsDropdownOpen(true)}
                onMouseLeave={() => item.hasDropdown && setIsProductsDropdownOpen(false)}
              >
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => handleNavigation(item.path, item.sectionId)}
                      className={`${styles.navLinks} transition-all duration-500 hover:scale-105 relative text-base flex items-center`}
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                      {isActiveNavItem(item) && (
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#6dbeb0] rounded-full"></div>
                      )}
                    </button>
                    
                    {/* Hover Dropdown Menu */}
                    {isProductsDropdownOpen && (
                      <div className={`absolute top-full left-0 mt-1 w-72 ${styles.dropdown} rounded-3xl shadow-2xl py-4 z-50 transform transition-all duration-300 opacity-100 scale-100 ring-1 ring-white/10`}>
                        {/* Invisible bridge to prevent gap */}
                        <div className="absolute -top-1 left-0 right-0 h-1 bg-transparent"></div>
                        
                        {/* Glassmorphism overlay for extra depth */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                        
                        {/* Luxury header */}
                        <div className="relative px-6 pb-3 mb-3 border-b border-white/10">
                          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider text-white/80">Product Categories</p>
                          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        </div>
                        
                        {item.subItems?.map((subItem, index) => (
                          <button
                            key={subItem.key}
                            onClick={() => handleNavigation(subItem.path)}
                            className={`group relative block w-full text-left px-6 py-4 mx-2 rounded-2xl ${styles.dropdownItem} transition-all duration-300 text-sm font-medium transform hover:scale-[1.02] hover:-translate-y-0.5 border border-transparent hover:border-white/20`}
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: isProductsDropdownOpen ? 'fadeInSlideUp 0.3s ease-out forwards' : 'none'
                            }}
                          >
                            <div className="flex items-center justify-between relative z-10">
                              <span className="relative">{subItem.name}</span>
                              <div className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/80 transition-all duration-300 group-hover:scale-125"></div>
                            </div>
                            {/* Glassmorphism hover effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"></div>
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 rounded-2xl shadow-lg shadow-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </button>
                        ))}
                        
                        {/* Luxury footer accent with glassmorphism */}
                        <div className="relative mt-3 px-6">
                          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-px bg-white/40 blur-sm"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.path, item.sectionId)}
                    className={`${styles.navLinks} transition-all duration-500 hover:scale-105 relative text-base`}
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {isActiveNavItem(item) && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#6dbeb0] rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
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
          <div className={`lg:hidden mt-4 pt-4 border-t border-white/20 transition-all duration-500 animate-fade-in max-h-[80vh] overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/5 ring-1 ring-white/10`}>
            <div className="space-y-3 px-1">
              {navItems.map((item) => (
                <div key={item.key}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => handleNavigation(item.path, item.sectionId)}
                        className={`flex items-center justify-between w-full text-left py-2 px-3 rounded-lg font-medium ${styles.mobileLinks} transition-all duration-500 relative`}
                      >
                        {item.name}
                        {isActiveNavItem(item) && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6dbeb0] rounded-r-full"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                        className={`flex items-center justify-center w-full text-center py-1 px-3 rounded-lg text-sm ${styles.mobileLinks} transition-all duration-500 opacity-75 mt-1`}
                      >
                        <span className="mr-1">Sub Categories</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {/* Mobile Dropdown */}
                      {isProductsDropdownOpen && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.subItems?.map((subItem) => (
                            <button
                              key={subItem.key}
                              onClick={() => handleNavigation(subItem.path)}
                              className={`block w-full text-left py-2 px-3 rounded-lg text-sm ${styles.mobileLinks} transition-all duration-500 opacity-90`}
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.path, item.sectionId)}
                      className={`block w-full text-left py-2 px-3 rounded-lg font-medium ${styles.mobileLinks} transition-all duration-500 relative`}
                    >
                      {item.name}
                      {isActiveNavItem(item) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6dbeb0] rounded-r-full"></div>
                      )}
                    </button>
                  )}
                </div>
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
