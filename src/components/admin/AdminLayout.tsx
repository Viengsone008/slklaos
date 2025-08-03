"use client";
import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { LogOut, FileText, Settings, BarChart3, Users, Home, Database, Shield, Building2, Package, Clock, CheckCircle, TrendingUp, Calendar, PieChart, Menu, X, Power, Mail, MessageSquare, FilePlus, Briefcase } from 'lucide-react'; 

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const router = useRouter();
  const { user, logout, logoutAllUsers } = useAuth();
  const { settings, formatTime } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if device is mobile (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      // Auto-close mobile menu when switching to desktop
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isClient]);

  // Apply settings on mount and when they change (client-side only)
  useEffect(() => {
    if (!isClient) return;

    // Apply sidebar collapsed state (only for desktop)
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar && !isMobile) {
      if (settings.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
      } else {
        sidebar.classList.remove('collapsed');
      }
    }

    // Apply animations setting
    const root = document.documentElement;
    if (!settings.showAnimations) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Update document title with site name
    document.title = `${settings.siteName} - ${user?.loginType?.toUpperCase()} Panel`;
  }, [settings, user, isMobile, isClient]);

  // Close mobile menu when clicking outside (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileMenuOpen) {
        const sidebar = document.querySelector('[data-sidebar]');
        const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            mobileMenuButton && !mobileMenuButton.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileMenuOpen, isClient]);

  // Get menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
    ];

    switch (user?.loginType) {
      case 'admin':
        return [
          ...baseItems,
          { id: 'database', label: 'Database', icon: Database },
          { id: 'projects', label: 'Projects', icon: Building2 },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'quotes', label: 'Quotations', icon: FilePlus },
          { id: 'contacts', label: 'Contacts', icon: MessageSquare },
          { id: 'subscribers', label: 'Subscribers', icon: Mail },
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'careers', label: 'Careers', icon: Briefcase },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'budget', label: 'Budgets', icon: PieChart },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'employee':
        return [
          ...baseItems,
          { id: 'database', label: 'Database', icon: Database },
          { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
          { id: 'projects', label: 'Projects', icon: Building2 },
          { id: 'timesheet', label: 'Timesheet', icon: Clock },
          { id: 'materials', label: 'Materials', icon: Package }
        ];
      case 'manager':
        return [
          ...baseItems,
          { id: 'database', label: 'Database', icon: Database },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'projects', label: 'Projects', icon: Building2 },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'budget', label: 'Budget', icon: PieChart },
          { id: 'planning', label: 'Planning', icon: Calendar }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  // Logo click handler to navigate to home using Next.js router
  const handleLogoClick = () => {
    console.log('🏠 Logo clicked - navigating to home...');
    router.push('/');
  };

  // Handle menu item click
  const handleMenuItemClick = (pageId: string) => {
    onPageChange(pageId);
    // Close mobile menu after selection
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle logout all users
  const handleLogoutAllUsers = () => {
    if (!showLogoutAllConfirm) {
      setShowLogoutAllConfirm(true);
      return;
    }

    console.log('🚪🌍 Admin initiated global logout for all users');
    logoutAllUsers();
    setShowLogoutAllConfirm(false);
  };

  // Auto-logout functionality based on settings (client-side only)
  useEffect(() => {
    if (!isClient || !settings.autoLogoutInactive || !user) return;

    const timeoutDuration = settings.sessionTimeout * 60 * 60 * 1000; // Convert hours to milliseconds
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('🔒 Auto-logout triggered due to inactivity');
        logout();
      }, timeoutDuration);
    };

    // Events that reset the inactivity timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [settings.autoLogoutInactive, settings.sessionTimeout, user, logout, isClient]);

  // Get role-specific styling
  const getRoleStyles = () => {
    switch (user?.loginType) {
      case 'admin':
        return {
          headerBg: 'from-orange-500 to-red-500',
          accentColor: 'text-orange-600',
          borderColor: 'border-orange-500'
        };
      case 'employee':
        return {
          headerBg: 'from-blue-500 to-indigo-500',
          accentColor: 'text-blue-600',
          borderColor: 'border-blue-500'
        };
      case 'manager':
        return {
          headerBg: 'from-green-500 to-emerald-500',
          accentColor: 'text-green-600',
          borderColor: 'border-green-500'
        };
      default:
        return {
          headerBg: 'from-gray-500 to-gray-600',
          accentColor: 'text-gray-600',
          borderColor: 'border-gray-500'
        };
    }
  };

  const roleStyles = getRoleStyles();

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center">
            <button
              data-mobile-menu-button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-3"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
              <img 
                src="/SLK-logo.png" 
                alt="SLK Trading Logo"
                className="w-8 h-8 object-contain mr-2"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">SLK Trading</h1>
              </div>
            </div>
          </div>
          
          {/* Mobile User Info */}
          <div className="flex items-center space-x-2">
            <div className={`bg-gradient-to-r ${roleStyles.headerBg} text-white px-2 py-1 rounded text-xs font-semibold`}>
              {user?.loginType?.toUpperCase()}
            </div>
            {user?.loginType === 'admin' && (
              <button
                onClick={handleLogoutAllUsers}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout All Users"
              >
                <Power className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        data-sidebar
        className={`fixed inset-y-0 left-0 bg-white shadow-lg z-40 transition-all duration-300 ${
          isMobile 
            ? `w-80 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : `w-64 ${settings.sidebarCollapsed ? 'collapsed' : ''}`
        }`}
      >
        {/* Desktop Logo Section */}
        {!isMobile && (
          <div className="border-b border-gray-200 p-6">
            <div 
              onClick={handleLogoClick}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 -m-3 group"
            >
              <div className="mr-3">
                <img 
                  src="/SLK-logo.png" 
                  alt="SLK Trading & Design Construction Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 
                  className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200"
                  style={{ color: settings.primaryColor }}
                >
                  {settings.siteName.split(' ')[0]} {settings.siteName.split(' ')[1]}
                </h1>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                  & Design Construction
                </p>
              </div>
            </div>
            
            {/* User Role Badge */}
            <div className="mt-4">
              <div className={`bg-gradient-to-r ${roleStyles.headerBg} text-white px-3 py-2 rounded-lg text-center`}>
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {user?.loginType?.toUpperCase()} PANEL
                  </span>
                </div>
                {user?.department && (
                  <div className="text-xs opacity-90 mt-1">
                    {user.department} Department
                  </div>
                )}
              </div>
            </div>
            
            {/* Go to Website Button */}
            <div className="mt-4">
              <button
                onClick={handleLogoClick}
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-orange-200"
                style={{ 
                  '--hover-color': settings.primaryColor,
                  '--hover-bg': `${settings.primaryColor}10`
                } as React.CSSProperties}
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Website
              </button>
            </div>
          </div>
        )}

        {/* Mobile Header in Sidebar */}
        {isMobile && (
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img 
                  src="/SLK-logo.png" 
                  alt="SLK Trading Logo"
                  className="w-10 h-10 object-contain mr-3"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SLK Trading</h1>
                  <p className="text-xs text-gray-600">& Design Construction</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile User Role Badge */}
            <div className={`bg-gradient-to-r ${roleStyles.headerBg} text-white px-3 py-2 rounded-lg text-center mb-3`}>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {user?.loginType?.toUpperCase()} PANEL
                </span>
              </div>
              {user?.department && (
                <div className="text-xs opacity-90 mt-1">
                  {user.department} Department
                </div>
              )}
            </div>

            {/* Mobile Go to Website Button */}
            <button
              onClick={handleLogoClick}
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200 border border-gray-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Website
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={`${isMobile ? 'mt-2' : 'mt-6'} flex-1 overflow-y-auto`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                  currentPage === item.id
                    ? `${roleStyles.accentColor} ${roleStyles.borderColor} border-r-2`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={currentPage === item.id ? {
                  backgroundColor: `${settings.primaryColor}10`,
                  color: settings.primaryColor,
                  borderRightColor: settings.primaryColor
                } : {}}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              {user?.position && (
                <p className="text-xs text-gray-500 truncate">{user.position}</p>
              )}
              {settings.autoLogoutInactive && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-logout: {settings.sessionTimeout}h
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-2">
              {/* Admin-only: Logout All Users Button */}
              {user?.loginType === 'admin' && (
                <button
                  onClick={handleLogoutAllUsers}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    showLogoutAllConfirm 
                      ? 'text-red-600 bg-red-50 border border-red-200' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={showLogoutAllConfirm ? "Click again to confirm global logout" : "Logout All Users (Global)"}
                >
                  <Power className="w-5 h-5" />
                </button>
              )}
              
              {/* Regular Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Logout All Confirmation */}
          {showLogoutAllConfirm && user?.loginType === 'admin' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800 font-medium mb-2">
                ⚠️ GLOBAL LOGOUT CONFIRMATION
              </p>
              <p className="text-xs text-red-700 mb-3">
                This will immediately log out ALL users from ALL devices (phones, laptops, tablets) and sessions. This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleLogoutAllUsers}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                >
                  Confirm Global Logout
                </button>
                <button
                  onClick={() => setShowLogoutAllConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? 'lg:ml-64' : 'ml-64'} transition-all duration-300`}>
        <div className={`p-4 ${isMobile ? 'pt-2' : 'p-8'}`}>
          {children}
        </div>
      </div>

      {/* Custom CSS for settings integration */}
      <style jsx>{`
        [data-sidebar].collapsed {
          transform: translateX(-100%);
        }
        
        .transition-all {
          transition-duration: ${settings.showAnimations ? '300ms' : '0ms'};
        }

        @media (max-width: 1023px) {
          [data-sidebar] {
            transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
          
          .ml-64 {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;