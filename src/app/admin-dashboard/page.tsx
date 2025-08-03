"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  Users, FolderOpen, CheckSquare, MessageSquare, FileText, Settings, BarChart3, Shield, Crown,
  Building2, LogOut, Home, Search, TrendingUp, Clock, Package, Mail, Briefcase, FilePlus, Eye,
  Calendar, CheckCircle, AlertCircle, Activity, DollarSign, Menu, X, ChevronRight, Database,
  CreditCard, Image, Plus, Filter, Download, RefreshCw, Star, Zap, Target, PieChart, ArrowUpRight,
  ArrowDownRight, Bookmark, Globe, Moon, Sun, ChevronDown, AlertTriangle, BarChart2, MapPin, Bell, User, Info
} from 'lucide-react';
import AnimatedSection from '../../components/AnimatedSection';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';

// Dynamic imports for better performance and avoiding circular dependencies
const ProjectManagement = dynamic(() => import('./projects/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const ProductManagement = dynamic(() => import('./Products/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const ContactManagement = dynamic(() => import('./contacts/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const QuoteManagement = dynamic(() => import('./quotes/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const SubscriberManagement = dynamic(() => import('./subscribers/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const PostsPage = dynamic(() => import('./posts/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const UserManagement = dynamic(() => import('./users/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const SettingsManagement = dynamic(() => import('./settings/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const CareerPage = dynamic(() => import('./careers/page'), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

// Temporarily simplified chart components to prevent build timeout
const SimpleChart = ({ data, title }: { data: any[]; title: string }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Chart will be available after deployment</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { isOnline, getStatistics, lastSyncTime } = useDatabase();
  
  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stats, setStats] = useState<{
    totalProjects?: number;
    totalUsers?: number;
    totalTasks?: number;
    newContacts?: number;
    totalQuotes?: number;
    totalMaterials?: number;
    totalSubscribers?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('This Month');
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome!',
      message: 'You have successfully logged in.',
      time: new Date(),
      unread: true,
      type: 'success',
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sidebar categories
  const sidebarCategories = [
    {
      title: 'General',
      items: [
        { title: 'Dashboard', href: '/admin-dashboard', icon: Home, badge: null, description: 'Overview of your account' },
        { title: 'Projects', href: '/admin-dashboard/projects', icon: Building2, description: 'Manage all your projects' },
        { title: 'Products', href: '/admin-dashboard/products', icon: Package, badge: null, description: 'Manage products and inventory' },
        { title: 'Contacts', href: '/admin-dashboard/contacts', icon: Mail, badge: null, description: 'Client and supplier contacts' },
        { title: 'Quotes', href: '/admin-dashboard/quotes', icon: FileText, badge: null, description: 'Manage your quotes' },
        { title: 'Posts', href: '/admin-dashboard/posts', icon: FilePlus, badge: null, description: 'Manage news & blog posts' },
        { title: 'Subscribers', href: '/admin-dashboard/subscribers', icon: User, badge: null, description: 'Newsletter subscribers' },
        { title: 'Careers', href: '/admin-dashboard/careers', icon: Briefcase, badge: null, description: 'Job openings and applications' },
        { title: 'Users', href: '/admin-dashboard/users', icon: Users, badge: null, description: 'Team members and roles' },
      ]
    },
    {
      title: 'Management',
      items: [
        { title: 'Settings', href: '/admin-dashboard/settings', icon: Settings, badge: null, description: 'System configuration' }
      ]
    }
  ];

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/admin-login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/admin-login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, user, router]);

  // Update current time every minute
  useEffect(() => {
    if (!isClient) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [isClient]);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const addNotification = (notification: any) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      time: new Date(),
      unread: true,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const loadChartData = async () => {
    try {
      const baseData = [
        { name: 'Jan', projects: 4, tasks: 65, quotes: 2 },
        { name: 'Feb', projects: 7, tasks: 78, quotes: 5 },
        { name: 'Mar', projects: 5, tasks: 98, quotes: 8 },
        { name: 'Apr', projects: 9, tasks: 87, quotes: 10 },
        { name: 'May', projects: 12, tasks: 140, quotes: 14 },
        { name: 'Jun', projects: 8, tasks: 120, quotes: 7 },
      ];
      
      let data = baseData;
      if (selectedTimeRange === 'Last Month') {
        data = baseData.map(item => ({
          ...item,
          projects: Math.max(1, item.projects - Math.floor(Math.random() * 3)),
          tasks: Math.max(10, item.tasks - Math.floor(Math.random() * 20)),
          quotes: Math.max(1, item.quotes - Math.floor(Math.random() * 2))
        }));
      } else if (selectedTimeRange === 'This Quarter') {
        data = baseData.map(item => ({
          ...item,
          projects: Math.floor(item.projects * 1.2),
          tasks: Math.floor(item.tasks * 1.15),
          quotes: Math.floor(item.quotes * 1.3)
        }));
      } else if (selectedTimeRange === 'This Year') {
        data = baseData.map(item => ({
          ...item,
          projects: Math.floor(item.projects * 1.5),
          tasks: Math.floor(item.tasks * 1.4),
          quotes: Math.floor(item.quotes * 1.6)
        }));
      }
      
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/recent-activity');
      if (!response.ok) throw new Error('Failed to fetch activity');
      const data = await response.json();

      const iconMap = {
        Building2,
        CheckSquare,
        FileText,
        Users,
      };

      const activityWithIcons = data.map(item => ({
        ...item,
        icon: iconMap[item.icon] || Users,
      }));

      return activityWithIcons; // <-- always return the array
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      return []; // <-- always return an array on error
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      try {
        const dashboardStats = await getStatistics();
        setStats(dashboardStats);
      } catch (error) {
        setStats({
          totalProjects: 47,
          totalUsers: 23,
          totalTasks: 156,
          newContacts: 12,
          totalQuotes: 34,
          totalMaterials: 248,
          totalSubscribers: 1247
        });
        console.error('Some dashboard statistics could not be loaded.');
      }
      
      try {
        const activity = await loadRecentActivity();
        setRecentActivity(activity);
      } catch (error) {
        setRecentActivity([]);
      }
      
      try {
        await loadChartData();
      } catch (error) {
        // Already handled in loadChartData
      }
      
    } catch (error) {
      console.error('Some dashboard data could not be loaded. The system will continue with limited functionality.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleNavigation = (href) => {
    const isComingSoon = [
      '/admin-dashboard/analytics',
      '/admin-dashboard/reports',
      '/admin-dashboard/team',
      '/admin-dashboard/billing',
      '/admin-dashboard/clients',
      '/admin-dashboard/media',
      '/admin-dashboard/blog',
      '/admin-dashboard/pages',
      '/admin-dashboard/newsletter',
      '/admin-dashboard/database',
      '/admin-dashboard/activity',
      '/admin-dashboard/notifications',
      '/admin-dashboard/backup'
    ].includes(href);

    if (isComingSoon) {
      console.log("This feature is coming soon!");
      return;
    }

    if (href === '/admin-dashboard/projects') {
      setCurrentPage('projects');
      return;
    }

    if (href === '/admin-dashboard/products') {
      setCurrentPage('products');
      return;
    }

    const pageName = href.split('/').pop();
    if (pageName && href.startsWith('/admin-dashboard')) {
      setCurrentPage(pageName);
    } else {
      router.push(href);
    }
  };

  const handleQuickAction = (actionId) => {
    setShowQuickActions(false);
    const actions = {
      'new-project': () => {
        addNotification({
          title: "New Project",
          message: "Opening new project form...",
          type: "info"
        });
        setCurrentPage('projects');
      },
      'new-product': () => {
        addNotification({
          title: "New Product",
          message: "Opening new product form...",
          type: "info"
        });
        setCurrentPage('products');
      },
      'add-user': () => {
        addNotification({
          title: "Add User",
          message: "Opening user creation form...",
          type: "info"
        });
        setCurrentPage('users');
      },
      'new-task': () => {
        addNotification({
          title: "New Task",
          message: "Opening task creation form...",
          type: "info"
        });
        setCurrentPage('tasks');
      },
      'create-quote': () => {
        addNotification({
          title: "Create Quote",
          message: "Opening quote creation form...",
          type: "info"
        });
        setCurrentPage('quotes');
      },
      'inventory': () => {
        handleNavigation('/admin-dashboard/materials');
      },
      'settings': () => {
        handleNavigation('/admin-dashboard/settings');
      }
    };
    const action = actions[actionId];
    if (action) {
      action();
    } else {
      addNotification({
        title: "Feature Coming Soon",
        message: `${actionId} feature is being prepared...`,
        type: "info"
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      addNotification({
        title: "Dashboard Refreshed",
        message: "Dashboard refreshed successfully!",
        type: "success"
      });
    } catch (error) {
      addNotification({
        title: "Refresh Failed",
        message: "Failed to refresh dashboard data. Please try again.",
        type: "error"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    const newMode = !darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('slk-dark-mode', newMode.toString());
    }
    if (newMode) {
      document.documentElement.classList.add('dark');
      addNotification({
        title: "Dark Mode",
        message: "Dark mode activated",
        type: "success"
      });
    } else {
      document.documentElement.classList.remove('dark');
      addNotification({
        title: "Light Mode",
        message: "Light mode activated",
        type: "success"
      });
    }
  };

  const TasksPageContent = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <p className="text-gray-600">Task management features coming soon...</p>
    </div>
  );

  const MaterialsPageContent = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Materials</h2>
      <p className="text-gray-600">Material inventory management features coming soon...</p>
    </div>
  );

  const renderPageContent = () => {
    switch (currentPage) {
      case 'projects':
        return <ProjectManagement />;
      case 'products':
        return <ProductManagement />;
      case 'contacts':
        return <ContactManagement />;
      case 'users':
        return <UserManagement />;
      case 'tasks':
        return <TasksPageContent />;
      case 'quotes':
        return <QuoteManagement />;
      case 'materials':
        return <MaterialsPageContent />;
      case 'settings':
        return <SettingsManagement />;
      case 'subscribers':
        return <SubscriberManagement />;
      case 'posts':
        return <PostsPage />;
      case 'careers':
        return <CareerPage />;
      default:
        return <DashboardContent />;
    }
  };

  const DashboardContent = () => {
    const dashboardStats = [
      {
        title: 'Total Projects',
        value: typeof stats.totalProjects === 'number' ? stats.totalProjects : 0,
        target: 60,
        change: '+12%',
        description: 'vs last month',
        icon: Building2,
        gradient: 'from-emerald-500 to-emerald-600',
        onClick: () => handleNavigation('/admin-dashboard/projects')
      },
      {
        title: 'Active Users',
        value: typeof stats.totalUsers === 'number' ? stats.totalUsers : 0,
        target: 30,
        change: '+8%',
        description: 'team members',
        icon: Users,
        gradient: 'from-blue-500 to-blue-600',
        onClick: () => handleNavigation('/admin-dashboard/users')
      },
      {
        title: 'Pending Tasks',
        value: typeof stats.totalTasks === 'number' ? stats.totalTasks : 0,
        target: 200,
        change: '+15%',
        description: 'across projects',
        icon: CheckSquare,
        gradient: 'from-purple-500 to-purple-600',
        onClick: () => handleNavigation('/admin-dashboard/tasks')
      },
      {
        title: 'New Contacts',
        value: typeof stats.newContacts === 'number' ? stats.newContacts : 0,
        target: 20,
        change: '+5%',
        description: 'this week',
        icon: Mail,
        gradient: 'from-amber-500 to-amber-600',
        onClick: () => handleNavigation('/admin-dashboard/contacts')
      }
    ];

    return (
      <>
        {/* Welcome Section */}
        <AnimatedSection animation="fade-down" delay={100} duration={600}>
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-3">Welcome back, {user?.name}! 👋</h2>
                  <p className="text-white/90 text-lg">Here's your SLK Trading & Construction overview for today.</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {currentTime.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection animation="fade-up" delay={200} duration={600}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">System Overview</h3>
              <div className="relative dropdown-container">
                <button 
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New</span>
                </button>
                
                {showQuickActions && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2">
                    {[
                      { id: 'new-project', title: 'New Project', icon: Building2, color: 'text-emerald-600' },
                      { id: 'new-product', title: 'New Product', icon: Package, color: 'text-indigo-600' },
                      { id: 'add-user', title: 'Add User', icon: Users, color: 'text-blue-600' },
                      { id: 'new-task', title: 'New Task', icon: CheckSquare, color: 'text-purple-600' },
                      { id: 'create-quote', title: 'Create Quote', icon: FileText, color: 'text-amber-600' },
                      { id: 'inventory', title: 'Manage Inventory', icon: Package, color: 'text-teal-600' },
                      { id: 'settings', title: 'Settings', icon: Settings, color: 'text-slate-600' }
                    ].map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                        >
                          <IconComponent className={`w-4 h-4 ${action.color}`} />
                          <span className="text-sm font-medium text-slate-900">{action.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid lg:grid-cols-4 gap-8">
              {dashboardStats.map((stat, index) => {
                const IconComponent = stat.icon;
                const progress = (stat.value / stat.target) * 100;
                return (
                  <AnimatedSection 
                    key={index}
                    animation="scale" 
                    delay={300 + (index * 100)} 
                    duration={500}
                  >
                    <div 
                      onClick={stat.onClick}
                      className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500 mb-2">{stat.title}</p>
                          <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                          <div className="flex items-center space-x-1 mb-2">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
                          </div>
                          <p className="text-xs text-slate-400">{stat.description}</p>
                        </div>
                        <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-slate-500">Progress</span>
                          <span className="text-xs font-bold text-slate-900">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${stat.gradient} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Charts Section */}
        <AnimatedSection animation="fade-up" delay={400} duration={600}>
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <SimpleChart data={chartData} title="Project Progress Overview" />
            <SimpleChart data={chartData} title="Monthly Performance" />
          </div>
        </AnimatedSection>

        {/* Recent Activity */}
        <AnimatedSection animation="fade-up" delay={500} duration={600}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <IconComponent className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.description}</p>
                      </div>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl border-r border-slate-200 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-20'
      } ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">SLK Admin</h2>
                <p className="text-xs text-slate-500">Trading & Construction</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-6">
            {sidebarCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {sidebarOpen && (
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {category.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {category.items.map((item, itemIndex) => {
                    const IconComponent = item.icon;
                    const isActive = (item.href === '/admin-dashboard' && currentPage === 'dashboard') ||
                                   (item.href !== '/admin-dashboard' && currentPage === item.href.split('/').pop());
                    
                    return (
                      <button
                        key={itemIndex}
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                          isActive 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title={!sidebarOpen ? item.title : ''}
                      >
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        {sidebarOpen && (
                          <>
                            <span className="flex-1 text-left font-medium">{item.title}</span>
                            {item.badge && (
                              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            {sidebarOpen ? (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name || user?.email}</p>
                  <p className="text-xs text-slate-500 truncate">Administrator</p>
                </div>
                <button
                  onClick={handleGoHome}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Go to website"
                >
                  <Globe className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleGoHome}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Go to website"
              >
                <Globe className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {currentPage === 'dashboard' ? 'Dashboard' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h1>
              <p className="text-slate-500">Welcome to SLK Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4 relative">
              <button
                onClick={handleRefresh}
                className={`p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderPageContent()}
        </div>
      </div>

      {showNotifications && (
        <div className="fixed top-20 right-10 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-[99999] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <h4 className="text-sm font-medium text-slate-900">{notification.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {notification.time.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
};

export default AdminDashboard;
