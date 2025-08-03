"use client";
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  StopCircle, 
  CheckSquare, 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  Building2, 
  Users, 
  BarChart2, 
  PieChart, 
  Save, 
  X,
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../lib/supabase";
import dynamic from 'next/dynamic';

// Dynamically import chart components to prevent SSR issues
const Chart = dynamic(() => import('react-chartjs-2').then(mod => ({
  Pie: mod.Pie,
  Bar: mod.Bar
})), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading Chart...</p>
    </div>
  )
});

// Dynamically import XLSX to prevent SSR issues
const XLSX = dynamic(() => import('xlsx'), {
  ssr: false
});

// Chart.js registration (client-side only)
let ChartJS: any = null;
let Pie: any = null;
let Bar: any = null;

if (typeof window !== 'undefined') {
  const chartModule = require('chart.js');
  const reactChartModule = require('react-chartjs-2');
  
  ChartJS = chartModule.Chart;
  ChartJS.register(
    chartModule.ArcElement, 
    chartModule.Tooltip, 
    chartModule.Legend, 
    chartModule.CategoryScale, 
    chartModule.LinearScale, 
    chartModule.BarElement, 
    chartModule.Title
  );
  
  Pie = reactChartModule.Pie;
  Bar = reactChartModule.Bar;
}

interface Project {
  id: string;
  name: string;
  status: string;
  description?: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  project_id?: string;
  description?: string;
  created_at: string;
}

interface TimeEntry {
  id: string;
  user_id?: string;
  task_id?: string;
  project_id?: string;
  description: string;
  date: string;
  start_time?: string;
  end_time?: string;
  hours: number;
  status: string;
}

