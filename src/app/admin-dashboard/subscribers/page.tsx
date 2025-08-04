"use client";
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Download,
  RefreshCw,
  Eye,
  Clock,
  Calendar,
  Send,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDatabase } from '../../../contexts/DatabaseContext';
import { useAuth } from "../../../contexts/AuthContext";
import { Subscriber } from '../../types/Subscriber';
import { supabase } from "../../../lib/supabase";
import dynamic from 'next/dynamic';

// Dynamically import XLSX to prevent SSR issues
const XLSX = dynamic(() => import('xlsx'), {
  ssr: false
});

// Dynamically import toast to prevent SSR issues
const toast = dynamic(() => import('react-toastify').then(mod => mod.toast), {
  ssr: false
});

// Dynamically import ToastContainer for client-side only
const ToastContainer = dynamic(() => import('react-toastify').then(mod => mod.ToastContainer), {
  ssr: false
});

interface SubscriberPreferences {
  news: boolean;
  projects: boolean;
  announcements: boolean;
  blog: boolean;
}

interface SubscriberFormData {
  email: string;
  status: string;
  source: string;
  preferences: SubscriberPreferences;
}

const SubscriberManagement = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord } = useDatabase();
  const { user } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const subscribersPerPage = 15;
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

  const [formData, setFormData] = useState<SubscriberFormData>({
    email: '',
    status: 'active',
    source: 'manual',
    preferences: {
      news: true,
      projects: true,
      announcements: true,
      blog: true
    }
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      loadSubscribers();
    }
  }, [isClient]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (!isClient || typeof window === 'undefined') return;
    
    // Use dynamic import for toast functionality
    import('react-toastify').then(({ toast }) => {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
    });
  };

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const subscribersData = await getAllRecords('newsletter_subscribers');
      setSubscribers(subscribersData || []);
    } catch (error) {
      console.error('Error loading subscribers data:', error);
      setError('Failed to load subscribers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadSubscribers();
    showToast('Subscriber list refreshed');
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingSubscriber(null);
    setFormData({
      email: '',
      status: 'active',
      source: 'manual',
      preferences: {
        news: true,
        projects: true,
        announcements: true,
        blog: true
      }
    });
    setError('');
  };

  const handleEditClick = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setShowCreateForm(false);
    setFormData({
      email: subscriber.email || '',
      status: subscriber.status || 'active',
      source: subscriber.source || 'manual',
      preferences: subscriber.preferences || {
        news: true,
        projects: true,
        announcements: true,
        blog: true
      }
    });
    setError('');
  };

  const handleViewSubscriber = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedSubscriber(null);
    setViewMode('list');
  };

  const handleDeleteClick = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber);
    setDeleteConfirmModalOpen(true);
  };

  const confirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;

    try {
      setIsLoading(true);
      await deleteRecord(subscriberToDelete.id, 'newsletter_subscribers');
      showToast('Subscriber deleted');
      await loadSubscribers();
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete subscriber', 'error');
    } finally {
      setDeleteConfirmModalOpen(false);
      setSubscriberToDelete(null);
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: checked
      }
    }));
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      // Validate form
      if (!formData.email.trim()) {
        setError('Email is required');
        setIsLoading(false);
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      
      // Create subscriber
      const subscriberData = {
        email: formData.email.trim().toLowerCase(),
        status: formData.status,
        source: formData.source,
        preferences: formData.preferences,
        subscribed_at: new Date().toISOString()
      };
      
      await createRecord('newsletter_subscribers', subscriberData);
      showToast('Subscriber added successfully');
      setShowCreateForm(false);
      
      // Refresh subscribers
      await loadSubscribers();
    } catch (error) {
      console.error('Error creating subscriber:', error);
      setError('Failed to add subscriber. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscriber) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Validate form
      if (!formData.email.trim()) {
        setError('Email is required');
        setIsLoading(false);
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      
      // Update subscriber
      const subscriberData = {
        email: formData.email.trim().toLowerCase(),
        status: formData.status,
        source: formData.source,
        preferences: formData.preferences,
        updated_at: new Date().toISOString()
      };
      
      await updateRecord(editingSubscriber.id, subscriberData, 'newsletter_subscribers');
      showToast('Subscriber updated successfully');
      setEditingSubscriber(null);
      
      // Refresh subscribers
      await loadSubscribers();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      setError('Failed to update subscriber. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSubscribers = async () => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      const xlsxModule = await import('xlsx');
      
      // Prepare data for export
      const dataToExport = subscribers.map(subscriber => ({
        email: subscriber.email || '',
        status: subscriber.status || '',
        source: subscriber.source || '',
        subscribed_at: subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleString() : '',
        news: subscriber.preferences?.news ? 'Yes' : 'No',
        projects: subscriber.preferences?.projects ? 'Yes' : 'No',
        announcements: subscriber.preferences?.announcements ? 'Yes' : 'No',
        blog: subscriber.preferences?.blog ? 'Yes' : 'No'
      }));
      
      // Create a worksheet from the data
      const worksheet = xlsxModule.utils.json_to_sheet(dataToExport);
      
      // Create a workbook and add the worksheet
      const workbook = xlsxModule.utils.book_new();
      xlsxModule.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
      
      // Generate the file and trigger download
      xlsxModule.writeFile(workbook, `subscribers_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast('Subscribers exported successfully');
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      showToast('Failed to export subscribers. Please try again.', 'error');
    }
  };

  // Get unique sources for filter
  const sources = [...new Set(subscribers.map(s => s.source).filter(Boolean))];

  const filteredSubscribers = subscribers.filter(subscriber => {
    // Apply search filter - safely handle undefined/null email
    const email = subscriber.email || '';
    const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    
    // Apply source filter
    const matchesSource = sourceFilter === 'all' || subscriber.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
  const startIndex = (currentPage - 1) * subscribersPerPage;
  const currentSubscribers = filteredSubscribers.slice(startIndex, startIndex + subscribersPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter]);

  const getStatusColor = (status: string = '') => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unsubscribed': return 'bg-gray-100 text-gray-800';
      case 'bounced': return 'bg-yellow-100 text-yellow-800';
      case 'complained': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string = '') => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'unsubscribed': return <XCircle className="w-4 h-4 mr-1" />;
      case 'bounced': return <AlertCircle className="w-4 h-4 mr-1" />;
      case 'complained': return <AlertCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const renderSubscriberForm = (isCreate: boolean) => {
    const formTitle = isCreate ? 'Add New Subscriber' : 'Edit Subscriber';
    const submitHandler = isCreate ? handleSubmitCreate : handleSubmitEdit;
    const cancelHandler = isCreate ? () => setShowCreateForm(false) : () => setEditingSubscriber(null);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            {formTitle}
          </h3>
          <button
            onClick={cancelHandler}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
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
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
                <option value="complained">Complained</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="manual">Manual Entry</option>
                <option value="website">Website</option>
                <option value="footer">Footer Form</option>
                <option value="news_page">News Page</option>
                <option value="import">Import</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Preferences */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.news}
                    onChange={(e) => handlePreferenceChange('news', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">News</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.projects}
                    onChange={(e) => handlePreferenceChange('projects', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Projects</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.announcements}
                    onChange={(e) => handlePreferenceChange('announcements', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Announcements</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.blog}
                    onChange={(e) => handlePreferenceChange('blog', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Blog</span>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={cancelHandler}
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
                  {isCreate ? 'Adding...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {isCreate ? 'Add Subscriber' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderSubscriberDetail = () => {
    if (!selectedSubscriber) return null;
    
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToList}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedSubscriber.email || 'No Email'}</h2>
            <p className="text-gray-600">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSubscriber.status)}`}>
                {getStatusIcon(selectedSubscriber.status)}
                {selectedSubscriber.status}
              </span>
            </p>
          </div>
        </div>
        
        {/* Subscriber Details */}
       <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Subscriber Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedSubscriber.email || 'No Email'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSubscriber.status)}`}>
                  {getStatusIcon(selectedSubscriber.status)}
                  {selectedSubscriber.status}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedSubscriber.source || 'Unknown'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Subscribed At</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {formatDate(selectedSubscriber.subscribed_at)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditClick(selectedSubscriber)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Subscriber
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedSubscriber)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              Content Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">News</span>
                {selectedSubscriber.preferences?.news ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Projects</span>
                {selectedSubscriber.preferences?.projects ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Announcements</span>
                {selectedSubscriber.preferences?.announcements ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Blog</span>
                {selectedSubscriber.preferences?.blog ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Activity History
            </h3>
          </div>
          
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No activity history available</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Send Test Email
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Subscriber Management...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail') {
    return (
      <>
        {renderSubscriberDetail()}
        {isClient && <ToastContainer position="top-right" autoClose={3000} />}
      </>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
          <p className="text-gray-600">
            Manage your email newsletter subscribers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportSubscribers}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && renderSubscriberForm(true)}
      {editingSubscriber && renderSubscriberForm(false)}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <p className="text-sm text-gray-600">
            Showing {currentSubscribers.length} of {filteredSubscribers.length} subscribers
            {filteredSubscribers.length !== subscribers.length && ` (filtered from ${subscribers.length} total)`}
            • 15 per page
          </p>
        </div>
         <div className="grid lg:grid-cols-4 gap-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
              <option value="complained">Complained</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>
                  {source ? source.charAt(0).toUpperCase() + source.slice(1) : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading subscribers...</p>
            </div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Mail className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No subscribers found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or add a new subscriber</p>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Subscriber
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => handleViewSubscriber(subscriber)}
                      >
                        {subscriber.email || 'No Email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscriber.status)}`}>
                        {getStatusIcon(subscriber.status)}
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {subscriber.source || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.subscribed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {subscriber.preferences?.news && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">News</span>
                        )}
                        {subscriber.preferences?.projects && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Projects</span>
                        )}
                        {subscriber.preferences?.announcements && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Announcements</span>
                        )}
                        {subscriber.preferences?.blog && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Blog</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewSubscriber(subscriber)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(subscriber)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subscriber)}
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

      {/* Pagination Controls */}
      {filteredSubscribers.length > subscribersPerPage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + subscribersPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {/* First page */}
                {totalPages > 1 && (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    1
                  </button>
                )}

                {/* Ellipsis if needed */}
                {currentPage > 3 && totalPages > 5 && (
                  <span className="px-2 py-2 text-gray-500">...</span>
                )}

                {/* Pages around current */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return page > 1 && page < totalPages;
                    if (currentPage <= 3) return page > 1 && page <= 4 && page < totalPages;
                    if (currentPage >= totalPages - 2) return page >= totalPages - 3 && page > 1 && page < totalPages;
                    return page >= currentPage - 1 && page <= currentPage + 1;
                  })
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Ellipsis if needed */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <span className="px-2 py-2 text-gray-500">...</span>
                )}

                {/* Last page */}
                {totalPages > 1 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>{subscriberToDelete?.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button> 
              <button
                onClick={confirmDeleteSubscriber}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      {isClient && <ToastContainer position="top-right" autoClose={3000} />}
    </div>
  );
};

export default SubscriberManagement;