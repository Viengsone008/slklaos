"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/admin/AdminLayout';
import { Post } from '../../types/Post';
import { Building2, Users, CheckSquare, Mail } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoadingAdminPage, setIsLoadingAdminPage] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading progress animation
  useEffect(() => {
    if (!isClient || isAuthenticated) return;

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoadingAdminPage(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isClient, isAuthenticated]);

  const handleCreatePost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleBackToList = () => {
    setShowEditor(false);
    setEditingPost(null);
    setCurrentPage('posts');
  };

  // Add console log to debug navigation
  const handlePageChange = (page: string) => {
    console.log('Page changing to:', page);
    setCurrentPage(page);
    setShowEditor(false);
    setEditingPost(null);
  };

  // Don't render anything on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Enhanced Admin page loading screen (before login form) - Hero Theme
  if (!isAuthenticated && isLoadingAdminPage) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Hero-Matching Background with Construction Theme */}
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Modern house construction and design background"
            className="w-full h-full object-cover"
          />
          {/* Matching overlay from hero section */}
          <div className="absolute inset-0 bg-black/65"></div>
          {/* Additional gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-orange-900/20"></div>
        </div>

        {/* Floating Particles with 3D depth - matching hero */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Animated Grid Lines - construction theme */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto flex items-center justify-center min-h-screen px-4">
          <div className="w-full">
            {/* Logo Section - matching hero style */}
            <div className="mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="backdrop-blur-lg bg-white/10 p-6 rounded-3xl border border-white/20 shadow-2xl">
                    <img 
                      src="/SLK-logo.png" 
                      alt="SLK Trading & Design Construction Logo"
                      className="w-20 h-20 object-contain animate-pulse"
                    />
                  </div>
                  <div className="absolute inset-0 bg-orange-400/20 rounded-3xl animate-ping"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-400/20 to-blue-400/20 rounded-3xl animate-pulse"></div>
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                SLK Trading Database
              </h1>
              <p className="text-2xl text-orange-400 font-semibold drop-shadow-2xl mb-4">
                Multi-Access Management System
              </p>
              <div className="inline-flex items-center backdrop-blur-lg bg-white/10 text-orange-200 px-6 py-3 rounded-full text-lg font-medium animate-pulse border border-orange-400/30 shadow-lg">
                <Building2 className="w-5 h-5 mr-2" />
                Leading Construction Company in Laos 
              </div>
            </div>

            {/* Enhanced Loading Animation */}
            <div className="mb-12">
              {/* Main Spinner with 3D effect */}
              <div className="relative mb-12">
                <div className="w-32 h-32 border-4 border-white/20 border-t-orange-400 rounded-full animate-spin mx-auto shadow-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-white/30 border-b-orange-300 rounded-full animate-spin shadow-lg" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border border-white/40 border-r-blue-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-orange-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
              </div>

              {/* Enhanced Loading Text */}
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-2xl">
                Loading Database Portal 
              </h2>
              <p className="text-white/90 mb-2 text-xl drop-shadow-lg">
                Preparing your database environment...
              </p>
              <p className="text-white/70 text-lg mb-8 drop-shadow-md">
                Initializing multi-access authentication system
              </p>

              {/* Multi-Stage Progress Indicators */}
              <div className="space-y-6 mb-12">
                {[
                  { text: 'Initializing database systems', delay: 0 },
                  { text: 'Loading authentication protocols', delay: 0.2 },
                  { text: 'Preparing multi-user interface', delay: 0.4 },
                  { text: 'Finalizing login portal', delay: 0.6 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-center space-x-4 text-white/80">
                    <div 
                      className="w-4 h-4 bg-orange-400 rounded-full animate-bounce shadow-lg"
                      style={{ animationDelay: `${item.delay}s` }}
                    ></div>
                    <span className="text-lg drop-shadow-md">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Enhanced Progress Bar */}
              <div className="w-full max-w-lg mx-auto mb-8">
                <div className="w-full backdrop-blur-lg bg-white/10 rounded-full h-4 overflow-hidden border border-white/30">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-300 ease-out shadow-lg"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-white/70 text-sm">{loadingProgress}% Complete</span>
                </div>
              </div>

              {/* Service Icons */}
              <div className="flex justify-center space-x-8 mb-8">
                <div className="backdrop-blur-lg bg-white/10 p-4 rounded-xl border border-white/20 shadow-lg">
                  <Building2 className="w-8 h-8 text-orange-400 animate-pulse" />
                </div>
                <div className="backdrop-blur-lg bg-white/10 p-4 rounded-xl border border-white/20 shadow-lg">
                  <Users className="w-8 h-8 text-blue-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
                <div className="backdrop-blur-lg bg-white/10 p-4 rounded-xl border border-white/20 shadow-lg">
                  <CheckSquare className="w-8 h-8 text-green-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>
            </div>

            {/* Enhanced Status Information */}
            <div className="backdrop-blur-lg bg-white/10 px-8 py-6 rounded-2xl border border-white/20 shadow-lg max-w-2xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-2 text-white/90 text-sm mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-medium drop-shadow-md">Secure Access</span>
                  </div>
                  <p className="text-xs text-white/70 drop-shadow-md">Multi-layer authentication</p>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-2 text-white/90 text-sm mb-2">
                    <Building2 className="w-4 h-4 text-orange-400" />
                    <span className="font-medium drop-shadow-md">Professional</span>
                  </div>
                  <p className="text-xs text-white/70 drop-shadow-md">Enterprise-grade system</p>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-2 text-white/90 text-sm mb-2">
                    <CheckSquare className="w-4 h-4 text-green-400" />
                    <span className="font-medium drop-shadow-md">Multi-Access</span>
                  </div>
                  <p className="text-xs text-white/70 drop-shadow-md">Admin, Employee, Manager</p>
                </div>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="mt-8 text-white/70">
              <p className="text-lg drop-shadow-md mb-2">
                Please wait while we prepare your database experience...
              </p>
              <div className="flex items-center justify-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="drop-shadow-md">Powered by SLK Trading & Design Construction</span>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced floating construction elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
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
              <div className="w-8 h-8 border-2 border-white rounded-lg animate-bounce transform rotate-45 shadow-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderContent = () => {
    if (showEditor) {
      return <PostEditor post={editingPost || undefined} onBack={handleBackToList} />;
    }

    // Render different dashboard based on user type
    if (currentPage === 'dashboard') {
      if (user?.loginType === 'admin') {
        return <AdminDashboard />;
      } else if (user?.loginType === 'manager') {
        return <ManagerDashboard />;
      } else {
        return <EmployeeDashboard />;
      }
    }

    // Render other pages based on selection
    switch (currentPage) {
      case 'database':
        return <DatabaseDashboard />;
      case 'posts':
        return <PostList onCreatePost={handleCreatePost} onEditPost={handleEditPost} />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      case 'tasks':
        return <TaskManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'team':
        return <TeamManagement />;
      case 'materials':
        return <MaterialsManagement />;
      case 'documents':
        return <DocumentManagement />;
      case 'contacts':
        return <ContactManagement />;
      case 'quotes':
        return <QuoteManagement />;
      case 'reports':
        return <ReportsDashboard />;
      case 'budget':
        return <BudgetManagement />;
      case 'planning':
        return <PlanningCalendar />;
      case 'timesheet':
        return <TimeTracker />;
      case 'subscribers':
        return <SubscriberManagement />;
      case 'products':
        return <ProductsManagement />;
      case 'careers':
        return <CareerManagement />;
      case 'rfi':
        return <RFIManagement />;

      default:
        // Default to appropriate dashboard based on user type
        if (user?.loginType === 'admin') {
          return <AdminDashboard />;
        } else if (user?.loginType === 'manager') {
          return <ManagerDashboard />;
        } else {
          return <EmployeeDashboard />;
        }
    }
  };

  return (
    <>
      <AdminLayout currentPage={currentPage} onPageChange={handlePageChange}>
        {renderContent()}
      </AdminLayout>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default AdminPanel;