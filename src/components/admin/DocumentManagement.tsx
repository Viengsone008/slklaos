"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, Edit, Trash2, Search, Filter, Plus, AlertCircle, CheckCircle, Clock, Archive } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Document {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  project_id: string | null;
  file_url: string | null;
  file_size: string | null;
  file_format: string | null;
  version: string;
  status: string;
  uploaded_by: string | null;
  approved_by: string | null;
  tags: string[];
  is_confidential: boolean;
  expiry_date: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const DocumentManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    project_id: '',
    file_url: '',
    file_size: '',
    file_format: '',
    version: '1.0',
    status: 'draft',
    tags: [] as string[],
    is_confidential: false,
    expiry_date: '',
    metadata: {}
  });

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize data when component mounts (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    initializeData();
  }, [isClient]);

  const initializeData = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Initialize with mock data for development
      await initializeMockDocuments();
      await initializeMockProjects();
      await initializeMockUsers();
      
      // Load data
      await Promise.all([
        fetchDocuments(),
        fetchProjects(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMockDocuments = async () => {
    if (typeof window === 'undefined') return;

    try {
      const existingDocs = localStorage.getItem('slk_documents');
      if (!existingDocs) {
        const mockDocuments = [
          {
            id: 'doc-1',
            title: 'Villa Construction Blueprint',
            description: 'Detailed architectural drawings for modern villa project',
            type: 'Working Drawing',
            category: 'Architecture',
            project_id: 'proj-1',
            file_url: '/documents/villa-blueprint.pdf',
            file_size: '2.5MB',
            file_format: 'PDF',
            version: '2.1',
            status: 'approved',
            uploaded_by: currentUser?.id || 'user-1',
            approved_by: currentUser?.id || 'admin-1',
            tags: ['blueprint', 'villa', 'architecture'],
            is_confidential: false,
            expiry_date: null,
            metadata: { pages: 15, resolution: '300dpi' },
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-2',
            title: 'Construction Contract - Phase 1',
            description: 'Legal contract for initial construction phase',
            type: 'Contracts',
            category: 'Legal',
            project_id: 'proj-1',
            file_url: '/documents/contract-phase1.pdf',
            file_size: '1.8MB',
            file_format: 'PDF',
            version: '1.0',
            status: 'review',
            uploaded_by: currentUser?.id || 'user-2',
            approved_by: null,
            tags: ['contract', 'legal', 'phase1'],
            is_confidential: true,
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            metadata: { signatureRequired: true },
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-3',
            title: 'RFI - Electrical Specifications',
            description: 'Request for Information regarding electrical system specifications',
            type: 'RFI',
            category: 'Technical',
            project_id: 'proj-2',
            file_url: '/documents/rfi-electrical.pdf',
            file_size: '856KB',
            file_format: 'PDF',
            version: '1.2',
            status: 'draft',
            uploaded_by: currentUser?.id || 'user-3',
            approved_by: null,
            tags: ['rfi', 'electrical', 'specifications'],
            is_confidential: false,
            expiry_date: null,
            metadata: { urgency: 'high' },
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-4',
            title: 'Monthly Invoice - Materials',
            description: 'Invoice for construction materials delivered in current month',
            type: 'Invoices',
            category: 'Financial',
            project_id: 'proj-1',
            file_url: '/documents/invoice-materials.pdf',
            file_size: '432KB',
            file_format: 'PDF',
            version: '1.0',
            status: 'approved',
            uploaded_by: currentUser?.id || 'user-1',
            approved_by: currentUser?.id || 'admin-1',
            tags: ['invoice', 'materials', 'monthly'],
            is_confidential: true,
            expiry_date: null,
            metadata: { amount: 25000, currency: 'LAK' },
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-5',
            title: 'Employee Salary Sheet - October',
            description: 'Monthly salary breakdown for all construction team members',
            type: 'Salary Sheet',
            category: 'HR',
            project_id: null,
            file_url: '/documents/salary-october.xlsx',
            file_size: '1.2MB',
            file_format: 'XLSX',
            version: '1.0',
            status: 'approved',
            uploaded_by: currentUser?.id || 'admin-1',
            approved_by: currentUser?.id || 'admin-1',
            tags: ['salary', 'hr', 'october', 'payroll'],
            is_confidential: true,
            expiry_date: null,
            metadata: { employees: 25, totalAmount: 150000000 },
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-6',
            title: 'Safety Compliance Report',
            description: 'Monthly safety audit and compliance documentation',
            type: 'Working Drawing',
            category: 'Safety',
            project_id: 'proj-2',
            file_url: '/documents/safety-report.pdf',
            file_size: '3.1MB',
            file_format: 'PDF',
            version: '1.1',
            status: 'archived',
            uploaded_by: currentUser?.id || 'user-2',
            approved_by: currentUser?.id || 'admin-1',
            tags: ['safety', 'compliance', 'audit'],
            is_confidential: false,
            expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            metadata: { incidents: 0, violations: 2 },
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        localStorage.setItem('slk_documents', JSON.stringify(mockDocuments));
      }
    } catch (error) {
      console.error('Error initializing mock documents:', error);
    }
  };

  const initializeMockProjects = async () => {
    if (typeof window === 'undefined') return;

    try {
      const existingProjects = localStorage.getItem('slk_projects_list');
      if (!existingProjects) {
        const mockProjects = [
          { id: 'proj-1', name: 'Modern Villa Construction' },
          { id: 'proj-2', name: 'Commercial Office Building' },
          { id: 'proj-3', name: 'Residential Complex Phase A' },
          { id: 'proj-4', name: 'Shopping Mall Renovation' }
        ];
        
        localStorage.setItem('slk_projects_list', JSON.stringify(mockProjects));
      }
    } catch (error) {
      console.error('Error initializing mock projects:', error);
    }
  };

  const initializeMockUsers = async () => {
    if (typeof window === 'undefined') return;

    try {
      const existingUsers = localStorage.getItem('slk_users_list');
      if (!existingUsers) {
        const mockUsers = [
          { id: 'user-1', name: 'John Doe', email: 'john.doe@slklaos.la' },
          { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@slklaos.la' },
          { id: 'user-3', name: 'Mike Johnson', email: 'mike.johnson@slklaos.la' },
          { id: 'admin-1', name: 'SLK Administrator', email: 'admin@slklaos.la' }
        ];
        
        localStorage.setItem('slk_users_list', JSON.stringify(mockUsers));
      }
    } catch (error) {
      console.error('Error initializing mock users:', error);
    }
  };

  const fetchDocuments = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          projects(name),
          uploaded_by_user:users!documents_uploaded_by_fkey(name, email),
          approved_by_user:users!documents_approved_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDocuments(data);
      } else {
        // Fallback to localStorage
        const localDocs = localStorage.getItem('slk_documents');
        if (localDocs) {
          setDocuments(JSON.parse(localDocs));
        }
      }
    } catch (error) {
      console.log('Supabase not available, using local storage');
      try {
        const localDocs = localStorage.getItem('slk_documents');
        if (localDocs) {
          setDocuments(JSON.parse(localDocs));
        }
      } catch (localError) {
        console.error('Error fetching documents from localStorage:', localError);
      }
    }
  };

  const fetchProjects = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        // Fallback to localStorage
        const localProjects = localStorage.getItem('slk_projects_list');
        if (localProjects) {
          setProjects(JSON.parse(localProjects));
        }
      }
    } catch (error) {
      console.log('Supabase not available for projects, using local storage');
      try {
        const localProjects = localStorage.getItem('slk_projects_list');
        if (localProjects) {
          setProjects(JSON.parse(localProjects));
        }
      } catch (localError) {
        console.error('Error fetching projects from localStorage:', localError);
      }
    }
  };

  const fetchUsers = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setUsers(data);
      } else {
        // Fallback to localStorage
        const localUsers = localStorage.getItem('slk_users_list');
        if (localUsers) {
          setUsers(JSON.parse(localUsers));
        }
      }
    } catch (error) {
      console.log('Supabase not available for users, using local storage');
      try {
        const localUsers = localStorage.getItem('slk_users_list');
        if (localUsers) {
          setUsers(JSON.parse(localUsers));
        }
      } catch (localError) {
        console.error('Error fetching users from localStorage:', localError);
      }
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;

    try {
      const newDoc = {
        id: `doc-${Date.now()}`,
        ...newDocument,
        tags: newDocument.tags.length > 0 ? newDocument.tags : [],
        project_id: newDocument.project_id || null,
        expiry_date: newDocument.expiry_date || null,
        uploaded_by: currentUser?.id || 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: newDocument.metadata || {}
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('documents')
          .insert([newDoc])
          .select()
          .single();

        if (error) throw error;
        setDocuments([data, ...documents]);
      } catch (supabaseError) {
        // Fallback to localStorage
        const updatedDocs = [newDoc, ...documents];
        setDocuments(updatedDocs);
        localStorage.setItem('slk_documents', JSON.stringify(updatedDocs));
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument || typeof window === 'undefined') return;

    try {
      const updatedDoc = {
        ...editingDocument,
        ...newDocument,
        tags: newDocument.tags.length > 0 ? newDocument.tags : [],
        project_id: newDocument.project_id || null,
        expiry_date: newDocument.expiry_date || null,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('documents')
          .update(updatedDoc)
          .eq('id', editingDocument.id)
          .select()
          .single();

        if (error) throw error;
        setDocuments(documents.map(doc => doc.id === editingDocument.id ? data : doc));
      } catch (supabaseError) {
        // Fallback to localStorage
        const updatedDocs = documents.map(doc => 
          doc.id === editingDocument.id ? updatedDoc : doc
        );
        setDocuments(updatedDocs);
        localStorage.setItem('slk_documents', JSON.stringify(updatedDocs));
      }

      setEditingDocument(null);
      resetForm();
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    if (typeof window === 'undefined') return;

    try {
      // Try Supabase first
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (supabaseError) {
        // Continue with local deletion even if Supabase fails
      }

      // Update local state and localStorage
      const updatedDocs = documents.filter(doc => doc.id !== id);
      setDocuments(updatedDocs);
      localStorage.setItem('slk_documents', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleApproveDocument = async (id: string) => {
    if (typeof window === 'undefined') return;

    try {
      const updatedDoc = documents.find(doc => doc.id === id);
      if (!updatedDoc) return;

      const approvedDoc = {
        ...updatedDoc,
        status: 'approved',
        approved_by: currentUser?.id || 'admin',
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('documents')
          .update({
            status: 'approved',
            approved_by: currentUser?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } catch (supabaseError) {
        // Continue with local update even if Supabase fails
      }

      // Update local state and localStorage
      const updatedDocs = documents.map(doc => 
        doc.id === id ? approvedDoc : doc
      );
      setDocuments(updatedDocs);
      localStorage.setItem('slk_documents', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const resetForm = () => {
    setNewDocument({
      title: '',
      description: '',
      type: '',
      category: '',
      project_id: '',
      file_url: '',
      file_size: '',
      file_format: '',
      version: '1.0',
      status: 'draft',
      tags: [],
      is_confidential: false,
      expiry_date: '',
      metadata: {}
    });
    setShowAddModal(false);
    setEditingDocument(null);
  };

  const startEdit = (document: Document) => {
    setEditingDocument(document);
    setNewDocument({
      title: document.title,
      description: document.description || '',
      type: document.type,
      category: document.category || '',
      project_id: document.project_id || '',
      file_url: document.file_url || '',
      file_size: document.file_size || '',
      file_format: document.file_format || '',
      version: document.version,
      status: document.status,
      tags: document.tags || [],
      is_confidential: document.is_confidential,
      expiry_date: document.expiry_date || '',
      metadata: document.metadata || {}
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    const matchesType = typeFilter === 'all' || document.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.type))];

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Top Tabs */}
      <div className="flex flex-wrap gap-3 mt-4">
        {['All', 'Working Drawing', 'Contracts', 'RFI', 'Invoices', 'Salary Sheet'].map(tab => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab === 'All' ? 'all' : tab.toLowerCase())}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              typeFilter === (tab === 'All' ? 'all' : tab.toLowerCase())
                ? 'bg-[#3d9392] text-white border-[#3d9392]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex items-center gap-2">
                    {getStatusIcon(document.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                </div>
                {document.is_confidential && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Confidential
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{document.title}</h3>
              {document.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{document.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div>Type: <span className="font-medium">{document.type}</span></div>
                {document.category && (
                  <div>Category: <span className="font-medium">{document.category}</span></div>
                )}
                <div>Version: <span className="font-medium">{document.version}</span></div>
                {document.file_format && (
                  <div>Format: <span className="font-medium">{document.file_format}</span></div>
                )}
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {document.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {document.file_url && (
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1">
                  {document.status === 'review' && currentUser?.loginType === 'admin' && (
                    <button
                      onClick={() => handleApproveDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(document)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">Try adjusting your search or filters, or add a new document.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingDocument) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingDocument ? 'Edit Document' : 'Add New Document'}
              </h3>
              
              <form onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      value={newDocument.type}
                      onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Working Drawing">Working Drawing</option>
                      <option value="Contracts">Contracts</option>
                      <option value="RFI">RFI</option>
                      <option value="Invoices">Invoices</option>
                      <option value="Salary Sheet">Salary Sheet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={newDocument.category}
                      onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                      value={newDocument.project_id}
                      onChange={(e) => setNewDocument({ ...newDocument, project_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      value={newDocument.version}
                      onChange={(e) => setNewDocument({ ...newDocument, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newDocument.status}
                      onChange={(e) => setNewDocument({ ...newDocument, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="approved">Approved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Format</label>
                    <input
                      type="text"
                      value={newDocument.file_format}
                      onChange={(e) => setNewDocument({ ...newDocument, file_format: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., PDF, DOCX, XLSX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                    <input
                      type="url"
                      value={newDocument.file_url}
                      onChange={(e) => setNewDocument({ ...newDocument, file_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newDocument.expiry_date}
                      onChange={(e) => setNewDocument({ ...newDocument, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newDocument.tags.join(', ')}
                    onChange={(e) => setNewDocument({ 
                      ...newDocument, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={newDocument.is_confidential}
                    onChange={(e) => setNewDocument({ ...newDocument, is_confidential: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="confidential" className="ml-2 block text-sm text-gray-700">
                    Mark as confidential
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingDocument ? 'Update' : 'Add'} Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;