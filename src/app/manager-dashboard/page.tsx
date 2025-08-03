"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CheckSquare, 
  TrendingUp, 
  Calendar, 
  PieChart, 
  BarChart2, 
  Clock, 
  DollarSign,
  FileText,
  Package,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Home,
  Bell,
  Crown,
  Activity,
  Target,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import AnimatedSection from '../../components/AnimatedSection';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const { getAllRecords, getStatistics } = useDatabase();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollProgress, setScrollProgress] = useState(0);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update current time every minute (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [isClient]);

  // Scroll progress effect
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load statistics
        const statsData = await getStatistics();
        setStats(statsData);

        // Load team members (users in the same department)
        const usersData = await getAllRecords('users');
        const departmentMembers = usersData.filter((u: any) => 
          u.department === user?.department && u.id !== user?.id
        );
        setTeamMembers(departmentMembers);

        // Load projects
        const projectsData = await getAllRecords('projects');
        setProjects(projectsData);

        // Load tasks
        const tasksData = await getAllRecords('tasks');
        setTasks(tasksData);

        // Load materials
        const materialsData = await getAllRecords('materials');
        setMaterials(materialsData);

        // Load contacts and quotes
        const contactsData = await getAllRecords('contacts');
        setContacts(contactsData);
        
        const quotesData = await getAllRecords('quotes');
        setQuotes(quotesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, isClient]);

  // Logout handler
  const handleLogout = () => {
    console.log('🚪 Manager logging out...');
    logout();
  };

  // Navigate to home page
  const handleGoHome = () => {
    router.push('/');
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate project status percentages
  const projectStats = {
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length
  };

  const taskStats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on_hold':
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'in_stock':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'cancelled':
      case 'out_of_stock':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'on_hold':
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  // Simple progress bar component
  const ProgressBar = ({ percentage, color = 'bg-blue-500' }: { percentage: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-300`} 
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                    <p className="text-sm text-gray-600">SLK Trading & Construction</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Manager Dashboard</h3>
            <p className="text-gray-600">Preparing your management interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                  <p className="text-sm text-gray-600">SLK Trading & Construction</p>
                </div>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    {user?.role} • {user?.department || 'Manager'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGoHome}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Go to Website"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Home</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <AnimatedSection animation="fade-down" delay={100} duration={600}>
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}! 👋</h2>
                  <p className="text-green-100">{user?.position || 'Manager'} • {user?.department || 'Management'} Department</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-sm text-green-100">Team Members</div>
                    <div className="font-semibold">{teamMembers.length + 1}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-sm text-green-100">Active Projects</div>
                    <div className="font-semibold">{projects.filter(p => p.status === 'in_progress').length}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-sm text-green-100">Current Time</div>
                    <div className="font-semibold">{currentTime.toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Key Metrics */}
          <AnimatedSection animation="fade-up" delay={200} duration={600}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Projects',
                  value: projects.length,
                  icon: Building2,
                  color: 'bg-green-100',
                  iconColor: 'text-green-600',
                  subtitle: `${projects.filter(p => p.status === 'completed').length} completed • ${projects.filter(p => p.status === 'in_progress').length} active`,
                  trend: '+12%',
                  trendUp: true
                },
                {
                  title: 'Team Tasks',
                  value: tasks.length,
                  icon: CheckSquare,
                  color: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  subtitle: `${tasks.filter(t => t.status === 'completed').length} completed • ${tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length} pending`,
                  trend: '+8%',
                  trendUp: true
                },
                {
                  title: 'Budget Utilization',
                  value: `${stats.budgetUtilization || 73}%`,
                  icon: DollarSign,
                  color: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  subtitle: `${formatCurrency(stats.totalBudget || 125000)} total budget`,
                  trend: '+5%',
                  trendUp: true
                },
                {
                  title: 'New Leads',
                  value: contacts.filter(c => c.status === 'new').length + quotes.filter(q => q.status === 'new').length,
                  icon: Phone,
                  color: 'bg-orange-100',
                  iconColor: 'text-orange-600',
                  subtitle: `${contacts.filter(c => c.status === 'new').length} contacts • ${quotes.filter(q => q.status === 'new').length} quotes`,
                  trend: '+23%',
                  trendUp: true
                }
              ].map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <AnimatedSection key={index} animation="scale" delay={300 + (index * 100)} duration={500}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-500 font-medium">{metric.title}</div>
                        <div className={`${metric.color} p-2 rounded-lg`}>
                          <IconComponent className={`w-5 h-5 ${metric.iconColor}`} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">{metric.subtitle}</div>
                        <div className={`flex items-center text-sm ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span className="font-medium">{metric.trend}</span>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Project & Task Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Status Overview */}
            <AnimatedSection animation="fade-up" delay={700} duration={600}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-green-600" />
                  Project Status Overview
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Planning', count: projectStats.planning, color: 'bg-blue-500', total: projects.length },
                    { label: 'In Progress', count: projectStats.inProgress, color: 'bg-orange-500', total: projects.length },
                    { label: 'Completed', count: projectStats.completed, color: 'bg-green-500', total: projects.length },
                    { label: 'On Hold', count: projectStats.onHold, color: 'bg-yellow-500', total: projects.length },
                    { label: 'Cancelled', count: projectStats.cancelled, color: 'bg-red-500', total: projects.length }
                  ].map((item, index) => {
                    const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
                    return (
                      <AnimatedSection key={index} animation="fade-right" delay={800 + (index * 100)} duration={400}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.count}</span>
                            <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <ProgressBar percentage={percentage} color={item.color} />
                      </AnimatedSection>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* Task Status Overview */}
            <AnimatedSection animation="fade-up" delay={800} duration={600}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
                  Task Status Overview
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Pending', count: taskStats.pending, color: 'bg-yellow-500', total: tasks.length },
                    { label: 'In Progress', count: taskStats.inProgress, color: 'bg-blue-500', total: tasks.length },
                    { label: 'Completed', count: taskStats.completed, color: 'bg-green-500', total: tasks.length },
                    { label: 'Cancelled', count: taskStats.cancelled, color: 'bg-red-500', total: tasks.length }
                  ].map((item, index) => {
                    const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
                    return (
                      <AnimatedSection key={index} animation="fade-left" delay={900 + (index * 100)} duration={400}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.count}</span>
                            <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <ProgressBar percentage={percentage} color={item.color} />
                      </AnimatedSection>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Team Members and Recent Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Members */}
            <AnimatedSection animation="fade-up" delay={1000} duration={600}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Team Members
                  </h3>
                </div>
                <div className="p-4">
                  {teamMembers.length > 0 || user ? (
                    <div className="space-y-3">
                      {/* Current user (manager) */}
                      <AnimatedSection animation="fade-right" delay={1100} duration={400}>
                        <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Crown className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{user?.name} (You)</p>
                            <p className="text-sm text-gray-600">{user?.position || 'Manager'}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Manager
                          </span>
                        </div>
                      </AnimatedSection>
                      
                      {/* Team members */}
                      {teamMembers.slice(0, 4).map((member, index) => (
                        <AnimatedSection 
                          key={member.id}
                          animation="fade-left" 
                          delay={1200 + (index * 100)} 
                          duration={400}
                        >
                          <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 flex items-center transition-colors">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.position}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {member.role}
                            </span>
                          </div>
                        </AnimatedSection>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No team members found</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      Manage Team
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Recent Projects */}
            <AnimatedSection animation="fade-up" delay={1100} duration={600}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-green-600" />
                    Recent Projects
                  </h3>
                </div>
                <div className="p-4">
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project, index) => (
                        <AnimatedSection 
                          key={project.id}
                          animation="fade-up" 
                          delay={1200 + (index * 100)} 
                          duration={400}
                        >
                          <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                                <p className="text-sm text-gray-600">{formatDate(project.start_date)}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                {getStatusIcon(project.status)}
                                {project.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Budget: {formatCurrency(project.budget || 0)}</span>
                              <span className="text-sm font-medium text-gray-900">{project.progress || 0}%</span>
                            </div>
                            <ProgressBar percentage={project.progress || 0} color="bg-green-500" />
                          </div>
                        </AnimatedSection>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No projects found</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      View All Projects
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Quick Actions */}
          <AnimatedSection animation="fade-up" delay={1300} duration={600}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Tools</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Building2, title: 'Project Planning', color: 'bg-green-50 hover:bg-green-100', iconColor: 'text-green-600' },
                  { icon: Users, title: 'Team Management', color: 'bg-blue-50 hover:bg-blue-100', iconColor: 'text-blue-600' },
                  { icon: TrendingUp, title: 'Budget Reports', color: 'bg-purple-50 hover:bg-purple-100', iconColor: 'text-purple-600' },
                  { icon: Calendar, title: 'Schedule Planning', color: 'bg-orange-50 hover:bg-orange-100', iconColor: 'text-orange-600' },
                  { icon: Target, title: 'Goal Tracking', color: 'bg-red-50 hover:bg-red-100', iconColor: 'text-red-600' },
                  { icon: Activity, title: 'Performance', color: 'bg-indigo-50 hover:bg-indigo-100', iconColor: 'text-indigo-600' },
                  { icon: Briefcase, title: 'Resources', color: 'bg-teal-50 hover:bg-teal-100', iconColor: 'text-teal-600' },
                  { icon: FileText, title: 'Reports', color: 'bg-pink-50 hover:bg-pink-100', iconColor: 'text-pink-600' }
                ].map((tool, index) => {
                  const IconComponent = tool.icon;
                  return (
                    <AnimatedSection 
                      key={index}
                      animation="scale" 
                      delay={1400 + (index * 100)} 
                      duration={400}
                    >
                      <button className={`${tool.color} p-4 rounded-lg transition-all duration-200 flex flex-col items-center text-center transform hover:scale-105 w-full`}>
                        <IconComponent className={`w-6 h-6 ${tool.iconColor} mb-2`} />
                        <span className="text-sm font-medium text-gray-900">{tool.title}</span>
                      </button>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
    </>
  );
};

export default ManagerDashboard;