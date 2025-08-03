"use client";
import React, { useState, useEffect } from 'react';
import { 
  Phone, Plus, Search, Filter, Mail, Building2, User, MessageSquare, CheckCircle, XCircle,  
  Edit, Trash2, Save, X, Calendar, Clock, Star, ArrowUpRight, ArrowDownRight, UserPlus, DollarSign, Eye
} from 'lucide-react';

import { useDatabase } from '../../../contexts/DatabaseContext';
import { useAuth } from '../../../contexts/AuthContext';

// 1. Map service interest values to department names
const serviceToDepartment: Record<string, string> = {
  construction: "Planning",
  waterproofing: "Sales & Marketing",
  flooring: "Sales & Marketing",
  rocksoil: "Sales & Marketing",
  consultation: "Planning",
  renovation: "Planning",
  maintenance: "Planning",
};

const ContactManagement = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord } = useDatabase();
  const { user } = useAuth();
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);
   
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    subject: '',
    message: '',
    preferred_contact: 'email',
    urgency: 'medium',
    status: 'new',
    priority: 'medium',
    source: 'website',
    assigned_to: '',
    follow_up_date: '',
    lead_score: '50',
    estimated_value: '',
    conversion_probability: '30'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data on component mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [contactsData, usersData] = await Promise.all([
          getAllRecords('contacts'),
          getAllRecords('users')
        ]);
        setContacts(Array.isArray(contactsData) ? contactsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error: any) {
        setError(error?.message || 'Failed to load data. Please try again.');
      } finally { 
        setIsLoading(false);
      }
    };
    loadData();
  }, [isClient, getAllRecords]);

  // --- Random assignment helper (async) ---
  async function getRandomAssignedUserId(service: string) {
    const department = serviceToDepartment[service];
    if (!department) return '';

    const employees = users.filter(
      (u) =>
        u.department &&
        u.department.toLowerCase() === department.toLowerCase() &&
        u.role === 'employee' &&
        (!u.position || u.position.toLowerCase() !== 'manager')
    );
    if (employees.length === 0) return '';

    const randomIndex = Math.floor(Math.random() * employees.length);
    return employees[randomIndex].id;
  }

  // Handlers
  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      subject: '',
      message: '',
      preferred_contact: 'email',
      urgency: 'medium',
      status: 'new',
      priority: 'medium',
      source: 'website',
      assigned_to: '',
      follow_up_date: '',
      lead_score: '50',
      estimated_value: '',
      conversion_probability: '30'
    });
    setError('');
  };

  const handleEditClick = (contact: any) => {
    setEditingContact(contact);
    setShowCreateForm(false);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      service: contact.service || '',
      subject: contact.subject || '',
      message: contact.message || '',
      preferred_contact: contact.preferred_contact || 'email',
      urgency: contact.urgency || 'medium',
      status: contact.status || 'new',
      priority: contact.priority || 'medium',
      source: contact.source || 'website',
      assigned_to: contact.assigned_to || '',
      follow_up_date: contact.follow_up_date ? new Date(contact.follow_up_date).toISOString().slice(0, 16) : '',
      lead_score: contact.lead_score?.toString() || '50',
      estimated_value: contact.estimated_value?.toString() || '',
      conversion_probability: contact.conversion_probability?.toString() || '30'
    });
    setError('');
  };

  const handleViewContact = (contact: any) => {
    setSelectedContact(contact);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedContact(null);
    setViewMode('list');
  };

  const handleDeleteClick = (contact: any) => {
    setContactToDelete(contact);
    setDeleteConfirmModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If service changes, clear assigned_to (let random assign handle it on submit)
      if (name === "service") {
        return { ...prev, [name]: value, assigned_to: '' };
      }
      return { ...prev, [name]: value };
    });
    if (error) setError('');
  };

  // --- Only random assign on create ---
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setError('Name, email, and message are required');
        setIsLoading(false);
        return;
      }
      // Always random assign before saving
      const assigned_to = await getRandomAssignedUserId(formData.service);

      const contactData = {
        ...formData,
        assigned_to,
        lead_score: parseInt(formData.lead_score) || 50,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        conversion_probability: parseInt(formData.conversion_probability) || 30,
      };
      await createRecord('contacts', contactData);
      setSuccess('Contact created successfully');
      setShowCreateForm(false);
      const contactsData = await getAllRecords('contacts');
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error?.message || 'Failed to create contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit does NOT change assignment ---
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    try {
      setIsLoading(true);
      setError('');
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setError('Name, email, and message are required');
        setIsLoading(false);
        return;
      }
      // Do NOT change assigned_to on edit
      const contactData = {
        ...formData,
        lead_score: parseInt(formData.lead_score) || 50,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        conversion_probability: parseInt(formData.conversion_probability) || 30,
      };
      await updateRecord(editingContact.id, contactData, 'contacts');
      setSuccess('Contact updated successfully');
      setEditingContact(null);
      const contactsData = await getAllRecords('contacts');
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error?.message || 'Failed to update contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    try {
      setIsLoading(true);
      await deleteRecord(contactToDelete.id, 'contacts');
      setSuccess('Contact deleted successfully');
      const contactsData = await getAllRecords('contacts');
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setDeleteConfirmModalOpen(false);
      setContactToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error?.message || 'Failed to delete contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModalOpen(false);
    setContactToDelete(null);
  };

  // Get unique sources for filter
  const sources = [...new Set(contacts.map(c => c.source).filter(Boolean))];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter;
    const matchesAssignee = assigneeFilter === 'all' || 
      contact.assigned_to === assigneeFilter || 
      contact.assigned_user?.id === assigneeFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesAssignee;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <UserPlus className="w-4 h-4 mr-1" />;
      case 'contacted': return <Phone className="w-4 h-4 mr-1" />;
      case 'qualified': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'converted': return <Star className="w-4 h-4 mr-1" />;
      case 'closed': return <XCircle className="w-4 h-4 mr-1" />;
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUpRight className="w-4 h-4 mr-1 text-red-600" />;
      case 'medium': return <ArrowUpRight className="w-4 h-4 mr-1 text-orange-600" />;
      case 'low': return <ArrowDownRight className="w-4 h-4 mr-1 text-blue-600" />;
      default: return null;
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

  // --- Contact Form ---
  const renderContactForm = (isCreate: boolean) => {
    const formTitle = isCreate ? 'Add New Contact' : 'Edit Contact';
    const submitHandler = isCreate ? handleSubmitCreate : handleSubmitEdit;
    const cancelHandler = isCreate ? () => setShowCreateForm(false) : () => setEditingContact(null);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
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
            {/* Contact Information */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Inquiry Details</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Interest
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  >
                    <option value="">Select service</option>
                    <option value="construction">Design & Construction</option>
                    <option value="waterproofing">Waterproofing Materials</option>
                    <option value="flooring">Flooring Materials</option>
                    <option value="rocksoil">Rocksoil Materials</option>
                    <option value="consultation">Consultation</option>
                    <option value="renovation">Renovation</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="Enter subject"
                  />
                </div>
                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="Enter message"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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

            {/* Lead Management */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Lead Management</h4>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Lead Scoring */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Lead Scoring</h4>
              <div className="grid md:grid-cols-3 gap-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="Enter lead score"
                  />
                </div>
                {/* Estimated Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="estimated_value"
                      value={formData.estimated_value}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Enter estimated value"
                    />
                  </div>
                </div>
                {/* Conversion Probability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion Probability (0-100%)
                  </label>
                  <input
                    type="number"
                    name="conversion_probability"
                    value={formData.conversion_probability}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="Enter conversion probability"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  {isCreate ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {isCreate ? 'Add Contact' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // --- Contact Detail View ---
  const renderContactDetail = () => {
    if (!selectedContact) return null;
    
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
            <h2 className="text-2xl font-bold text-gray-900">{selectedContact.name}</h2>
            <p className="text-gray-600">{selectedContact.email} • {selectedContact.phone || 'No phone'}</p>
          </div>
        </div>

        {/* Contact Details */}
       <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedContact.name}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedContact.email}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedContact.phone || 'Not provided'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedContact.company || 'Not provided'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Preferred Contact</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedContact.preferred_contact || 'Email'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedContact.source || 'Website'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedContact.created_at)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Inquiry Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
              Inquiry Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Service Interest</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedContact.service || 'Not specified'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedContact.subject || 'No subject'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Urgency</p>
                <p className={`text-sm font-medium ${getPriorityColor(selectedContact.urgency)} capitalize flex items-center`}>
                  {getPriorityIcon(selectedContact.urgency)}
                  {selectedContact.urgency || 'Medium'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Lead Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-orange-600" />
              Lead Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedContact.status)}`}>
                  {getStatusIcon(selectedContact.status)}
                  {selectedContact.status || 'New'}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p className={`text-sm font-medium ${getPriorityColor(selectedContact.priority)} capitalize flex items-center`}>
                  {getPriorityIcon(selectedContact.priority)}
                  {selectedContact.priority || 'Medium'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedContact.assigned_user?.name || 'Unassigned'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Follow-up Date</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedContact.follow_up_date ? formatDate(selectedContact.follow_up_date) : 'Not scheduled'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Lead Score</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedContact.lead_score || 50}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Value</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedContact.estimated_value || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversion</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedContact.conversion_probability || 30}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditClick(selectedContact)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Contact
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedContact)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center hover:bg-red-200 transition-colors"
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
            <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <Phone className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Call Contact</span>
            </button>
            <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <Mail className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Send Email</span>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
              <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Quote</span>
            </button>
          </div>
        </div>
        
        {/* Contact History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Contact History
            </h3>
          </div>
          
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No contact history available</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Add Interaction
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'detail') {
    return renderContactDetail();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
          <p className="text-gray-600">
            Manage customer inquiries and leads
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && renderContactForm(true)}
      {editingContact && renderContactForm(false)}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
         <div className="grid lg:grid-cols-4 gap-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
            >
              <option value="all">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 font-medium"
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

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Phone className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No contacts found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or add a new contact</p>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Contact
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Score</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Value</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-up</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleViewContact(contact)}
                          >
                            {contact.name}
                          </div>
                          <div className="text-xs text-gray-500">{contact.email}</div>
                          {contact.company && (
                            <div className="text-xs text-gray-500">{contact.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {contact.service || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                        {getStatusIcon(contact.status)}
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${contact.lead_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-900">{contact.lead_score || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(contact.estimated_value || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.follow_up_date ? formatDate(contact.follow_up_date) : 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(contact)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(contact)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Contact</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{contactToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;