"use client";
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Package, 
  FileText, 
  Users, 
  MessageSquare, 
  Bell, 
  Briefcase,
  BarChart2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  CalendarDays,
  Building2,
  LogOut,
  Home,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import AnimatedSection from '../../components/AnimatedSection';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const { getAllRecords } = useDatabase();
  const router = useRouter();
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [tasks, setTasks] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load tasks assigned to current user
        const tasksData = await getAllRecords('tasks');
        const userTasks = tasksData.filter((task: any) => 
          task.assigned_to === user?.id || 
          task.assigned_to?.id === user?.id
        );
        setTasks(userTasks);

        // Load materials data
        const materialsData = await getAllRecords('materials');
        setMaterials(materialsData);

        // Load projects data
        const projectsData = await getAllRecords('projects');
        setProjects(projectsData);

        // Load documents
        const documentsData = await getAllRecords('documents');
        setRecentDocuments(documentsData.slice(0, 5));

        // Generate upcoming tasks
        const upcoming = userTasks
          .filter((task: any) => task.status !== 'completed' && task.status !== 'cancelled')
          .sort((a: any, b: any) => {
            const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
            const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
            return dateA - dateB;
          })
          .slice(0, 5);
        setUpcomingTasks(upcoming);

        // Generate mock notifications
        const mockNotifications = [
          { 
            id: 1, 
            type: 'task', 
            message: 'New task assigned to you: Site inspection', 
            time: '2 hours ago',
            read: false
          },
          { 
            id: 2, 
            type: 'document', 
            message: 'Project specifications updated', 
            time: '1 day ago',
            read: true
          },
          { 
            id: 3, 
            type: 'material', 
            message: 'Low stock alert: Premium Waterproof Membrane', 
            time: '2 days ago',
            read: false
          }
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, isClient]);

  // Logout handler
  const handleLogout = () => {
    console.log('🚪 Employee logging out...');
    logout();
  };

  // Navigate to home page
  const handleGoHome = () => {
    router.push('/');
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock3 className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      case 'urgent': return 'text-purple-600 font-bold';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTaskCompletion = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((task: any) => task.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                    <p className="text-sm text-gray-600">SLK Trading & Construction</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'E'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Employee Dashboard</h3>
            <p className="text-gray-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                  <p className="text-sm text-gray-600">SLK Trading & Construction</p>
                </div>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white text-[10px]">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    {user?.role} • {user?.department || 'Employee'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'E'}
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
                  <p className="text-blue-100">{user?.position || 'Employee'} • {user?.department || 'Construction'} Department</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-sm text-blue-100">Today's Date</div>
                    <div className="font-semibold">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-sm text-blue-100">Tasks Completion</div>
                    <div className="font-semibold">{calculateTaskCompletion()}%</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Stats */}
          <AnimatedSection animation="fade-up" delay={200} duration={600}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'My Tasks',
                  value: tasks.length,
                  icon: CheckSquare,
                  color: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  completed: tasks.filter((t: any) => t.status === 'completed').length,
                  inProgress: tasks.filter((t: any) => t.status === 'in_progress').length
                },
                {
                  title: 'Projects',
                  value: projects.length,
                  icon: Briefcase,
                  color: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  completed: projects.filter((p: any) => p.status === 'completed').length,
                  inProgress: projects.filter((p: any) => p.status === 'in_progress').length
                },
                {
                  title: 'Materials',
                  value: materials.length,
                  icon: Package,
                  color: 'bg-orange-100',
                  iconColor: 'text-orange-600',
                  completed: materials.filter((m: any) => m.status === 'in_stock').length,
                  inProgress: materials.filter((m: any) => m.status === 'low_stock' || m.status === 'out_of_stock').length
                },
                {
                  title: 'Documents',
                  value: recentDocuments.length,
                  icon: FileText,
                  color: 'bg-green-100',
                  iconColor: 'text-green-600',
                  completed: null,
                  inProgress: null
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <AnimatedSection 
                    key={index}
                    animation="scale" 
                    delay={300 + (index * 100)} 
                    duration={500}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-500 font-medium">{stat.title}</div>
                        <div className={`${stat.color} p-2 rounded-lg`}>
                          <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="flex items-center text-sm">
                        {stat.completed !== null && (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
                            <span className="text-green-600 font-medium">{stat.completed} completed</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-orange-600 font-medium">{stat.inProgress} {stat.title === 'Materials' ? 'low/out' : 'active'}</span>
                          </>
                        )}
                        {stat.completed === null && (
                          <>
                            <span className="text-blue-600 font-medium">Recent documents</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-purple-600 font-medium">View all</span>
                          </>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </AnimatedSection>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Tasks */}
            <AnimatedSection animation="fade-up" delay={400} duration={600}>
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Upcoming Tasks
                  </h3>
                </div>
                <div className="p-6">
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTasks.map((task: any, index) => (
                        <AnimatedSection 
                          key={task.id}
                          animation="fade-right" 
                          delay={500 + (index * 100)} 
                          duration={400}
                        >
                          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors transform hover:scale-102">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  <span className="mr-3">{task.project?.name || 'No project'}</span>
                                  <CalendarDays className="w-3 h-3 mr-1" />
                                  <span>{task.due_date ? formatDate(task.due_date) : 'No due date'}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getTaskStatusColor(task.status)}`}>
                                  {getTaskStatusIcon(task.status)}
                                  <span className="ml-1">{task.status}</span>
                                </span>
                                <span className={`text-xs mt-2 ${getTaskPriorityColor(task.priority)}`}>
                                  {task.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                        </AnimatedSection>
                      ))}
                    </div>
                  ) : (
                    <AnimatedSection animation="bounce-in" delay={500} duration={600}>
                      <div className="text-center py-8">
                        <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No upcoming tasks</p>
                      </div>
                    </AnimatedSection>
                  )}
                  
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All Tasks
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Notifications & Activity */}
            <div className="space-y-6">
              {/* Notifications */}
              <AnimatedSection animation="fade-left" delay={600} duration={600}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-orange-500" />
                      Notifications
                    </h3>
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                      {notifications.filter(n => !n.read).length} new
                    </span>
                  </div>
                  <div className="p-4">
                    {notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.map((notification, index) => (
                          <AnimatedSection 
                            key={notification.id}
                            animation="fade-up" 
                            delay={700 + (index * 100)} 
                            duration={400}
                          >
                            <div 
                              className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                            >
                              <div className="flex items-start">
                                <div className={`p-2 rounded-lg mr-3 ${
                                  notification.type === 'task' ? 'bg-blue-100' : 
                                  notification.type === 'document' ? 'bg-green-100' : 'bg-orange-100'
                                }`}>
                                  {notification.type === 'task' ? (
                                    <CheckSquare className={`w-4 h-4 ${
                                      notification.type === 'task' ? 'text-blue-600' : 
                                      notification.type === 'document' ? 'text-green-600' : 'text-orange-600'
                                    }`} />
                                  ) : notification.type === 'document' ? (
                                    <FileText className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Package className="w-4 h-4 text-orange-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-gray-500">{notification.time}</span>
                                </div>
                              </div>
                            </div>
                          </AnimatedSection>
                        ))}
                      </div>
                    ) : (
                      <AnimatedSection animation="bounce-in" delay={700} duration={600}>
                        <div className="text-center py-6">
                          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No notifications</p>
                        </div>
                      </AnimatedSection>
                    )}
                    
                    <div className="mt-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Recent Documents */}
              <AnimatedSection animation="fade-left" delay={800} duration={600}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Recent Documents
                    </h3>
                  </div>
                  <div className="p-4">
                    {recentDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {recentDocuments.map((doc: any, index) => (
                          <AnimatedSection 
                            key={doc.id}
                            animation="fade-up" 
                            delay={900 + (index * 100)} 
                            duration={400}
                          >
                            <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors transform hover:scale-102">
                              <div className="p-2 bg-gray-100 rounded mr-3">
                                <FileText className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                                <p className="text-xs text-gray-500">{formatDate(doc.created_at)}</p>
                              </div>
                            </div>
                          </AnimatedSection>
                        ))}
                      </div>
                    ) : (
                      <AnimatedSection animation="bounce-in" delay={900} duration={600}>
                        <div className="text-center py-6">
                          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No recent documents</p>
                        </div>
                      </AnimatedSection>
                    )}
                    
                    <div className="mt-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All Documents
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Quick Actions */}
          <AnimatedSection animation="fade-up" delay={1000} duration={600}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'Create Task', icon: CheckSquare, color: 'bg-blue-50 hover:bg-blue-100', iconColor: 'text-blue-600' },
                  { title: 'Upload Document', icon: FileText, color: 'bg-green-50 hover:bg-green-100', iconColor: 'text-green-600' },
                  { title: 'Request Materials', icon: Package, color: 'bg-orange-50 hover:bg-orange-100', iconColor: 'text-orange-600' },
                  { title: 'Team Chat', icon: MessageSquare, color: 'bg-purple-50 hover:bg-purple-100', iconColor: 'text-purple-600' }
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <AnimatedSection 
                      key={index}
                      animation="scale" 
                      delay={1100 + (index * 100)} 
                      duration={400}
                    >
                      <button className={`${action.color} p-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex flex-col items-center text-center w-full`}>
                        <IconComponent className={`w-6 h-6 ${action.iconColor} mb-2`} />
                        <span className="text-sm font-medium text-gray-900">{action.title}</span>
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
  );
};

export default EmployeeDashboard;