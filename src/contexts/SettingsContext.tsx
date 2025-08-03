"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsData {
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  enableTwoFactor: boolean;
  autoLogoutInactive: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewPosts: boolean;
  notifyUserRegistration: boolean;
  notifySystemUpdates: boolean;
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  sidebarCollapsed: boolean;
  showAnimations: boolean;
  
  // Content Settings
  postsPerPage: number;
  allowComments: boolean;
  moderateComments: boolean;
  defaultPostStatus: 'draft' | 'published';
  autoSaveInterval: number;
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetention: number;
  
  // Performance Settings
  enableCaching: boolean;
  cacheExpiration: number;
  optimizeImages: boolean;
  lazyLoading: boolean;
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (settingsData: Partial<SettingsData>) => void;
  applyTheme: () => void;
  formatDate: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  isLoaded: boolean;
}

const defaultSettings: SettingsData = {
  // General Settings
  siteName: 'SLK Trading & Design Construction',
  siteDescription: 'Leading construction company in Laos offering design construction, waterproofing materials, and flooring materials.',
  siteUrl: 'https://slktrading.la',
  adminEmail: 'admin@slklaos.la',
  timezone: 'Asia/Vientiane',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12',
  
  // Company Information
  companyName: 'SLK Trading & Design Construction Co., Ltd',
  companyAddress: 'Vientiane Capital, Laos',
  companyPhone: '+856 21 123 456',
  companyEmail: 'info@slktrading.la',
  companyWebsite: 'https://slktrading.la',
  
  // Security Settings
  sessionTimeout: 24,
  maxLoginAttempts: 5,
  passwordMinLength: 6,
  requireStrongPassword: true,
  enableTwoFactor: false,
  autoLogoutInactive: true,
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: false,
  notifyNewPosts: true,
  notifyUserRegistration: true,
  notifySystemUpdates: true,
  
  // Appearance Settings
  theme: 'light',
  primaryColor: '#f97316',
  secondaryColor: '#3b82f6',
  sidebarCollapsed: false,
  showAnimations: true,
  
  // Content Settings
  postsPerPage: 10,
  allowComments: false,
  moderateComments: true,
  defaultPostStatus: 'draft',
  autoSaveInterval: 30,
  
  // Backup Settings
  autoBackup: true,
  backupFrequency: 'weekly',
  backupRetention: 30,
  
  // Performance Settings
  enableCaching: true,
  cacheExpiration: 3600,
  optimizeImages: true,
  lazyLoading: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load settings on client-side only
  useEffect(() => {
    if (!isClient) return;
    
    loadSettings();
  }, [isClient]);

  // Apply settings when they change (client-side only)
  useEffect(() => {
    if (!isClient || !isLoaded) return;
    
    applyTheme();
    applyPrimaryColor();
    updateDocumentTitle();
    setupAutoLogout();
  }, [settings, isClient, isLoaded]);

  const loadSettings = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSettings = localStorage.getItem('slk_admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    if (typeof window === 'undefined') return;
    
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem('slk_admin_settings', JSON.stringify(updatedSettings));
      
      // Trigger notifications if enabled
      if (settings.emailNotifications && settings.notifySystemUpdates) {
        console.log('📧 Settings updated - notification would be sent if email service was configured');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = () => {
    if (typeof window === 'undefined') return;
    
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('slk_admin_settings');
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const exportSettings = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slk-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
    }
  };

  const importSettings = (settingsData: Partial<SettingsData>) => {
    updateSettings(settingsData);
  };

  const applyTheme = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    try {
      const root = document.documentElement;
      
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else if (settings.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }

      // Apply animations setting
      if (!settings.showAnimations) {
        root.style.setProperty('--animation-duration', '0s');
        root.style.setProperty('--transition-duration', '0s');
      } else {
        root.style.removeProperty('--animation-duration');
        root.style.removeProperty('--transition-duration');
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  const applyPrimaryColor = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    try {
      const root = document.documentElement;
      
      // Convert hex to RGB for CSS custom properties
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      const primaryRgb = hexToRgb(settings.primaryColor);
      const secondaryRgb = hexToRgb(settings.secondaryColor);

      if (primaryRgb) {
        root.style.setProperty('--color-primary', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        root.style.setProperty('--color-primary-hex', settings.primaryColor);
      }

      if (secondaryRgb) {
        root.style.setProperty('--color-secondary', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
        root.style.setProperty('--color-secondary-hex', settings.secondaryColor);
      }
    } catch (error) {
      console.error('Error applying primary color:', error);
    }
  };

  const updateDocumentTitle = () => {
    if (typeof document === 'undefined') return;
    
    try {
      document.title = `${settings.siteName} - Admin Panel`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.siteDescription);
      }
    } catch (error) {
      console.error('Error updating document title:', error);
    }
  };

  const setupAutoLogout = () => {
    if (typeof window === 'undefined' || !settings.autoLogoutInactive) return;
    
    try {
      const timeoutDuration = settings.sessionTimeout * 60 * 60 * 1000; // Convert hours to milliseconds
      
      // Clear existing timeout
      const existingTimeout = localStorage.getItem('slk_auto_logout_timeout');
      if (existingTimeout) {
        clearTimeout(parseInt(existingTimeout));
      }

      // Set new timeout
      const timeoutId = setTimeout(() => {
        console.log('🔒 Auto-logout triggered due to inactivity');
        try {
          localStorage.removeItem('admin_user');
          localStorage.removeItem('slk_extended_session');
          localStorage.removeItem('slk_login_time');
          window.location.href = '/admin';
        } catch (error) {
          console.error('Error during auto-logout:', error);
        }
      }, timeoutDuration);

      localStorage.setItem('slk_auto_logout_timeout', timeoutId.toString());
    } catch (error) {
      console.error('Error setting up auto-logout:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check for invalid date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: settings.timezone,
      };

      switch (settings.dateFormat) {
        case 'MM/DD/YYYY':
          options.month = '2-digit';
          options.day = '2-digit';
          options.year = 'numeric';
          return dateObj.toLocaleDateString('en-US', options);
        case 'DD/MM/YYYY':
          options.day = '2-digit';
          options.month = '2-digit';
          options.year = 'numeric';
          return dateObj.toLocaleDateString('en-GB', options);
        case 'YYYY-MM-DD':
          return dateObj.toISOString().split('T')[0];
        default:
          return dateObj.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check for invalid date
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Time';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: settings.timezone,
        hour12: settings.timeFormat === '12',
        hour: '2-digit',
        minute: '2-digit',
      };

      return dateObj.toLocaleTimeString(undefined, options);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    applyTheme,
    formatDate,
    formatTime,
    isLoaded
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;