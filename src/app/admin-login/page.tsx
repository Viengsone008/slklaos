"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, User, Shield, Users, Crown, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

type LoginType = 'admin' | 'employee' | 'manager';

interface LoginBoxData {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  isLoading: boolean;
  error: string;
}

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  
  const [activeLoginType, setActiveLoginType] = useState<LoginType | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [loginData, setLoginData] = useState<Record<LoginType, LoginBoxData>>({
    admin: {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      error: ''
    },
    employee: {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      error: ''
    },
    manager: {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      error: ''
    }
  });

  // Check if user is already authenticated and redirect
  useEffect(() => {
    console.log('🔍 Checking authentication status:', { isAuthenticated, user });
    
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting...', user);
      
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          console.log('🚀 Redirecting admin to dashboard...');
          router.push('/admin-dashboard');
          break;
        case 'employee':
          console.log('🚀 Redirecting employee to dashboard...');
          router.push('/employee-dashboard');
          break;
        case 'manager':
          console.log('🚀 Redirecting manager to dashboard...');
          router.push('/manager-dashboard');
          break;
        default:
          console.log('🚀 Redirecting to default dashboard...');
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Check for password reset redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetParam = urlParams.get('reset');
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (resetParam === 'true') {
      // User came back from password reset email link
      if (errorParam) {
        console.error('❌ Password reset error:', errorParam, errorDescription);
        setForgotPasswordError(
          errorDescription || 'Password reset failed. The link may have expired or is invalid.'
        );
        setShowForgotPasswordModal(true);
      } else {
        // Show success message or redirect to password update form
        console.log('✅ Password reset link verified, user can now update password');
      }
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('slk_saved_login');
    if (savedCredentials) {
      try {
        const { email: savedEmail, rememberMe: savedRememberMe, loginType } = JSON.parse(savedCredentials);
        if (loginType && loginData[loginType as LoginType]) {
          setLoginData(prev => ({
            ...prev,
            [loginType]: {
              ...prev[loginType as LoginType],
              email: savedEmail,
              rememberMe: savedRememberMe
            }
          }));
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }, []);

  // Logo click handler to navigate to home
  const handleLogoClick = () => {
    console.log('🏠 Logo clicked - navigating to home...');
    router.push('/');
  };

  const handleLoginTypeSelect = (type: LoginType) => {
    setActiveLoginType(type);
    // Clear any existing errors when switching
    setLoginData(prev => ({
      ...prev,
      [type]: { ...prev[type], error: '' }
    }));
  };

  const handleBackToSelection = () => {
    setActiveLoginType(null);
    // Clear all errors when going back
    setLoginData(prev => ({
      admin: { ...prev.admin, error: '', isLoading: false },
      employee: { ...prev.employee, error: '', isLoading: false },
      manager: { ...prev.manager, error: '', isLoading: false }
    }));
  };

  const handleInputChange = (type: LoginType, field: keyof LoginBoxData, value: any) => {
    setLoginData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
        ...(field !== 'error' && { error: '' }) // Clear error when user types
      }
    }));
  };

  const handleSubmit = async (type: LoginType, e: React.FormEvent) => {
    e.preventDefault();
    const data = loginData[type];
    
    console.log('🔐 Starting login process for:', type, { email: data.email });
    
    setLoginData(prev => ({
      ...prev,
      [type]: { ...prev[type], isLoading: true, error: '' }
    }));

    try {
      // Attempt to login
      console.log('📡 Calling login function...');
      const success = await login(data.email, data.password, type);
      
      console.log('🔍 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful! Handling post-login logic...');
        
        // Handle Remember Me functionality
        if (data.rememberMe) {
          const credentialsToSave = {
            email: data.email.trim(),
            rememberMe: true,
            loginType: type
          };
          localStorage.setItem('slk_saved_login', JSON.stringify(credentialsToSave));
          
          // Set longer session duration
          const extendedSession = {
            timestamp: Date.now(),
            duration: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
          };
          localStorage.setItem('slk_extended_session', JSON.stringify(extendedSession));
        } else {
          localStorage.removeItem('slk_saved_login');
          localStorage.removeItem('slk_extended_session');
        }
        
        // Manual redirect with delay to show loading animation
        console.log('🚀 Setting up manual redirect...');
        setTimeout(() => {
          console.log('🎯 Executing manual redirect for:', type);
          
          try {
            switch (type) {
              case 'admin':
                console.log('🔥 Redirecting admin to dashboard...');
                router.push('/admin-dashboard');
                break;
              case 'employee':
                console.log('🔥 Redirecting employee to dashboard...');
                router.push('/employee-dashboard');
                break;
              case 'manager':
                console.log('🔥 Redirecting manager to dashboard...');
                router.push('/manager-dashboard');
                break;
              default:
                console.log('🔥 Redirecting to default dashboard...');
                router.push('/dashboard');
            }
          } catch (routerError) {
            console.error('❌ Router push failed, using window.location:', routerError);
            // Fallback navigation
            const fallbackUrls = {
              admin: '/admin-dashboard',
              employee: '/employee-dashboard',
              manager: '/manager-dashboard'
            };
            window.location.href = fallbackUrls[type] || '/dashboard';
          }
        }, 2000); // 2 second delay to show loading animation
        
      } else {
        console.log('❌ Login failed - invalid credentials');
        setLoginData(prev => ({
          ...prev,
          [type]: { 
            ...prev[type], 
            error: 'Invalid email or password. Please check your credentials.', 
            isLoading: false 
          }
        }));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setLoginData(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          error: 'Login failed. Please try again.', 
          isLoading: false 
        }
      }));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordMessage('');

    try {
      console.log('� Checking if email exists in system:', forgotPasswordEmail);
      
      // First, check if the email exists in the system by querying the users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, created_at, role')
        .eq('email', forgotPasswordEmail.toLowerCase().trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking user existence:', checkError);
        setForgotPasswordError('An error occurred while sending the reset email. Please try again.');
        return;
      }

      // If no user found
      if (!existingUser) {
        console.log('❌ Email not found in system:', forgotPasswordEmail);
        setForgotPasswordError(
          'This email address is not registered in our system. Please check your email or contact an administrator to create an account.'
        );
        return;
      }

      console.log('✅ Email found in system:', {
        email: existingUser.email,
        role: existingUser.role,
        confirmed: !!existingUser.created_at
      });

      // Check if email is confirmed
      if (!existingUser.created_at) {
        console.log('⚠️ Email not confirmed:', forgotPasswordEmail);
        setForgotPasswordError(
          'Your email address has not been verified yet. Please check your inbox for the verification email first, or contact an administrator for assistance.'
        );
        return;
      }

      console.log('�📧 Sending password reset email to verified user:', forgotPasswordEmail);
      
      // Use Supabase Auth to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/admin-login?reset=true`,
      });

      if (error) {
        console.error('❌ Supabase password reset error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          setForgotPasswordError('Please verify your email address first before requesting a password reset.');
        } else if (error.message.includes('Too many requests')) {
          setForgotPasswordError('Too many reset requests. Please wait a few minutes before trying again.');
        } else {
          setForgotPasswordError('Failed to send password reset email. Please try again or contact support.');
        }
        return;
      }
      
      // Success message
      setForgotPasswordMessage(
        `Password reset instructions have been sent to ${forgotPasswordEmail}. Please check your email and follow the instructions to reset your password. The link will expire in 1 hour.`
      );
      
      // Clear the email field and close modal after successful submission
      setTimeout(() => {
        setForgotPasswordEmail('');
        setShowForgotPasswordModal(false);
        setForgotPasswordMessage('');
      }, 6000); // Increased timeout to give user time to read the message
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setForgotPasswordError('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordMessage('');
  };

  const loginTypes = [
    {
      type: 'admin' as LoginType,
      title: 'Admin Login',
      subtitle: 'System administration access',
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500',
      description: 'Complete control over website content, user management, and system settings',
      features: ['Full Admin Access', 'User Management', 'System Settings', 'Content Control'],
      sampleCredentials: [
        { email: 'admin@slklaos.la', password: 'admin123', name: 'System Admin' },
        { email: 'webmaster@slklaos.la', password: 'web123', name: 'Website Manager' }
      ]
    },
    {
      type: 'employee' as LoginType,
      title: 'Employees Login',
      subtitle: 'Staff and team member access',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-500',
      description: 'Access to assigned tasks, project updates, and team collaboration tools',
      features: ['Task Management', 'Project Updates', 'Team Chat', 'Time Tracking'],
      sampleCredentials: [
        { email: 'john.doe@slklaos.la', password: 'emp123', name: 'John Doe (Engineer)' },
        { email: 'jane.smith@slklaos.la', password: 'emp456', name: 'Jane Smith (Inventory)' },
        { email: 'mike.johnson@slklaos.la', password: 'emp789', name: 'Mike Johnson (Designer)' }
      ]
    },
    {
      type: 'manager' as LoginType,
      title: 'Managers Login',
      subtitle: 'Department and project management',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500',
      description: 'Oversight of projects, team management, and departmental operations',
      features: ['Project Oversight', 'Team Management', 'Reports & Analytics', 'Resource Planning'],
      sampleCredentials: [
        { email: 'sarah.wilson@slklaos.la', password: 'mgr123', name: 'Sarah Wilson (Construction)' },
        { email: 'david.chen@slklaos.la', password: 'mgr456', name: 'David Chen (Operations)' },
        { email: 'lisa.brown@slklaos.la', password: 'mgr789', name: 'Lisa Brown (Sales)' }
      ]
    }
  ];

  // Show loading overlay for active login type
  const activeData = activeLoginType ? loginData[activeLoginType] : null;
  const showLoadingOverlay = activeData?.isLoading;

  return (
    <div className="min-h-screen overflow-hidden background-3d-container">
      {/* Hero-Matching Background with Construction Theme */}
      <div className="absolute inset-0 background-3d-layer">
        <img 
          src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Modern house construction and design background"
          className="w-full h-full object-cover animate-background-zoom gpu-accelerated"
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
        {[...Array(20)].map((_, i) => (
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

      {/* Enhanced Loading Overlay - Hero Theme */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 z-50 overflow-hidden background-3d-container">
          {/* Same background as hero */}
          <div className="absolute inset-0 background-3d-layer">
            <img 
              src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" 
              alt="Construction background"
              className="w-full h-full object-cover animate-background-zoom gpu-accelerated"
            />
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-orange-900/30 animate-background-pulse"></div>
          </div>

          {/* Floating particles */}
          <div className="particles-container">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="particle animate-particle-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 3}s`,
                  background: `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
            <div className="glass-morphism border border-white/20 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-glow-white">
              {/* Enhanced Loading Animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-white/30 border-t-orange-400 rounded-full animate-spin mx-auto" style={{ animationDuration: '0.8s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-2 border-white/20 border-b-orange-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass-morphism p-3 rounded-xl border border-white/30">
                    <img 
                      src="/SLK-logo.png" 
                      alt="SLK Logo"
                      className="w-12 h-12 object-contain animate-pulse"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Loading Text */}
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-2xl">Signing In...</h3>
              <p className="text-white/90 mb-2 text-lg drop-shadow-lg">Authenticating your credentials</p>
              <p className="text-white/70 text-sm mb-8 drop-shadow-md">Preparing your dashboard experience</p>

              {/* Progress Indicators */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3 text-white/80">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-glow"></div>
                  <span className="text-sm drop-shadow-md">Verifying credentials...</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/80">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-glow" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm drop-shadow-md">Loading user permissions...</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/80">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-glow" style={{ animationDelay: '1s' }}></div>
                  <span className="text-sm drop-shadow-md">Preparing {activeLoginType} dashboard...</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/80">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-glow" style={{ animationDelay: '1.5s' }}></div>
                  <span className="text-sm drop-shadow-md">Finalizing setup...</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="w-full glass-morphism-dark rounded-full h-4 overflow-hidden border border-white/30">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-300 relative shadow-glow"
                    style={{ 
                      width: '100%',
                      animation: 'loading-progress 2s ease-in-out forwards'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-black/30 rounded-lg p-4 text-xs text-white/70 mb-4">
                <p>Login Type: {activeLoginType}</p>
                <p>Status: Processing authentication...</p>
                <p>Redirect: Will redirect to /{activeLoginType}-dashboard</p>
              </div>

              {/* Security Notice */}
              <div className="glass-morphism px-6 py-4 rounded-xl border border-white/20 text-xs text-white/70">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">Secure authentication in progress</span>
                </div>
                {activeData?.rememberMe && (
                  <div className="flex items-center justify-center space-x-2">
                    <User className="w-3 h-3 text-blue-400" />
                    <span>Saving login preferences</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="absolute inset-0 z-50 overflow-hidden background-3d-container">
          {/* Background with blur effect */}
          <div className="absolute inset-0 background-3d-layer">
            <img 
              src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" 
              alt="Construction background"
              className="w-full h-full object-cover animate-background-zoom gpu-accelerated filter blur-sm"
            />
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          </div>

          {/* Modal Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
            <div className="glass-morphism border border-white/20 rounded-2xl p-8 text-center max-w-md mx-auto shadow-glow-white animate-modal-slide-in">
              {/* Close Button */}
              <button
                onClick={closeForgotPasswordModal}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                disabled={forgotPasswordLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  Forgot Password?
                </h2>
                <p className="text-white/80 text-sm drop-shadow-md">
                  Enter your email address and we'll send you a secure link to reset your password. The link will expire in 1 hour for security.
                </p>
              </div>

              {/* Success Message */}
              {forgotPasswordMessage && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg text-sm mb-6 animate-fade-in">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="whitespace-pre-line text-left">{forgotPasswordMessage}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {forgotPasswordError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 animate-shake">
                  {forgotPasswordError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-2 text-sm drop-shadow-md text-left">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      disabled={forgotPasswordLoading}
                      className="w-full pl-11 pr-4 py-3 glass-morphism border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    disabled={forgotPasswordLoading}
                    className="flex-1 glass-morphism hover:bg-white/20 text-white py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 bg-orange-500 hover:opacity-90 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow disabled:transform-none disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {forgotPasswordLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-white/60 text-xs mb-3">
                  <p className="mb-2">
                    🔒 Secure password reset powered by Supabase Auth
                  </p>
                  <p className="mb-2">
                    📧 Check your spam folder if you don't receive the email
                  </p>
                  <p>
                    ⏰ Reset links expire in 1 hour for security
                  </p>
                </div>
                <p className="text-white/60 text-xs">
                  Remember your password?{' '}
                  <button
                    onClick={closeForgotPasswordModal}
                    className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                    disabled={forgotPasswordLoading}
                  >
                    Back to Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto min-h-screen flex flex-col">
        {/* Logo Section */}
        <div className="text-center pt-6 pb-8">
          <div 
            onClick={handleLogoClick}
            className="flex items-center justify-center mb-4 cursor-pointer group"
          >
            <div className="glass-morphism p-3 rounded-xl border border-white/20 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300 shadow-glow-white">
              <img 
                src="/SLK-logo.png" 
                alt="SLK Trading & Design Construction Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer group"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300 drop-shadow-2xl">
              SLK Trading & Design Construction
            </h1>
            <p className="text-blue-200 group-hover:text-blue-100 transition-colors duration-300 text-base drop-shadow-lg">
              Leading Construction Company in Laos
            </p>
            <div className="inline-flex items-center glass-morphism text-orange-200 px-5 py-2 rounded-full text-sm font-medium mt-3 animate-pulse border border-orange-400/30 shadow-glow">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="mr-1">🏗️</span>
              Secure Multi-Access Portal
              <span className="ml-1">🔐</span>
            </div>
          </div>
        </div>

        {/* Login Type Selection or Individual Login Form - Flex Grow */}
        <div className="flex-1 flex items-center justify-center py-6">
          {!activeLoginType ? (
            /* Three Login Boxes - Moderate Layout */
            <div className="grid lg:grid-cols-3 gap-6 px-4 w-full max-w-6xl">
              {loginTypes.map((loginType, index) => {
                const IconComponent = loginType.icon;
                return (
                  <div
                    key={loginType.type}
                    className="glass-morphism border border-white/20 rounded-xl p-8 shadow-glow-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                    onClick={() => handleLoginTypeSelect(loginType.type)}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {/* Header */}
                    <div className="text-center mb-5">
                      <div className={`w-14 h-14 ${loginType.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <h2 className={`text-xl font-bold text-white mb-2 transition-colors duration-300 drop-shadow-lg ${
                        loginType.type === 'admin' ? 'group-hover:text-orange-400' :
                        loginType.type === 'employee' ? 'group-hover:text-blue-400' :
                        'group-hover:text-green-400'
                      }`}>
                        {loginType.title}
                      </h2>
                      <p className="text-white/80 text-sm drop-shadow-md">
                        {loginType.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-sm mb-5 leading-relaxed drop-shadow-md">
                      {loginType.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {loginType.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-white/80 text-sm">
                          <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 shadow-glow ${
                            loginType.type === 'admin' ? 'bg-orange-400' :
                            loginType.type === 'employee' ? 'bg-blue-400' :
                            'bg-green-400'
                          }`}></div>
                          <span className="drop-shadow-md">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Login Button */}
                    <button className={`w-full glass-morphism hover:bg-white/30 text-white py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center border border-white/20 ${
                      loginType.type === 'admin' ? 'group-hover:bg-orange-500' :
                      loginType.type === 'employee' ? 'group-hover:bg-blue-500' :
                      'group-hover:bg-green-500'
                    } group-hover:shadow-glow`}>
                      Login as {loginType.type === 'admin' ? 'Admin' : loginType.type === 'employee' ? 'Employee' : 'Manager'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Saved Login Indicator */}
                    {loginData[loginType.type].rememberMe && loginData[loginType.type].email && (
                      <div className="mt-3 text-center">
                        <div className="inline-flex items-center bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-400/30">
                          <User className="w-3 h-3 mr-1" />
                          Saved: {loginData[loginType.type].email.substring(0, 15)}...
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Individual Login Form - Centered */
            <div className="w-full max-w-md px-4">
              <div className="glass-morphism border border-white/20 rounded-xl p-8 shadow-glow-white">
                {/* Back Button */}
                <button
                  onClick={handleBackToSelection}
                  className="mb-5 text-white/80 hover:text-white flex items-center text-sm transition-colors duration-300"
                  disabled={loginData[activeLoginType].isLoading}
                >
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to login options
                </button>

                {/* Header */}
                <div className="text-center mb-7">
                  <div className={`w-14 h-14 ${loginTypes.find(t => t.type === activeLoginType)?.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow`}>
                    {React.createElement(loginTypes.find(t => t.type === activeLoginType)?.icon || Crown, {
                      className: "w-7 h-7 text-white"
                    })}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                    {loginTypes.find(t => t.type === activeLoginType)?.title}
                  </h2>
                  <p className="text-white/80 text-base drop-shadow-md">
                    {loginTypes.find(t => t.type === activeLoginType)?.subtitle}
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={(e) => handleSubmit(activeLoginType, e)} className="space-y-5">
                  {loginData[activeLoginType].error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm animate-shake">
                      {loginData[activeLoginType].error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-white/90 font-medium mb-2 text-sm drop-shadow-md">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="email"
                        value={loginData[activeLoginType].email}
                        onChange={(e) => handleInputChange(activeLoginType, 'email', e.target.value)}
                        required
                        disabled={loginData[activeLoginType].isLoading}
                        className="w-full pl-11 pr-4 py-3 glass-morphism border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-white/90 font-medium mb-2 text-sm drop-shadow-md">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type={loginData[activeLoginType].showPassword ? 'text' : 'password'}
                        value={loginData[activeLoginType].password}
                        onChange={(e) => handleInputChange(activeLoginType, 'password', e.target.value)}
                        required
                        disabled={loginData[activeLoginType].isLoading}
                        className="w-full pl-11 pr-11 py-3 glass-morphism border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange(activeLoginType, 'showPassword', !loginData[activeLoginType].showPassword)}
                        disabled={loginData[activeLoginType].isLoading}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loginData[activeLoginType].showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`rememberMe-${activeLoginType}`}
                        checked={loginData[activeLoginType].rememberMe}
                        onChange={(e) => handleInputChange(activeLoginType, 'rememberMe', e.target.checked)}
                        disabled={loginData[activeLoginType].isLoading}
                        className="w-4 h-4 text-orange-500 bg-white/10 border-white/30 rounded focus:ring-orange-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label 
                        htmlFor={`rememberMe-${activeLoginType}`}
                        className="ml-2 text-white/90 text-sm font-medium cursor-pointer select-none"
                      >
                        Remember Me
                      </label>
                    </div>
                    
                    <button
                      type="button"
                      disabled={loginData[activeLoginType].isLoading}
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginData[activeLoginType].isLoading}
                    className={`w-full ${loginTypes.find(t => t.type === activeLoginType)?.bgColor} hover:opacity-90 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow disabled:transform-none disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {loginData[activeLoginType].isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" style={{ animationDuration: '0.6s' }}></div>
                        Signing In...
                      </div>
                    ) : (
                      `Sign In as ${activeLoginType === 'admin' ? 'Admin' : activeLoginType === 'employee' ? 'Employee' : 'Manager'}`
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="text-center px-4 pb-6">
          <div className="glass-morphism border border-white/20 rounded-xl p-6 max-w-4xl mx-auto">
            {/* Company Info */}
            <div className="flex items-center justify-center mb-4">
              <div className="glass-morphism p-2 rounded-lg border border-white/20 mr-3">
                <img 
                  src="/SLK-logo.png" 
                  alt="SLK Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="text-white font-medium drop-shadow-md text-base">SLK Trading & Design Construction Co., Ltd</p>
                <p className="text-white/60 text-sm drop-shadow-md">© {new Date().getFullYear()} • Professional Construction Services</p>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center glass-morphism px-3 py-2 rounded-full border border-green-400/30">
                <Lock className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-green-200">SSL Secured</span>
              </div>
              <div className="flex items-center glass-morphism px-3 py-2 rounded-full border border-blue-400/30">
                <Shield className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-blue-200">Multi-Access</span>
              </div>
              <div className="flex items-center glass-morphism px-3 py-2 rounded-full border border-orange-400/30">
                <Users className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-orange-200">Role-Based</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4">
              <p className="text-white/50 text-sm drop-shadow-md">
                🌍 Vientiane, Laos • 📱 +856 21 773 737 • 📧 info@slklaos.la
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for enhanced loading animations */}
      <style jsx>{`
        @keyframes loading-progress {
          0% { width: 0%; }
          25% { width: 30%; }
          50% { width: 60%; }
          75% { width: 85%; }
          100% { width: 100%; }
        }
        
        @keyframes modal-slide-in {
          0% { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-modal-slide-in {
          animation: modal-slide-in 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;