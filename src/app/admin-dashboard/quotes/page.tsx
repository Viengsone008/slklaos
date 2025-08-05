"use client";
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Plus, Search, Filter, Mail, Phone, Building2, User, FileText, CheckCircle, XCircle,  
  Edit, Trash2, Save, X, Calendar, Clock, Star, ArrowUpRight, ArrowDownRight, UserPlus, MessageSquare, MapPin, Eye, Download,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useDatabase } from '../../../contexts/DatabaseContext';
import { useAuth } from '../../../contexts/AuthContext';

interface Quote {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  project_type?: string;
  budget_range?: string;
  timeline?: string;
  location?: string;
  description?: string;
  preferred_contact?: string;
  status: string;
  priority?: string;
  source?: string;
  assigned_to?: string;
  follow_up_date?: string;
  lead_score?: number;
  estimated_value?: number;
  quoted_amount?: number;
  win_probability?: number;
  assigned_user?: { id: string; name: string };
  project_details?: {
    type?: string;
    budgetRange?: string;
    timelineCategory?: string;
    location?: string;
    description?: string;
  };
  sales_tracking?: {
    assignedTo?: string;
    salesStage?: string;
    winProbability?: number;
  };
  customer_profile?: {
    fullName: string;
    companyName?: string;
    leadScore?: number;
  };
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  location: string;
  description: string;
  preferred_contact: string;
  status: string;
  priority: string;
  source: string;
  assigned_to: string;
  follow_up_date: string;
  lead_score: string;
  estimated_value: string;
  quoted_amount: string;
  win_probability: string;
}

