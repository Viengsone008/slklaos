"use client";
import React, { useEffect, useState } from 'react';
import {
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Archive, 
  Download, 
  Eye,
  Search,
  Filter,
  Upload,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface RFI {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_format: string | null; 
  version: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

const RFIManagement: React.FC = () => {
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRFI, setEditingRFI] = useState<RFI | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newRFI, setNewRFI] = useState({ 
    title: '', 
    description: '', 
    file_url: '', 
    file_format: '', 
    version: '1.0',
    status: 'draft'
  });

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch RFIs from Supabase
  const fetchRFIs = async () => {
    if (!isClient) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('type', 'RFI')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RFIs:', error);
        toast.error('Failed to load RFIs');
      } else {
        setRfis(data || []);
        toast.success(`Loaded ${data?.length || 0} RFIs`);
      }
    } catch (error) {
      console.error('Error fetching RFIs:', error);
      toast.error('Failed to load RFIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchRFIs();
    }
  }, [isClient]);

  // Handle add new RFI
  const handleAddRFI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRFI.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('documents').insert([{
        ...newRFI,
        type: 'RFI',
        title: newRFI.title.trim(),
        description: newRFI.description?.trim() || null
      }]);

      if (error) {
        console.error('Error adding RFI:', error);
        toast.error('Failed to add RFI');
      } else {
        toast.success('RFI added successfully');
        fetchRFIs();
        setShowAddModal(false);
        setNewRFI({ 
          title: '', 
          description: '', 
          file_url: '', 
          file_format: '', 
          version: '1.0',
          status: 'draft'
        });
      }
    } catch (error) {
      console.error('Error adding RFI:', error);
      toast.error('Failed to add RFI');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit RFI
  const handleEditRFI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRFI || !newRFI.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: newRFI.title.trim(),
          description: newRFI.description?.trim() || null,
          file_url: newRFI.file_url || null,
          file_format: newRFI.file_format || null,
          version: newRFI.version,
          status: newRFI.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRFI.id);

      if (error) {
        console.error('Error updating RFI:', error);
        toast.error('Failed to update RFI');
      } else {
        toast.success('RFI updated successfully');
        fetchRFIs();
        setEditingRFI(null);
        setNewRFI({ 
          title: '', 
          description: '', 
          file_url: '', 
          file_format: '', 
          version: '1.0',
          status: 'draft'
        });
      }
    } catch (error) {
      console.error('Error updating RFI:', error);
      toast.error('Failed to update RFI');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete RFI
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this RFI? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting RFI:', error);
        toast.error('Failed to delete RFI');
      } else {
        toast.success('RFI deleted successfully');
        fetchRFIs();
      }
    } catch (error) {
      console.error('Error deleting RFI:', error);
      toast.error('Failed to delete RFI');
    }
  };

  // Handle edit click
  const handleEditClick = (rfi: RFI) => {
    setEditingRFI(rfi);
    setNewRFI({
      title: rfi.title,
      description: rfi.description || '',
      file_url: rfi.file_url || '',
      file_format: rfi.file_format || '',
      version: rfi.version,
      status: rfi.status
    });
    setShowAddModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRFI(null);
    setNewRFI({ 
      title: '', 
      description: '', 
      file_url: '', 
      file_format: '', 
      version: '1.0',
      status: 'draft'
    });
  };

  // Get status icon
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

  // Get status color
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

  // Filter RFIs
  const filteredRFIs = rfis.filter(rfi => {
    const matchesSearch = rfi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfi.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RFI Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">RFI Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add RFI
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search RFIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* RFI Grid */}
          {filteredRFIs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No RFIs found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first RFI to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First RFI
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRFIs.map(rfi => (
                <div key={rfi.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(rfi.status)}`}>
                        {rfi.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditClick(rfi)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{rfi.title}</h3>
                  {rfi.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{rfi.description}</p>
                  )}

                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <div>Version: <span className="font-medium">{rfi.version}</span></div>
                    {rfi.file_format && (
                      <div>Format: <span className="font-medium">{rfi.file_format}</span></div>
                    )}
                    <div>Created: <span className="font-medium">{formatDate(rfi.created_at)}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2">
                      {rfi.file_url && (
                        <a 
                          href={rfi.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDelete(rfi.id)} 
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete RFI"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit RFI Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingRFI ? 'Edit RFI' : 'Add New RFI'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingRFI ? handleEditRFI : handleAddRFI} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newRFI.title}
                  onChange={e => setNewRFI({ ...newRFI, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter RFI title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newRFI.description}
                  onChange={e => setNewRFI({ ...newRFI, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">File URL</label>
                  <input
                    type="url"
                    value={newRFI.file_url}
                    onChange={e => setNewRFI({ ...newRFI, file_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Format</label>
                  <input
                    type="text"
                    value={newRFI.file_format}
                    onChange={e => setNewRFI({ ...newRFI, file_format: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PDF, DOC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Version</label>
                  <input
                    type="text"
                    value={newRFI.version}
                    onChange={e => setNewRFI({ ...newRFI, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newRFI.status}
                    onChange={e => setNewRFI({ ...newRFI, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editingRFI ? 'Update RFI' : 'Add RFI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIManagement;
