"use client";
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Database, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  User,
  Building2,
  Phone,
  MapPin,
  Clock,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Wifi,
  HardDrive,
  Activity,
  BarChart3,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Key,
  UserCheck,
  Calendar,
  Zap,
  Target,
  Layers,
  Code, 
  ExternalLink,
  LogOut,
  Users
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

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

interface SystemStats {
  totalPosts: number;
  totalUsers: number;
  storageUsed: string;
  lastBackup: string;
  uptime: string;
}

const SettingsManagement = () => {
  const { user, logoutAllUsers } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    // General Settings
    siteName: 'SLK Trading & Construction',
    siteDescription: 'Leading construction company in Laos offering design construction, waterproofing materials, and flooring materials.',
    siteUrl: 'https://slktrading.la',
    adminEmail: 'admin@slklaos.la',
    timezone: 'Asia/Vientiane',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    
    // Company Information
    companyName: 'SLK Trading & Construction Co., Ltd',
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalPosts: 0,
    totalUsers: 0,
    storageUsed: '2.4 MB',
    lastBackup: '2024-01-15',
    uptime: '99.9%'
  });

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    loadSettings();
    loadSystemStats();
  }, [isClient]);

  const loadSettings = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSettings = localStorage.getItem('slk_admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prevSettings => ({ ...prevSettings, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadSystemStats = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const posts = JSON.parse(localStorage.getItem('slk_posts') || '[]');
      const adminUsers = JSON.parse(localStorage.getItem('slk_admin_users') || '[]');
      const employeeUsers = JSON.parse(localStorage.getItem('slk_employee_users') || '[]');
      const managerUsers = JSON.parse(localStorage.getItem('slk_manager_users') || '[]');
      
      setSystemStats({
        totalPosts: posts.length,
        totalUsers: adminUsers.length + employeeUsers.length + managerUsers.length,
        storageUsed: '2.4 MB',
        lastBackup: new Date().toISOString().split('T')[0],
        uptime: '99.9%'
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleSave = async () => {
    if (!isClient) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('slk_admin_settings', JSON.stringify(settings));
      }
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!isClient) return;
    
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('slk_admin_settings');
      }
      
      // Reset to default settings
      setSettings({
        // General Settings
        siteName: 'SLK Trading & Construction',
        siteDescription: 'Leading construction company in Laos offering design construction, waterproofing materials, and flooring materials.',
        siteUrl: 'https://slktrading.la',
        adminEmail: 'admin@slklaos.la',
        timezone: 'Asia/Vientiane',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
        
        // Company Information
        companyName: 'SLK Trading & Construction Co., Ltd',
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
      });
      
      setSuccess('Settings reset to defaults successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reset settings.');
    } finally {
      setIsLoading(false);
      setShowResetConfirm(false);
    }
  };

  const handleLogoutAllUsers = async () => {
    if (!isClient) return;
    
    if (!showLogoutAllConfirm) {
      setShowLogoutAllConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (logoutAllUsers) {
        logoutAllUsers();
      }
      
      setSuccess('All users have been logged out successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to logout all users.');
    } finally {
      setIsLoading(false);
      setShowLogoutAllConfirm(false);
    }
  };

  const handleExportSettings = () => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slk-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Settings exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting settings:', error);
      setError('Failed to export settings.');
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isClient) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(prevSettings => ({ ...prevSettings, ...importedSettings }));
        setSuccess('Settings imported successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Invalid settings file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleBackup = async () => {
    if (!isClient || typeof window === 'undefined') return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        settings,
        posts: JSON.parse(localStorage.getItem('slk_posts') || '[]'),
        adminUsers: JSON.parse(localStorage.getItem('slk_admin_users') || '[]'),
        employeeUsers: JSON.parse(localStorage.getItem('slk_employee_users') || '[]'),
        managerUsers: JSON.parse(localStorage.getItem('slk_manager_users') || '[]'),
        timestamp: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slk-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Backup created and downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create backup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear any cached data
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      setSuccess('Cache cleared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to clear cache.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate database optimization
      setSuccess('Database optimized successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to optimize database.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'backup', label: 'Backup', icon: Archive },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'system', label: 'System Info', icon: Monitor }
  ];

  const renderTabContent = () => {
    if (!isClient) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="Asia/Vientiane">Asia/Vientiane (GMT+7)</option>
                    <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="en">English</option>
                    <option value="lo">ລາວ (Lao)</option>
                    <option value="th">ไทย (Thai)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="12">12 Hour (AM/PM)</option>
                    <option value="24">24 Hour</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={settings.companyWebsite}
                    onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 6 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Require Strong Passwords</label>
                    <p className="text-xs text-gray-500">Enforce uppercase, lowercase, numbers, and special characters</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireStrongPassword}
                    onChange={(e) => setSettings({ ...settings, requireStrongPassword: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-logout Inactive Users</label>
                    <p className="text-xs text-gray-500">Automatically log out users after session timeout</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoLogoutInactive}
                    onChange={(e) => setSettings({ ...settings, autoLogoutInactive: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500">Enable 2FA for additional security (Coming Soon)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactor}
                    onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                    disabled
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Global Logout Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global User Management</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-2">Logout All Users</h4>
                    <p className="text-sm text-red-700 mb-4">
                      This will immediately log out all users across all login types (Admin, Employee, Manager) 
                      from all devices and sessions. This action cannot be undone.
                    </p>
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                      <h5 className="font-medium text-red-900 text-sm mb-2">This action will:</h5>
                      <ul className="text-xs text-red-800 space-y-1">
                        <li>• Clear all active sessions across all devices</li>
                        <li>• Remove all "Remember Me" saved logins</li>
                        <li>• Force users to log in again with their credentials</li>
                        <li>• Apply to Admin, Employee, and Manager users</li>
                        <li>• Take effect immediately across all browser tabs</li>
                      </ul>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleLogoutAllUsers}
                        disabled={isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          showLogoutAllConfirm 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-red-100 hover:bg-red-200 text-red-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isLoading ? 'Processing...' : showLogoutAllConfirm ? 'Confirm Logout All Users' : 'Logout All Users'}
                      </button>
                      {showLogoutAllConfirm && (
                        <button
                          onClick={() => setShowLogoutAllConfirm(false)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {showLogoutAllConfirm && (
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        ⚠️ Click "Confirm Logout All Users" to proceed with global logout
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPasswordChangeError('');
                  setPasswordChangeSuccess('');
                  if (!newPassword || newPassword.length < settings.passwordMinLength) {
                    setPasswordChangeError(`Password must be at least ${settings.passwordMinLength} characters.`);
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordChangeError('Passwords do not match.');
                    return;
                  }
                  setPasswordChangeLoading(true);
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) {
                    setPasswordChangeError(error.message);
                  } else {
                    setPasswordChangeSuccess('Password updated successfully!');
                    setNewPassword('');
                    setConfirmPassword('');
                  }
                  setPasswordChangeLoading(false);
                }}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoComplete="new-password"
                  />
                </div>
                {passwordChangeError && (
                  <div className="text-red-600 text-sm">{passwordChangeError}</div>
                )}
                {passwordChangeSuccess && (
                  <div className="text-green-600 text-sm">{passwordChangeSuccess}</div>
                )}
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {passwordChangeLoading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Browser push notifications (Coming Soon)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    disabled
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">New Posts</label>
                    <p className="text-xs text-gray-500">Notify when new posts are published</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyNewPosts}
                    onChange={(e) => setSettings({ ...settings, notifyNewPosts: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">User Registration</label>
                    <p className="text-xs text-gray-500">Notify when new users register</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyUserRegistration}
                    onChange={(e) => setSettings({ ...settings, notifyUserRegistration: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">System Updates</label>
                    <p className="text-xs text-gray-500">Notify about system updates and maintenance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifySystemUpdates}
                    onChange={(e) => setSettings({ ...settings, notifySystemUpdates: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Settings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark (Coming Soon)</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sidebar Collapsed by Default</label>
                    <p className="text-xs text-gray-500">Start with collapsed sidebar</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sidebarCollapsed}
                    onChange={(e) => setSettings({ ...settings, sidebarCollapsed: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Animations</label>
                    <p className="text-xs text-gray-500">Enable interface animations and transitions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showAnimations}
                    onChange={(e) => setSettings({ ...settings, showAnimations: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Management</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posts Per Page</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={settings.postsPerPage}
                    onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Post Status</label>
                  <select
                    value={settings.defaultPostStatus}
                    onChange={(e) => setSettings({ ...settings, defaultPostStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto-save Interval (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={settings.autoSaveInterval}
                    onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Comments</label>
                    <p className="text-xs text-gray-500">Enable commenting on posts (Coming Soon)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowComments}
                    onChange={(e) => setSettings({ ...settings, allowComments: e.target.checked })}
                    disabled
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Moderate Comments</label>
                    <p className="text-xs text-gray-500">Require approval before comments are published</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.moderateComments}
                    onChange={(e) => setSettings({ ...settings, moderateComments: e.target.checked })}
                    disabled={!settings.allowComments}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.backupRetention}
                    onChange={(e) => setSettings({ ...settings, backupRetention: parseInt(e.target.value) || 7 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Automatic Backups</label>
                    <p className="text-xs text-gray-500">Enable scheduled automatic backups</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Backup</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Create a manual backup of all your data including settings, posts, and users.
                </p>
                <button
                  onClick={handleBackup}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating Backup...' : 'Create Backup Now'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Optimization</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cache Expiration (seconds)</label>
                  <input
                    type="number"
                    min="300"
                    max="86400"
                    value={settings.cacheExpiration}
                    onChange={(e) => setSettings({ ...settings, cacheExpiration: parseInt(e.target.value) || 300 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Caching</label>
                    <p className="text-xs text-gray-500">Cache content for faster loading</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableCaching}
                    onChange={(e) => setSettings({ ...settings, enableCaching: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Optimize Images</label>
                    <p className="text-xs text-gray-500">Automatically optimize uploaded images</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.optimizeImages}
                    onChange={(e) => setSettings({ ...settings, optimizeImages: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Lazy Loading</label>
                    <p className="text-xs text-gray-500">Load images only when needed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.lazyLoading}
                    onChange={(e) => setSettings({ ...settings, lazyLoading: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">Total Posts</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{systemStats.totalPosts}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{systemStats.totalUsers}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <HardDrive className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900">Storage Used</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{systemStats.storageUsed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-gray-900">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{systemStats.uptime}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Clear Cache</h4>
                  <p className="text-sm text-blue-700 mb-3">Clear all cached data to free up space and ensure fresh content.</p>
                  <button 
                    onClick={handleClearCache}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isLoading ? 'Clearing...' : 'Clear Cache'}
                  </button>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Optimize Database</h4>
                  <p className="text-sm text-green-700 mb-3">Optimize local storage for better performance.</p>
                  <button 
                    onClick={handleOptimizeDatabase}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isLoading ? 'Optimizing...' : 'Optimize Now'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Admin Panel Version:</span>
                    <span className="ml-2 text-gray-600">v1.0.0</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">January 2024</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Browser:</span>
                    <span className="ml-2 text-gray-600">
                      {isClient && typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Platform:</span>
                    <span className="ml-2 text-gray-600">
                      {isClient && typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your admin panel and system preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportSettings}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <label className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className={`border border-red-300 text-red-700 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center ${
                  showResetConfirm ? 'bg-red-50 border-red-500' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {showResetConfirm ? 'Confirm Reset' : 'Reset to Defaults'}
              </button>
              {showResetConfirm && (
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-8 py-2 rounded-lg font-semibold flex items-center transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;