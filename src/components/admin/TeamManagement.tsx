"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Save, 
  X,
  UserPlus,
  Shield,
  Eye,
  MessageSquare,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  login_type: 'admin' | 'manager' | 'employee';
  department?: string;
  position?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface FormData {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  login_type: 'admin' | 'manager' | 'employee';
  department: string;
  position: string;
  is_active: boolean;
}

const TeamManagement = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord } = useDatabase();
  const { user } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'employee',
    login_type: 'employee',
    department: '',
    position: '',
    is_active: true
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Department options
  const departments = [
    'Construction',
    'Materials',
    'Design',
    'Operations',
    'Sales',
    'Administration',
    'Quality Control',
    'Safety',
    'Finance',
    'Human Resources',
    'Procurement',
    'Marketing'
  ];

  // Position options by department
  const positionsByDepartment: {[key: string]: string[]} = {
    'Construction': [
      'Site Engineer',
      'Construction Manager',
      'Project Manager',
      'Site Supervisor',
      'Construction Worker',
      'Safety Officer',
      'Quality Inspector',
      'Foreman'
    ],
    'Materials': [
      'Inventory Specialist',
      'Materials Manager',
      'Warehouse Supervisor',
      'Procurement Officer',
      'Quality Control Specialist',
      'Logistics Coordinator'
    ],
    'Design': [
      'CAD Designer',
      'Architect',
      'Design Manager',
      'Structural Engineer',
      'Interior Designer',
      '3D Modeler',
      'Technical Draftsman'
    ],
    'Operations': [
      'Operations Manager',
      'Operations Coordinator',
      'Process Analyst',
      'Operations Supervisor',
      'Facilities Manager'
    ],
    'Sales': [
      'Sales Manager',
      'Sales Representative',
      'Account Manager',
      'Business Development Manager',
      'Sales Coordinator',
      'Client Relations Manager'
    ],
    'Administration': [
      'Administrative Assistant',
      'Office Manager',
      'Executive Assistant',
      'Data Entry Clerk',
      'Receptionist'
    ],
    'Quality Control': [
      'Quality Manager',
      'Quality Inspector',
      'Quality Analyst',
      'Compliance Officer',
      'Testing Specialist'
    ],
    'Safety': [
      'Safety Manager',
      'Safety Officer',
      'Safety Inspector',
      'HSE Coordinator',
      'Safety Trainer'
    ],
    'Finance': [
      'Finance Manager',
      'Accountant',
      'Financial Analyst',
      'Bookkeeper',
      'Budget Analyst',
      'Payroll Specialist'
    ],
    'Human Resources': [
      'HR Manager',
      'HR Specialist',
      'Recruiter',
      'Training Coordinator',
      'HR Assistant'
    ],
    'Procurement': [
      'Procurement Manager',
      'Buyer',
      'Vendor Manager',
      'Contract Specialist',
      'Purchasing Agent'
    ],
    'Marketing': [
      'Marketing Manager',
      'Marketing Specialist',
      'Content Creator',
      'Digital Marketing Specialist',
      'Brand Manager'
    ]
  };

  useEffect(() => {
    if (!isClient) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const usersData = await getAllRecords('users');
        
        // If manager, filter to only show team members in their department
        if (user?.role === 'manager') {
          const departmentMembers = usersData.filter((u: any) => 
            u.department === user.department
          );
          setTeamMembers(departmentMembers || []);
        } else {
          setTeamMembers(usersData || []);
        }
      } catch (error) {
        console.error('Error loading team data:', error);
        setError('Failed to load team members. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isClient, user, getAllRecords]);

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      login_type: 'employee',
      department: user?.role === 'manager' ? user.department || '' : '',
      position: '',
      is_active: true
    });
    setError('');
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setShowCreateForm(false);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'employee',
      login_type: member.login_type || 'employee',
      department: member.department || '',
      position: member.position || '',
      is_active: member.is_active !== false
    });
    setError('');
  };

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedMember(null);
    setViewMode('list');
  };

  const handleDeleteClick = async (member: TeamMember) => {
    if (!isClient || typeof window === 'undefined') return;
    
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        setIsLoading(true);
        await deleteRecord(member.id, 'users');
        setSuccess('Team member deleted successfully');
        
        // Refresh team members
        const usersData = await getAllRecords('users');
        if (user?.role === 'manager') {
          const departmentMembers = usersData.filter((u: any) => 
            u.department === user.department
          );
          setTeamMembers(departmentMembers || []);
        } else {
          setTeamMembers(usersData || []);
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting team member:', error);
        setError('Failed to delete team member. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (error) setError('');
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Validate form
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Name and email are required');
        setIsLoading(false);
        return;
      }
      
      // Create user - pass the authenticated user ID from AuthContext
      await createRecord('users', formData, user?.id);
      setSuccess('Team member created successfully');
      setShowCreateForm(false);
      
      // Refresh team members
      const usersData = await getAllRecords('users');
      if (user?.role === 'manager') {
        const departmentMembers = usersData.filter((u: any) => 
          u.department === user.department
        );
        setTeamMembers(departmentMembers || []);
      } else {
        setTeamMembers(usersData || []);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating team member:', error);
      setError('Failed to create team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !isClient) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Validate form
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Name and email are required');
        setIsLoading(false);
        return;
      }
      
      // Update user - pass the authenticated user ID from AuthContext
      await updateRecord(editingMember.id, formData, 'users', user?.id);
      setSuccess('Team member updated successfully');
      setEditingMember(null);
      
      // Refresh team members
      const usersData = await getAllRecords('users');
      if (user?.role === 'manager') {
        const departmentMembers = usersData.filter((u: any) => 
          u.department === user.department
        );
        setTeamMembers(departmentMembers || []);
      } else {
        setTeamMembers(usersData || []);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating team member:', error);
      setError('Failed to update team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    // Apply search filter
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply department filter
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    
    // Apply role filter
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 mr-1" />;
      case 'manager': return <Users className="w-4 h-4 mr-1" />;
      case 'employee': return <Briefcase className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || !isClient) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const renderMemberForm = (isCreate: boolean) => {
    const formTitle = isCreate ? 'Add Team Member' : 'Edit Team Member';
    const submitHandler = isCreate ? handleSubmitCreate : handleSubmitEdit;
    const cancelHandler = isCreate ? () => setShowCreateForm(false) : () => setEditingMember(null);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
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
            {/* Full Name */}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={user?.role !== 'admin'}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                {user?.role === 'admin' && (
                  <option value="admin">Admin</option>
                )}
              </select>
            </div>

            {/* Login Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Type
              </label>
              <select
                name="login_type"
                value={formData.login_type}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={user?.role !== 'admin'}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                {user?.role === 'admin' && (
                  <option value="admin">Admin</option>
                )}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={user?.role === 'manager'}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.department}
              >
                <option value="">Select Position</option>
                {formData.department && positionsByDepartment[formData.department]?.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleFormChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Account
              </label>
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
                  {isCreate ? 'Add Member' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderMemberDetail = () => {
    if (!selectedMember) return null;
    
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
            <h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2>
            <p className="text-gray-600">{selectedMember.position} • {selectedMember.department}</p>
          </div>
        </div>
        
        {/* Member Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedMember.name}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedMember.email}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(selectedMember.role)}`}>
                  {getRoleIcon(selectedMember.role)}
                  {selectedMember.role}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedMember.department || 'Not assigned'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedMember.position || 'Not assigned'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedMember.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedMember.is_active !== false ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {selectedMember.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedMember.created_at)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditClick(selectedMember)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Member
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedMember)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Send Message</span>
                </button>
                <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
                  <CheckSquare className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Assign Task</span>
                </button>
                <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Schedule Meeting</span>
                </button>
                <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg transition-colors flex flex-col items-center text-center">
                  <Eye className="w-6 h-6 text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">View Performance</span>
                </button>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-4">
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Member Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
              Assigned Tasks
            </h3>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Assign New Task
            </button>
          </div>
          
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No tasks assigned to this team member</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Assign First Task
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
          <p className="text-gray-600">Loading Team Management...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail') {
    return renderMemberDetail();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Team Member
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
      {showCreateForm && renderMemberForm(true)}
      {editingMember && renderMemberForm(false)}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={user?.role === 'manager'}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading team members...</p>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No team members found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or add a new team member</p>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleViewMember(member)}
                          >
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.department || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.position || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {member.is_active !== false ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {member.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewMember(member)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(member)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
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
  );
};

export default TeamManagement;