const TimeTracker = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord } = useDatabase();
  const { user } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    task_id: '',
    project_id: '',
    description: '',
    hours: '',
    status: 'completed'
  });
  
  const [dateFilter, setDateFilter] = useState('week');
  const [projectFilter, setProjectFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [projectsData, tasksData] = await Promise.all([
          getAllRecords('projects'),
          getAllRecords('tasks')
        ]);
        
        setProjects(projectsData || []);
        setTasks(tasksData || []);
        
        // Mock time entries data (in a real app, this would come from the database)
        const mockTimeEntries: TimeEntry[] = [
          {
            id: '1',
            user_id: user?.id,
            task_id: tasksData?.[0]?.id,
            project_id: projectsData?.[0]?.id,
            description: 'Working on site inspection',
            date: new Date().toISOString().split('T')[0],
            start_time: new Date(new Date().setHours(9, 0, 0)).toISOString(),
            end_time: new Date(new Date().setHours(11, 30, 0)).toISOString(),
            hours: 2.5,
            status: 'completed'
          },
          {
            id: '2',
            user_id: user?.id,
            task_id: tasksData?.[1]?.id,
            project_id: projectsData?.[0]?.id,
            description: 'Team meeting',
            date: new Date().toISOString().split('T')[0],
            start_time: new Date(new Date().setHours(13, 0, 0)).toISOString(),
            end_time: new Date(new Date().setHours(14, 0, 0)).toISOString(),
            hours: 1,
            status: 'completed'
          }
        ];
        
        setTimeEntries(mockTimeEntries);
      } catch (error) {
        console.error('Error loading time tracker data:', error);
        setError('Failed to load time tracker data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isClient, getAllRecords, user?.id]);

  const startTimer = () => {
    if (!currentTask && !currentDescription) {
      setError('Please select a task or enter a description');
      return;
    }
    
    setError('');
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    setElapsedTime(0);
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTracking(false);
  };

  const resumeTimer = () => {
    setIsTracking(true);
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    if (!startTime) return;
    
    const now = new Date();
    const hours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Create a new time entry
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      user_id: user?.id,
      task_id: currentTask || undefined,
      project_id: currentProject || undefined,
      description: currentDescription || 'Untitled time entry',
      date: now.toISOString().split('T')[0],
      start_time: startTime.toISOString(),
      end_time: now.toISOString(),
      hours: parseFloat(hours.toFixed(2)),
      status: 'completed'
    };
    
    setTimeEntries(prev => [newEntry, ...prev]);
    
    // Reset timer state
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentTask('');
    setCurrentProject('');
    setCurrentDescription('');
    
    setSuccess('Time entry saved successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddEntry = () => {
    setShowEntryForm(true);
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      task_id: '',
      project_id: '',
      description: '',
      hours: '',
      status: 'completed'
    });
    setError('');
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
    setFormData({
      date: entry.date || new Date().toISOString().split('T')[0],
      task_id: entry.task_id || '',
      project_id: entry.project_id || '',
      description: entry.description || '',
      hours: entry.hours?.toString() || '',
      status: entry.status || 'completed'
    });
    setError('');
  };

  const handleCloseForm = () => {
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.date || !formData.hours || parseFloat(formData.hours) <= 0) {
        setError('Please enter a valid date and hours');
        return;
      }
      
      if (!formData.description && !formData.task_id) {
        setError('Please select a task or enter a description');
        return;
      }
      
      // Create or update time entry
      if (editingEntry) {
        // Update existing entry
        const updatedEntry: TimeEntry = {
          ...editingEntry,
          task_id: formData.task_id || undefined,
          project_id: formData.project_id || undefined,
          description: formData.description || 'Untitled time entry',
          date: formData.date,
          hours: parseFloat(formData.hours),
          status: formData.status
        };
        
        setTimeEntries(prev => prev.map(entry => 
          entry.id === editingEntry.id ? updatedEntry : entry
        ));
        
        setSuccess('Time entry updated successfully');
      } else {
        // Create new entry
        const newEntry: TimeEntry = {
          id: Date.now().toString(),
          user_id: user?.id,
          task_id: formData.task_id || undefined,
          project_id: formData.project_id || undefined,
          description: formData.description || 'Untitled time entry',
          date: formData.date,
          start_time: new Date().toISOString(), // Placeholder
          end_time: new Date().toISOString(), // Placeholder
          hours: parseFloat(formData.hours),
          status: formData.status
        };
        
        setTimeEntries(prev => [newEntry, ...prev]);
        
        setSuccess('Time entry added successfully');
      }
      
      // Close form and reset
      setShowEntryForm(false);
      setEditingEntry(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving time entry:', error);
      setError('Failed to save time entry. Please try again.');
    }
  };

  const handleDeleteEntry = (entry: TimeEntry) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this time entry?')) {
      setTimeEntries(prev => prev.filter(e => e.id !== entry.id));
      setSuccess('Time entry deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleExportTimesheet = async () => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      const xlsxModule = await import('xlsx');
      
      // Prepare data for export
      const dataToExport = timeEntries.map(entry => ({
        date: entry.date,
        task: tasks.find(t => t.id === entry.task_id)?.title || 'No task',
        project: projects.find(p => p.id === entry.project_id)?.name || 'No project',
        description: entry.description,
        hours: entry.hours,
        status: entry.status
      }));
      
      // Create a worksheet from the data
      const worksheet = xlsxModule.utils.json_to_sheet(dataToExport);
      
      // Create a workbook and add the worksheet
      const workbook = xlsxModule.utils.book_new();
      xlsxModule.utils.book_append_sheet(workbook, worksheet, 'Timesheet');
      
      // Generate the file and trigger download
      xlsxModule.writeFile(workbook, `timesheet_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setSuccess('Timesheet exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting timesheet:', error);
      setError('Failed to export timesheet. Please try again.');
    }
  };

  // Filter time entries
  const filteredEntries = timeEntries.filter(entry => {
    // Apply date filter
    let matchesDate = true;
    const entryDate = new Date(entry.date);
    const today = new Date();
    
    if (dateFilter === 'today') {
      matchesDate = entryDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      matchesDate = entryDate >= weekStart;
    } else if (dateFilter === 'month') {
      matchesDate = entryDate.getMonth() === today.getMonth() && 
                   entryDate.getFullYear() === today.getFullYear();
    }
    
    // Apply project filter
    const matchesProject = projectFilter === 'all' || entry.project_id === projectFilter;
    
    // Apply search filter
    const matchesSearch = 
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tasks.find(t => t.id === entry.task_id)?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projects.find(p => p.id === entry.project_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesProject && (searchTerm ? matchesSearch : true);
  });

  // Calculate total hours
  const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

  // Prepare chart data
  const timeByProjectData = {
    labels: projects.map(p => p.name),
    datasets: [
      {
        data: projects.map(project => 
          timeEntries
            .filter(entry => entry.project_id === project.id)
            .reduce((sum, entry) => sum + (entry.hours || 0), 0)
        ),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ]
      }
    ]
  };

  const timeByDayData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Hours',
        data: [1, 2, 3, 4, 5, 6, 0].map(day => {
          const dayOfWeek = day === 0 ? 6 : day - 1; // Adjust for Sunday being 0
          return timeEntries
            .filter(entry => {
              const entryDate = new Date(entry.date);
              return entryDate.getDay() === dayOfWeek;
            })
            .reduce((sum, entry) => sum + (entry.hours || 0), 0);
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  };

  const ChartComponent: React.FC<{ type: 'pie' | 'bar'; data: any; options?: any }> = ({ type, data, options }) => {
    if (!isClient || !Pie || !Bar) {
      return (
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading Chart...</p>
        </div>
      );
    }

    const defaultOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
      ...options
    };

    return type === 'pie' ? 
      <Pie data={data} options={defaultOptions} /> : 
      <Bar data={data} options={defaultOptions} />;
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Time Tracker...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading time tracker data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Tracker</h1>
          <p className="text-gray-600">
            Track and manage your working hours
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddEntry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </button>
          <button
            onClick={handleExportTimesheet}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
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

      {/* Time Tracker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Track Your Time
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Task Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task (Optional)
            </label>
            <select
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              disabled={isTracking}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select Task</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project (Optional)
            </label>
            <select
              value={currentProject}
              onChange={(e) => setCurrentProject(e.target.value)}
              disabled={isTracking}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              disabled={isTracking}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="What are you working on?"
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">
            {formatElapsedTime(elapsedTime)}
          </div>
          <div className="flex items-center space-x-4">
            {!isTracking && elapsedTime === 0 && (
              <button
                onClick={startTimer}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </button>
            )}
            {isTracking && (
              <button
                onClick={pauseTimer}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </button>
            )}
            {!isTracking && elapsedTime > 0 && (
              <button
                onClick={resumeTimer}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </button>
            )}
            {elapsedTime > 0 && (
              <button
                onClick={stopTimer}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Stop & Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Time Entries & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time Entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date Filter */}
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Time Entries Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Time Entries
              </h3>
              <div className="text-sm text-gray-600">
                Total: <span className="font-bold">{totalHours.toFixed(2)} hours</span>
              </div>
            </div>
            
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No time entries found</p>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Manual Entry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Task/Description</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tasks.find(t => t.id === entry.task_id)?.title || 'No task'}
                          </div>
                          <div className="text-xs text-gray-500">{entry.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {projects.find(p => p.id === entry.project_id)?.name || 'No project'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.hours} h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Time Reports */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-green-600" />
              Time Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(2)} h</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Today</p>
                  <p className="text-lg font-bold text-gray-900">
                    {timeEntries
                      .filter(entry => new Date(entry.date).toDateString() === new Date().toDateString())
                      .reduce((sum, entry) => sum + (entry.hours || 0), 0)
                      .toFixed(2)} h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">This Week</p>
                  <p className="text-lg font-bold text-gray-900">
                    {timeEntries
                      .filter(entry => {
                        const entryDate = new Date(entry.date);
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        return entryDate >= weekStart;
                      })
                      .reduce((sum, entry) => sum + (entry.hours || 0), 0)
                      .toFixed(2)} h
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Projects Breakdown</p>
                <div className="space-y-2 mt-2">
                  {projects.map(project => {
                    const projectHours = timeEntries
                      .filter(entry => entry.project_id === project.id)
                      .reduce((sum, entry) => sum + (entry.hours || 0), 0);
                    
                    if (projectHours === 0) return null;
                    
                    return (
                      <div key={project.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{project.name}</span>
                        <span className="text-sm font-medium text-gray-900">{projectHours.toFixed(2)} h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Time by Project Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Time by Project
            </h3>
            <div className="h-64">
              {timeEntries.length > 0 ? (
                <ChartComponent type="pie" data={timeByProjectData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No time data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time by Day Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-purple-600" />
              Time by Day
            </h3>
            <div className="h-64">
              {timeEntries.length > 0 ? (
                <ChartComponent 
                  type="bar" 
                  data={timeByDayData} 
                  options={{ 
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No time data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Entry Form Modal */}
      {showEntryForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50" onClick={handleCloseForm}></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitEntry} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours *
                    </label>
                    <input
                      type="number"
                      name="hours"
                      value={formData.hours}
                      onChange={handleFormChange}
                      required
                      min="0.1"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter hours"
                    />
                  </div>

                  {/* Task */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task
                    </label>
                    <select
                      name="task_id"
                      value={formData.task_id}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Task</option>
                      {tasks.map(task => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
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
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
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
                      placeholder="Enter description"
                    ></textarea>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {editingEntry && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(editingEntry)}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;