"use client";
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  Users, 
  Building2, 
  Clock, 
  X, 
  Save, 
  Trash2, 
  Edit,
  Filter,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../lib/supabase";

// Dynamic import for DatePicker (Next.js optimization)
import dynamic from 'next/dynamic';

const DatePicker = dynamic(() => import('react-datepicker'), {
  ssr: false, // Disable SSR for this component
  loading: () => (
    <input 
      type="datetime-local" 
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Loading date picker..."
    />
  )
});

const PlanningCalendar = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord } = useDatabase();
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    project_id: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    estimated_hours: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data when client-side is ready
  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [projectsData, tasksData, usersData] = await Promise.all([
          getAllRecords('projects'),
          getAllRecords('tasks'),
          getAllRecords('users')
        ]);
        
        setProjects(projectsData);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading calendar data:', error);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isClient]);

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(),
      project_id: '',
      assigned_to: '',
      priority: 'medium',
      status: 'pending',
      category: '',
      estimated_hours: ''
    });
    setError('');
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventForm(true);
    setShowEventDetails(false);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      start_date: event.due_date ? new Date(event.due_date) : new Date(),
      end_date: event.due_date ? new Date(event.due_date) : new Date(),
      project_id: event.project_id || '',
      assigned_to: event.assigned_to || '',
      priority: event.priority || 'medium',
      status: event.status || 'pending',
      category: event.category || '',
      estimated_hours: event.estimated_hours?.toString() || ''
    });
    setError('');
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
    setShowEventForm(false);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleDateChange = (date: Date | null, field: 'start_date' | 'end_date') => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date }));
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      // Validate form
      if (!formData.title.trim()) {
        setError('Event title is required');
        setIsLoading(false);
        return;
      }
      
      // Create task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.start_date.toISOString(),
        project_id: formData.project_id || null,
        assigned_to: formData.assigned_to || null,
        assigned_by: user?.id,
        priority: formData.priority,
        status: formData.status,
        category: formData.category,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
      };
      
      if (editingEvent) {
        // Update existing task
        await updateRecord(editingEvent.id, taskData, 'tasks');
        setSuccess('Event updated successfully');
      } else {
        // Create new task
        await createRecord('tasks', taskData);
        setSuccess('Event created successfully');
      }
      
      // Refresh tasks
      const tasksData = await getAllRecords('tasks');
      setTasks(tasksData);
      
      // Close form
      setShowEventForm(false);
      setEditingEvent(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent && !editingEvent) return;
    
    const eventToDelete = selectedEvent || editingEvent;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setIsLoading(true);
        await deleteRecord(eventToDelete.id, 'tasks');
        setSuccess('Event deleted successfully');
        
        // Refresh tasks
        const tasksData = await getAllRecords('tasks');
        setTasks(tasksData);
        
        // Close forms
        setShowEventDetails(false);
        setShowEventForm(false);
        setSelectedEvent(null);
        setEditingEvent(null);
        
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter events
  const filteredEvents = tasks.filter(task => {
    // Apply type filter
    const matchesType = filterType === 'all' || 
                       (filterType === 'task' && !task.project_id) ||
                       (filterType === 'project' && task.project_id);
    
    // Apply project filter
    const matchesProject = filterProject === 'all' || task.project_id === filterProject;
    
    // Apply assignee filter
    const matchesAssignee = filterAssignee === 'all' || 
                           task.assigned_to === filterAssignee || 
                           task.assigned_user?.id === filterAssignee;
    
    return matchesType && matchesProject && matchesAssignee;
  });

  // Generate calendar days for month view
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to show
    const prevMonthDays = [];
    if (firstDayOfWeek > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthDaysCount = prevMonth.getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(year, month - 1, prevMonthDaysCount - i),
          isCurrentMonth: false
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days to fill the grid
    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Generate week days for week view
  const generateWeekDays = () => {
    const weekDays = [];
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDays.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth()
      });
    }
    
    return weekDays;
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => {
      if (!event.due_date) return false;
      const eventDate = new Date(event.due_date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-orange-500';
      case 'low': return 'border-blue-500';
      case 'urgent': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  const renderMonthView = () => {
    const days = generateMonthDays();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map((day, index) => (
            <div key={index} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-gray-200">
          {days.map((day, index) => {
            const events = getEventsForDay(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`min-h-32 p-2 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  {day.isCurrentMonth && (
                    <button 
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          start_date: day.date,
                          end_date: day.date
                        }));
                        handleAddEvent();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1 overflow-y-auto max-h-24">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      onClick={() => handleViewEvent(event)}
                      className={`px-2 py-1 text-xs rounded truncate cursor-pointer ${getStatusColor(event.status)} border-l-4 ${getPriorityColor(event.priority)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = generateWeekDays();
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {days.map((day, index) => {
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`px-2 py-3 text-center ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Week grid */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {days.map((day, index) => {
            const events = getEventsForDay(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`min-h-64 p-2 ${isToday ? 'bg-blue-50' : ''}`}
              >
                {/* Add event button */}
                <div className="flex justify-end mb-2">
                  <button 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        start_date: day.date,
                        end_date: day.date
                      }));
                      handleAddEvent();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Events for this day */}
                <div className="space-y-2 overflow-y-auto max-h-56">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      onClick={() => handleViewEvent(event)}
                      className={`p-2 text-sm rounded cursor-pointer ${getStatusColor(event.status)} border-l-4 ${getPriorityColor(event.priority)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.due_date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDay(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    // Generate time slots
    const timeSlots = [];
    for (let i = 8; i <= 18; i++) { // 8 AM to 6 PM
      timeSlots.push({
        time: `${i}:00`,
        hour: i
      });
    }
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Day header */}
        <div className={`px-6 py-4 border-b border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {formatDate(currentDate)}
              </h3>
            </div>
            <button 
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  start_date: currentDate,
                  end_date: currentDate
                }));
                handleAddEvent();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </button>
          </div>
        </div>
        
        {/* Time slots */}
        <div className="divide-y divide-gray-200">
          {timeSlots.map((slot, index) => {
            const slotEvents = events.filter(event => {
              if (!event.due_date) return false;
              const eventDate = new Date(event.due_date);
              return eventDate.getHours() === slot.hour;
            });
            
            return (
              <div key={index} className="flex">
                <div className="w-20 py-4 px-2 text-right text-sm text-gray-500 border-r border-gray-200">
                  {slot.time}
                </div>
                <div className="flex-1 min-h-16 p-2 relative">
                  {/* Events for this time slot */}
                  <div className="space-y-2">
                    {slotEvents.map((event) => (
                      <div 
                        key={event.id}
                        onClick={() => handleViewEvent(event)}
                        className={`p-2 text-sm rounded cursor-pointer ${getStatusColor(event.status)} border-l-4 ${getPriorityColor(event.priority)}`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs mt-1">{event.description}</div>
                        <div className="text-xs flex items-center mt-1">
                          {event.project?.name && (
                            <span className="flex items-center mr-2">
                              <Building2 className="w-3 h-3 mr-1" />
                              {event.project.name}
                            </span>
                          )}
                          {event.assigned_user?.name && (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {event.assigned_user.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventForm = () => {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseForm}></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event description"
                  ></textarea>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </label>
                  {isClient && (
                    <DatePicker
                      selected={formData.start_date}
                      onChange={(date) => handleDateChange(date, 'start_date')}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <select
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category"
                  />
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimated_hours"
                    value={formData.estimated_hours}
                    onChange={handleFormChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter estimated hours"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
                <div className="flex items-center space-x-4 ml-auto">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2 inline" />
                        Save Event
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseEventDetails}></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                Event Details
              </h3>
              <button
                onClick={handleCloseEventDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Event Title & Description */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h4>
                <p className="text-gray-600">{selectedEvent.description || 'No description'}</p>
              </div>

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h5>
                  <p className="text-gray-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                    {selectedEvent.due_date ? formatDate(new Date(selectedEvent.due_date)) : 'Not set'}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Status</h5>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Project</h5>
                  <p className="text-gray-900 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-green-500" />
                    {selectedEvent.project?.name || 'No project'}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h5>
                  <p className="text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    {selectedEvent.assigned_user?.name || 'Unassigned'}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Priority</h5>
                  <p className={`text-sm font-medium ${
                    selectedEvent.priority === 'high' ? 'text-red-600' :
                    selectedEvent.priority === 'medium' ? 'text-orange-600' :
                    selectedEvent.priority === 'low' ? 'text-blue-600' :
                    selectedEvent.priority === 'urgent' ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {selectedEvent.priority || 'Not set'}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Category</h5>
                  <p className="text-gray-900">
                    {selectedEvent.category || 'Not categorized'}
                  </p>
                </div>

                {selectedEvent.estimated_hours && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Estimated Hours</h5>
                    <p className="text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-orange-500" />
                      {selectedEvent.estimated_hours} hours
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditEvent(selectedEvent)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planning Calendar</h1>
          <p className="text-gray-600">
            Schedule and manage tasks, meetings, and deadlines
          </p>
        </div>
        <button
          onClick={handleAddEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckSquare className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(currentView === 'day' && { day: 'numeric' }),
                ...(currentView === 'week' && { day: 'numeric' })
              })}
              {currentView === 'week' && (
                <span> - {
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() + 6
                  ).toLocaleDateString('en-US', { day: 'numeric' })
                }</span>
              )}
            </h2>
          </div>

          {/* View & Filter Controls */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* View Selector */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setCurrentView('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setCurrentView('week')}
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView('day')}
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === 'day' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="project">Project Tasks</option>
              </select>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Assignees</option>
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {currentView === 'month' && renderMonthView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'day' && renderDayView()}

      {/* Event Form Modal */}
      {showEventForm && renderEventForm()}

      {/* Event Details Modal */}
      {showEventDetails && renderEventDetails()}

      {/* Dynamic CSS import for DatePicker (client-side only) */}
      {isClient && (
        <style jsx global>{`
          @import 'react-datepicker/dist/react-datepicker.css';
        `}</style>
      )}
    </div>
  );
};

export default PlanningCalendar;