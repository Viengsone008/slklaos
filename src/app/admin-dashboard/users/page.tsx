"use client";
import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, EyeOff, User, Mail, Lock, Save, X, CheckCircle, AlertCircle, Shield, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from "../../../lib/supabase";

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'manager';
  login_type: 'admin' | 'employee' | 'manager';
  department?: string;
  position?: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'employee' | 'manager',
    login_type: 'admin' as 'admin' | 'employee' | 'manager',
    department: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  // Predefined options for dropdowns
  const departmentOptions = [
    'Construction','Planning','Administration', 'Human Resources', 'Sales & Marketing', 'Materials',
    'Quality Control', 'IT & Support', 'Safety & Compliance', 'Finance & Accounting',
    'Procurement', 'Design & Engineering', 'Operations', 'Logistics & Supply Chain',
    'Legal', 'Business Development', 'Customer Service', 'Project Management'
  ];

  const positionOptions = {
    'Construction': ['Construction Manager','Site Engineer', 'CAD Engineer',  'Project Manager', 'Site Supervisor', 'Construction Worker', 'Safety Officer', 'Quality Inspector', 'Foreman'],
    'Planning': ['Project Planner', 'Scheduler', 'Cost Estimator', 'Planning Engineer', 'Resource Manager'],
    'IT & Support': ['IT Manager', 'System Administrator', 'Help Desk Technician', 'Network Engineer', 'IT Support Specialist', 'Database Administrator'],
    'Logistics & Supply Chain': ['Logistics Manager', 'Supply Chain Analyst', 'Warehouse Manager', 'Inventory Control Specialist', 'Shipping Coordinator', 'Procurement Specialist'],
    'Legal': ['Legal Counsel', 'Contract Manager', 'Compliance Officer', 'Paralegal', 'Legal Assistant'],
    'Business Development': ['Business Development Manager', 'Sales Executive', 'Market Research Analyst', 'Partnership Manager', 'Account Executive'],
    'Customer Service': ['Customer Service Manager', 'Customer Support Specialist', 'Call Center Agent', 'Client Relations Specialist', 'Technical Support Specialist'],
    'Project Management': ['Project Manager', 'Project Coordinator', 'Program Manager', 'Project Analyst', 'Project Scheduler'],
    'Materials': ['Inventory Specialist', 'Materials Manager', 'Warehouse Supervisor', 'Procurement Officer', 'Quality Control Specialist', 'Logistics Coordinator'],
    'Design & Engineering': ['CAD Designer', 'Architect', 'Design Manager', 'Structural Engineer', 'Interior Designer', '3D Modeler', 'Technical Draftsman'],
    'Operations': ['Operations Manager', 'Operations Coordinator', 'Process Analyst', 'Operations Supervisor', 'Facilities Manager'],
    'Sales & Marketing': ['Sales Manager', 'Sales Representative', 'Account Manager', 'Business Development Manager', 'Sales Coordinator', 'Client Relations Manager','Marketing Manager', 'Marketing Specialist', 'Content Creator', 'Digital Marketing Specialist', 'Brand Manager'],
    'Administration': ['Administrative Manager','Administrative Assistant', 'Office Manager', 'Executive Assistant', 'Data Entry Clerk', 'Receptionist'],
    'Quality Control': ['Quality Manager', 'Quality Inspector', 'Quality Analyst', 'Compliance Officer', 'Testing Specialist'],
    'Safety & Compliance': ['Safety Manager', 'Safety Officer', 'Safety Inspector', 'HSE Coordinator', 'Safety Trainer'],
    'Finance & Accounting': ['Finance Manager', 'Accountant', 'Financial Analyst', 'Bookkeeper', 'Budget Analyst', 'Payroll Specialist'],
    'Human Resources': ['HR Manager', 'HR Specialist', 'Recruiter', 'Training Coordinator', 'HR Assistant'],
    'Procurement': ['Procurement Manager', 'Buyer', 'Vendor Manager', 'Contract Specialist', 'Purchasing Agent']
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getPositionOptions = (department: string) => {
    return positionOptions[department as keyof typeof positionOptions] || [];
  };

  // Fetch users from Supabase
  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch users from Supabase');
        setUsers([]);
        return;
      }
      setUsers(data || []);
    } catch (err) {
      setError('Error loading users from Supabase');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) loadUsers();
  }, [isClient]);

  // Pagination calculations
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(startIndex, startIndex + usersPerPage);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.department) {
      setError('Department is required');
      return false;
    }
    if (!formData.position) {
      setError('Position is required');
      return false;
    }
    if (!editingUser && !formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  // CREATE or UPDATE user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (editingUser) {
        // UPDATE (only in users table)
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            login_type: formData.login_type,
            department: formData.department,
            position: formData.position,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) {
          setError('Failed to update user: ' + error.message);
          setIsLoading(false);
          return;
        }
        setSuccess('User updated successfully!');
      } else {
        // CREATE via API route (creates in Auth and users table)
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            loginType: formData.login_type,
            department: formData.department,
            position: formData.position,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || 'Failed to create user');
          setIsLoading(false);
          return;
        }
        setSuccess(`User "${formData.name}" created successfully!`);
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        login_type: 'admin',
        department: '',
        position: ''
      });
      setShowCreateForm(false);
      setEditingUser(null);
      loadUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // EDIT user
  const handleEdit = (user: RegisteredUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      login_type: user.login_type,
      department: user.department || '',
      position: user.position || ''
    });
    setShowCreateForm(true);
    setError('');
    setSuccess('');
  };

  // DELETE user
  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to delete user');
        setIsLoading(false);
        return;
      }
      setSuccess('User deleted successfully!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error deleting user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      login_type: 'admin',
      department: '',
      position: ''
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setFormData({
        ...formData,
        [name]: value,
        position: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    if (error) setError('');
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Email updated! Please check your inbox to confirm.");
    }
    setIsLoading(false);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading User Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users across all login types (Admin, Employee, Manager)</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors duration-200 transform hover:scale-105 shadow-lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add New User
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create/Edit User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Password - New Field */}
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Set user password"
                  />
                </div>
              </div>
            )}

            {/* Login Type & Role */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Type *
                </label>
                <div className="relative">
                  <select
                    name="login_type"
                    value={formData.login_type}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Determines which login page section the user will use
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Department & Position */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                  >
                    <option value="">Select department...</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <div className="relative">
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    disabled={isLoading || !formData.department}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                  >
                    <option value="">
                      {formData.department ? 'Select position...' : 'Select department first...'}
                    </option>
                    {formData.department && getPositionOptions(formData.department).map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {!formData.department && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a department first to see available positions
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Users ({users.length})</h2>
              <p className="text-sm text-gray-600 mt-1">All users from Supabase</p>
            </div>
            {users.length > usersPerPage && (
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, users.length)} of {users.length} users • 15 per page
              </p>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Name</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Email</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Login Type</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Department</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Position</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Created</th>
                <th className="text-left px-6 py-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.login_type === 'admin'
                        ? 'bg-orange-100 text-orange-800'
                        : user.login_type === 'employee'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.login_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.department || 'Not specified'}</td>
                  <td className="px-6 py-4 text-gray-600">{user.position || 'Not specified'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
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
        
        {/* Pagination Controls */}
        {users.length > usersPerPage && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, users.length)} of {users.length} users
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
                          ? 'bg-orange-600 text-white'
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
                            ? 'bg-orange-600 text-white'
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
                          ? 'bg-orange-600 text-white'
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
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No users found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;