const QuoteManagement: React.FC = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord, clearCache } = useDatabase();
  const { user } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const quotesPerPage = 15;

  useEffect(() => { setIsClient(true); }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    project_type: '',
    budget_range: '',
    timeline: '',
    location: '',
    description: '',
    preferred_contact: 'email',
    status: 'new',
    priority: 'medium',
    source: 'website',
    assigned_to: '',
    follow_up_date: '',
    lead_score: '50',
    estimated_value: '',
    quoted_amount: '',
    win_probability: '30'
  });

  const projectTypes = [
    'residential', 'commercial', 'industrial', 'renovation', 'waterproofing', 'flooring', 'materials', 'consultation'
  ];
  const budgetRanges = [
    'under-10000', '10000-25000', '25000-50000', '50000-100000', '100000-250000', '250000-500000', 'over-500000'
  ];
  const timelineOptions = [
    'asap', '1-3months', '3-6months', '6-12months', 'over-1year', 'flexible'
  ];

  // Always fetch fresh data
  const loadData = async (forceRefresh = false) => {
    if (!isClient) return;
    setIsLoading(true);
    try {
      console.log('📊 Loading data...', forceRefresh ? '(force refresh)' : '');
      
      // If forcing refresh, clear cache first
      if (forceRefresh) {
        clearCache();
      }
      
      const [quotesData, usersData] = await Promise.all([
        getAllRecords('quotes'),
        getAllRecords('users')
      ]);
      
      const processedQuotes = Array.isArray(quotesData) ? quotesData : [];
      const processedUsers = Array.isArray(usersData) ? usersData : [];
      
      console.log('📊 Raw data received:', {
        quotes: processedQuotes.length,
        users: processedUsers.length,
        quotesIds: processedQuotes.map(q => q.id).slice(0, 5) // Show first 5 IDs
      });
      
      setQuotes(processedQuotes);
      setUsers(processedUsers);
      setRefreshKey(prev => prev + 1); // Force re-render
      
      console.log('✅ State updated:', {
        quotesCount: processedQuotes.length,
        usersCount: processedUsers.length,
        refreshKey: refreshKey + 1
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh function
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing all data...');
    
    // Clear all caches first
    clearCache(); // Clear all cached data
    clearCache('quotes'); // Clear quotes specifically
    clearCache('users'); // Clear users specifically
    
    // Force re-render
    setRefreshKey(prev => prev + 1);
    
    // Load fresh data
    await loadData(true);
    
    console.log('✅ Force refresh completed');
  };

  useEffect(() => {
    if (isClient) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Watch for changes in quotes array and log them
  useEffect(() => {
    console.log('📊 Quotes array updated:', {
      count: quotes.length,
      refreshKey,
      quotesIds: quotes.map(q => q.id).slice(0, 10)
    });
  }, [quotes, refreshKey]);

  // Test function to simulate delete without database call
  const testDelete = (quoteId: string) => {
    console.log('🧪 Testing delete for quote:', quoteId);
    setQuotes(prevQuotes => {
      const filtered = prevQuotes.filter(q => q.id !== quoteId);
      console.log('🧪 Test delete result:', {
        before: prevQuotes.length,
        after: filtered.length,
        removedId: quoteId
      });
      return filtered;
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteClick = (quote: Quote) => {
    setQuoteToDelete(quote);
    setDeleteConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!quoteToDelete) return;
    
    const quoteIdToDelete = quoteToDelete.id;
    const quoteNameToDelete = quoteToDelete.name;
    
    try {
      setIsDeleting(true);
      setIsLoading(true);
      setError('');
      
      console.log('🗑️ Starting delete operation for quote:', quoteIdToDelete, quoteNameToDelete);
      
      // Step 1: Close modal immediately for better UX
      setDeleteConfirmModalOpen(false);
      setQuoteToDelete(null);
      
      // Step 2: Optimistically update the UI immediately
      console.log('� Optimistically updating UI...');
      setQuotes(prevQuotes => {
        const filteredQuotes = prevQuotes.filter(q => q.id !== quoteIdToDelete);
        console.log(`✅ Optimistic update: ${prevQuotes.length} → ${filteredQuotes.length} quotes`);
        return filteredQuotes;
      });
      
      // Force immediate re-render
      setRefreshKey(prev => prev + 1);
      
      // Step 3: Delete from database
      console.log('🗑️ Deleting from database...');
      await deleteRecord(quoteIdToDelete, 'quotes');
      console.log('✅ Database deletion successful');
      
      // Step 4: Clear all caches to ensure fresh data
      console.log('🧹 Clearing all caches...');
      clearCache('quotes');
      clearCache('users');
      clearCache(); // Clear all caches
      
      // Step 5: Force complete data refresh
      console.log('🔄 Forcing complete data refresh...');
      setTimeout(async () => {
        try {
          await forceRefresh();
          console.log('✅ Complete refresh successful');
        } catch (refreshError) {
          console.error('❌ Error during complete refresh:', refreshError);
          // If refresh fails, try to reload data manually
          await loadData(true);
        }
      }, 100);
      
      // Step 6: Show success message
      setSuccess(`Quote "${quoteNameToDelete}" deleted successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      setError(`Failed to delete quote "${quoteNameToDelete}". Please try again.`);
      
      // If delete failed, revert optimistic update and refresh everything
      try {
        console.log('🔄 Reverting optimistic update and refreshing...');
        clearCache();
        await forceRefresh();
      } catch (refreshError) {
        console.error('❌ Error during error recovery:', refreshError);
        // Force page reload as last resort
        window.location.reload();
      }
      
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Name and email are required');
        setIsLoading(false);
        return;
      }
      const quoteData = {
        ...formData,
        follow_up_date: formData.follow_up_date ? formData.follow_up_date : null,
        lead_score: parseInt(formData.lead_score) || 50,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        quoted_amount: formData.quoted_amount ? parseFloat(formData.quoted_amount) : null,
        win_probability: parseInt(formData.win_probability) || 30,
        customer_profile: {
          fullName: formData.name.trim(),
          companyName: formData.company?.trim() || null,
          leadScore: parseInt(formData.lead_score) || 50
        },
        project_details: {
          type: formData.project_type || null,
          budgetRange: formData.budget_range || null,
          estimatedBudget: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
          timelineCategory: formData.timeline || null,
          location: formData.location?.trim() || null,
          description: formData.description?.trim() || null
        },
        sales_tracking: {
          assignedTo: formData.assigned_to || null,
          salesStage: formData.status || 'new',
          winProbability: parseInt(formData.win_probability) || 30
        }
      };
      await createRecord('quotes', quoteData);
      setSuccess('Quote created successfully');
      setShowCreateForm(false);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to create quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingQuote(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      project_type: '',
      budget_range: '',
      timeline: '',
      location: '',
      description: '',
      preferred_contact: 'email',
      status: 'new',
      priority: 'medium',
      source: 'website',
      assigned_to: '',
      follow_up_date: '',
      lead_score: '50',
      estimated_value: '',
      quoted_amount: '',
      win_probability: '30'
    });
    setError('');
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;
    try {
      setIsLoading(true);
      setError('');
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Name and email are required');
        setIsLoading(false);
        return;
      }
      const quoteData = {
        ...formData,
        follow_up_date: formData.follow_up_date ? formData.follow_up_date : null,
        lead_score: parseInt(formData.lead_score) || 50,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        quoted_amount: formData.quoted_amount ? parseFloat(formData.quoted_amount) : null,
        win_probability: parseInt(formData.win_probability) || 30,
        customer_profile: {
          ...(editingQuote.customer_profile || {}),
          fullName: formData.name.trim(),
          companyName: formData.company?.trim() || null,
          leadScore: parseInt(formData.lead_score) || 50
        },
        project_details: {
          ...(editingQuote.project_details || {}),
          type: formData.project_type || null,
          budgetRange: formData.budget_range || null,
          estimatedBudget: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
          timelineCategory: formData.timeline || null,
          location: formData.location?.trim() || null,
          description: formData.description?.trim() || null
        },
        sales_tracking: {
          ...(editingQuote.sales_tracking || {}),
          assignedTo: formData.assigned_to || null,
          salesStage: formData.status || 'new',
          winProbability: parseInt(formData.win_probability) || 30
        }
      };
      await updateRecord(editingQuote.id, quoteData, 'quotes');
      setSuccess('Quote updated successfully');
      setEditingQuote(null);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update quote:', error);
      setError('Failed to update quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedQuote(null);
    setViewMode('list');
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('detail');
  };

  const handleEditClick = (quote: Quote) => {
    setEditingQuote(quote);
    setShowCreateForm(false); // Only show edit form
    setFormData({
      name: quote.name || '',
      email: quote.email || '',
      phone: quote.phone || '',
      company: quote.company || '',
      project_type: quote.project_type || quote.project_details?.type || '',
      budget_range: quote.budget_range || quote.project_details?.budgetRange || '',
      timeline: quote.timeline || quote.project_details?.timelineCategory || '',
      location: quote.location || quote.project_details?.location || '',
      description: quote.description || quote.project_details?.description || '',
      preferred_contact: quote.preferred_contact || 'email',
      status: quote.status || 'new',
      priority: quote.priority || 'medium',
      source: quote.source || 'website',
      assigned_to: quote.assigned_to || '',
      follow_up_date: quote.follow_up_date || '',
      lead_score: quote.lead_score?.toString() || '50',
      estimated_value: quote.estimated_value?.toString() || '',
      quoted_amount: quote.quoted_amount?.toString() || '',
      win_probability: quote.win_probability?.toString() || '30'
    });
  };

  const uniqueProjectTypes = [...new Set(quotes.map(q => q.project_type).filter(Boolean))];

  const filteredQuotes = quotes.filter(quote => {
    // Apply search filter
    const matchesSearch = 
      quote.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    // Apply project type filter
    const matchesProjectType = projectTypeFilter === 'all' || quote.project_type === projectTypeFilter;
    
    // Apply assignee filter
    const matchesAssignee = assigneeFilter === 'all' || 
                           quote.assigned_to === assigneeFilter || 
                           quote.assigned_user?.id === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesProjectType && matchesAssignee;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const currentQuotes = filteredQuotes.slice(
    (currentPage - 1) * quotesPerPage,
    currentPage * quotesPerPage
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, projectTypeFilter, assigneeFilter]);

  // Reset to page 1 if current page is empty after deletion
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-purple-100 text-purple-800';
      case 'quoted': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <FileText className="w-4 h-4 mr-1" />;
      case 'reviewing': return <Search className="w-4 h-4 mr-1" />;
      case 'quoted': return <DollarSign className="w-4 h-4 mr-1" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'rejected': return <XCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number | string) => {
    if (!value) return '$0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudgetRange = (range: string) => {
    if (!range) return 'Not specified';
    
    const formatted = range.replace(/-/g, ' - $').replace('under', 'Under $').replace('over', 'Over $');
    return formatted;
  };

  const formatTimeline = (timeline: string) => {
    if (!timeline) return 'Not specified';
    
    const timelineMap: {[key: string]: string} = {
      'asap': 'As Soon As Possible',
      '1-3months': '1-3 Months',
      '3-6months': '3-6 Months',
      '6-12months': '6-12 Months',
      'over-1year': 'Over 1 Year',
      'flexible': 'Flexible'
    };
    
    return timelineMap[timeline] || timeline;
  };

  const renderQuoteForm = (isCreate: boolean) => {
    const formTitle = isCreate ? 'Add New Quote' : 'Edit Quote';
    const submitHandler = isCreate ? handleSubmitCreate : handleSubmitEdit;
    const cancelHandler = isCreate ? () => setShowCreateForm(false) : () => setEditingQuote(null);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Client Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Project Details</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    name="project_type"
                    value={formData.project_type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-10000">Under $10,000</option>
                    <option value="10000-25000">$10,000 - $25,000</option>
                    <option value="25000-50000">$25,000 - $50,000</option>
                    <option value="50000-100000">$50,000 - $100,000</option>
                    <option value="100000-250000">$100,000 - $250,000</option>
                    <option value="250000-500000">$250,000 - $500,000</option>
                    <option value="over-500000">Over $500,000</option>
                  </select>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-3months">1-3 months</option>
                    <option value="3-6months">3-6 months</option>
                    <option value="6-12months">6-12 months</option>
                    <option value="over-1year">Over 1 year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter project location"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter project description"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Preferences</h4>
              <div className="space-y-4">
                {/* Preferred Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    name="preferred_contact"
                    value={formData.preferred_contact}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="both">Both</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="website">Website</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quote Management */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Quote Management</h4>
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                  >
                    <option value="">Unassigned</option>
                    {Array.isArray(users) && users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="datetime-local"
                    name="follow_up_date"
                    value={formData.follow_up_date}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Quote Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Quote Details</h4>
              <div className="space-y-4">
                {/* Estimated Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="estimated_value"
                      value={formData.estimated_value}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                      placeholder="Enter estimated value"
                    />
                  </div>
                </div>

                {/* Quoted Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quoted Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="quoted_amount"
                      value={formData.quoted_amount}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                      placeholder="Enter quoted amount"
                    />
                  </div>
                </div>

                {/* Win Probability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Win Probability (0-100%)
                  </label>
                  <input
                    type="number"
                    name="win_probability"
                    value={formData.win_probability}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter win probability"
                  />
                </div>

                {/* Lead Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Score (0-100)
                  </label>
                  <input
                    type="number"
                    name="lead_score"
                    value={formData.lead_score}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
                    placeholder="Enter lead score"
                  />
                </div>
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  {isCreate ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {isCreate ? 'Add Quote' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderQuoteDetail = () => {
    if (!selectedQuote) return null;
    
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
            <h2 className="text-2xl font-bold text-gray-900">{selectedQuote.name}</h2>
            <p className="text-gray-600">{selectedQuote.email} • {selectedQuote.phone || 'No phone'}</p>
          </div>
        </div>
        
        {/* Quote Details */}
      <div className="grid lg:grid-cols-3 gap-8">
          {/* Client Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Client Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedQuote.name}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedQuote.email}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedQuote.phone || 'Not provided'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedQuote.company || 'Not provided'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Preferred Contact</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedQuote.preferred_contact || 'Email'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedQuote.source || 'Website'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Project Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              Project Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Project Type</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedQuote.project_details?.type || 'Not specified'}
                </p>
              </div>
       
              <div>
                <p className="text-sm text-gray-500">Budget Range</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatBudgetRange(selectedQuote.project_details?.budgetRange || '')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTimeline(selectedQuote.project_details?.timelineCategory || '')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedQuote.project_details?.location || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedQuote.project_details?.description || 'No description provided'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quote Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
              Quote Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedQuote.status)}`}>
                  {getStatusIcon(selectedQuote.status)}
                  {selectedQuote.status || 'New'}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p className={`text-sm font-medium ${getPriorityColor(selectedQuote.priority || '')} capitalize`}>
                  {selectedQuote.priority || 'Medium'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedQuote.assigned_user?.name || 'Unassigned'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Follow-up Date</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedQuote.follow_up_date ? formatDate(selectedQuote.follow_up_date) : 'Not scheduled'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Estimated Value</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedQuote.estimated_value || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quoted Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedQuote.quoted_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Win Probability</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedQuote.win_probability || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-900">{selectedQuote.win_probability || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lead Score</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedQuote.lead_score || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-900">{selectedQuote.lead_score || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditClick(selectedQuote)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Quote
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedQuote)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <FileText className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Generate Quote</span>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <Mail className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Send Email</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <Building2 className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Project</span>
            </button>
          </div>
        </div>
        
        {/* Quote History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Quote History
            </h3>
          </div>
          
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No quote history available</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Add Quote Revision
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Only render one form at a time
  const renderForms = () => {
    if (editingQuote) return renderQuoteForm(false);
    if (showCreateForm) return renderQuoteForm(true);
    return null;
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Quote Management...</p>
        </div>
      </div>
    );
  } 

  const handleExportQuotes = () => {
    if (filteredQuotes.length === 0) return;

    const csvRows: string[] = [];
    csvRows.push([
      "ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Project Type",
      "Budget Range",
      "Timeline",
      "Location",
      "Description",
      "Preferred Contact",
      "Status",
      "Priority",
      "Source",
      "Assigned To",
      "Follow Up Date",
      "Lead Score",
      "Estimated Value",
      "Quoted Amount",
      "Win Probability"
    ].join(","));

    filteredQuotes.forEach(q => {
      csvRows.push([
        q.id,
        q.name,
        q.email,
        q.phone || "",
        q.company || "",
        q.project_type || "",
        q.budget_range || "",
        q.timeline || "",
        q.location || "",
        (q.description || "").replace(/"/g, '""'),
        q.preferred_contact || "",
        q.status || "",
        q.priority || "",
        q.assigned_user?.name || q.assigned_to || "",
        q.follow_up_date || "",
        q.lead_score?.toString() || "",
        q.estimated_value?.toString() || "",
        q.quoted_amount?.toString() || "",
        q.win_probability?.toString() || ""
      ].map(val => `"${val}"`).join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "quotes.csv");
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (viewMode === 'detail') {
    return renderQuoteDetail();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Management</h1>
          <p className="text-gray-600">
            Manage project quotes and estimates
          </p>
        </div>
        <div className="flex gap-2">
          
          <button
            onClick={forceRefresh}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            disabled={isLoading}
          >
            <Search size={18} /> {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={18} /> Add New Quote
          </button>
             <button
            onClick={handleExportQuotes}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            disabled={filteredQuotes.length === 0}
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Only one form at a time */}
      {renderForms()}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
         <div className="grid lg:grid-cols-4 gap-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Project Type Filter */}
          <div>
            <select
              value={projectTypeFilter}
              onChange={(e) => setProjectTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
            >
              <option value="all">All Project Types</option>
              {uniqueProjectTypes.map(type => (
                <option key={type} value={type}>
                  {type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-700"
            >
              <option value="all">All Assignees</option>
              <option value="">Unassigned</option>
              {Array.isArray(users) && users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Quote</h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete <strong>{quoteToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200" key={`quotes-section-${refreshKey}`}>
        {/* Results Summary */}
        {filteredQuotes.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                Showing {((currentPage - 1) * quotesPerPage) + 1}-{Math.min(currentPage * quotesPerPage, filteredQuotes.length)} of {filteredQuotes.length}
              </span> quotes
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quotes...</p>
            </div>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No quotes found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or add a new quote</p>
            <button
              onClick={handleCreateClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Quote
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto" key={`table-container-${refreshKey}`}>
            <table className="w-full" key={`quotes-table-${quotes.length}-${refreshKey}`}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Range</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quoted Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Win Probability</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleViewQuote(quote)}
                          >
                            {quote.name}
                          </div>
                          <div className="text-xs text-gray-500">{quote.email}</div>
                          {quote.company && (
                            <div className="text-xs text-gray-500">{quote.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {quote.project_type || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBudgetRange(quote.budget_range || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {quote.quoted_amount ? formatCurrency(quote.quoted_amount) : 'Not quoted'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${quote.win_probability || 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-900">{quote.win_probability || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Quote"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(quote)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Quote"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(quote)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Quote"
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
      {filteredQuotes.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                Showing {((currentPage - 1) * quotesPerPage) + 1}-{Math.min(currentPage * quotesPerPage, filteredQuotes.length)} of {filteredQuotes.length} quotes
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isCurrentPage = page === currentPage;
                  const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                  const isFirstOrLast = page === 1 || page === totalPages;
                  
                  if (totalPages <= 7 || isNearCurrentPage || isFirstOrLast) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isCurrentPage
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return (
                      <span key={page} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default QuoteManagement;