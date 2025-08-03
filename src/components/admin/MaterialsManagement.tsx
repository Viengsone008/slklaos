"use client";
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Save, 
  X,
  BarChart2,
  ArrowDown,
  ArrowUp,
  Calendar,
  MapPin,
  Eye
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../lib/supabase";

const MaterialsManagement = () => {
  const { getAllRecords, createRecord, updateRecord, deleteRecord } = useDatabase();
  const { user } = useAuth();
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    supplier: '',
    sku: '',
    quantity: '0',
    unit: '',
    unit_price: '',
    location: '',
    status: 'in_stock',
    reorder_level: '0',
    last_ordered: '',
    expiry_date: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Material categories
  const categories = [
    'Waterproofing',
    'Flooring',
    'Concrete',
    'Steel',
    'Wood',
    'Electrical',
    'Plumbing',
    'Insulation',
    'Paint',
    'Hardware',
    'Tools',
    'Safety Equipment'
  ];

  // Material units
  const units = [
    'pieces',
    'kg',
    'tons',
    'liters',
    'gallons',
    'sqm',
    'cubic meters',
    'rolls',
    'boxes',
    'bags',
    'sheets',
    'bundles',
    'pairs'
  ];

  // Load data (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const materialsData = await getAllRecords('materials');
        setMaterials(materialsData);
      } catch (error) {
        console.error('Error loading materials data:', error);
        setError('Failed to load materials. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isClient, getAllRecords]);

  // Auto-hide success/error messages (client-side only)
  useEffect(() => {
    if (!isClient) return;

    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, isClient]);

  useEffect(() => {
    if (!isClient) return;

    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isClient]);

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      supplier: '',
      sku: '',
      quantity: '0',
      unit: '',
      unit_price: '',
      location: '',
      status: 'in_stock',
      reorder_level: '0',
      last_ordered: '',
      expiry_date: ''
    });
    setError('');
  };

  const handleEditClick = (material: any) => {
    setEditingMaterial(material);
    setShowCreateForm(false);
    setFormData({
      name: material.name || '',
      description: material.description || '',
      category: material.category || '',
      supplier: material.supplier || '',
      sku: material.sku || '',
      quantity: material.quantity?.toString() || '0',
      unit: material.unit || '',
      unit_price: material.unit_price?.toString() || '',
      location: material.location || '',
      status: material.status || 'in_stock',
      reorder_level: material.reorder_level?.toString() || '0',
      last_ordered: material.last_ordered ? material.last_ordered.split('T')[0] : '',
      expiry_date: material.expiry_date ? material.expiry_date.split('T')[0] : ''
    });
    setError('');
  };

  const handleViewMaterial = (material: any) => {
    setSelectedMaterial(material);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedMaterial(null);
    setViewMode('list');
  };

  const handleDeleteClick = async (material: any) => {
    if (typeof window === 'undefined') return;

    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        setIsLoading(true);
        await deleteRecord(material.id, 'materials');
        setSuccess('Material deleted successfully');
        
        // Refresh materials
        const materialsData = await getAllRecords('materials');
        setMaterials(materialsData);
        
      } catch (error) {
        console.error('Error deleting material:', error);
        setError('Failed to delete material. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
      
      // Validate form
      if (!formData.name.trim() || !formData.category.trim() || !formData.unit.trim()) {
        setError('Name, category, and unit are required');
        setIsLoading(false);
        return;
      }
      
      // Create material
      const materialData = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await createRecord('materials', materialData);
      setSuccess('Material created successfully');
      setShowCreateForm(false);
      
      // Refresh materials
      const materialsData = await getAllRecords('materials');
      setMaterials(materialsData);
      
    } catch (error) {
      console.error('Error creating material:', error);
      setError('Failed to create material. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Validate form
      if (!formData.name.trim() || !formData.category.trim() || !formData.unit.trim()) {
        setError('Name, category, and unit are required');
        setIsLoading(false);
        return;
      }
      
      // Update material
      const materialData = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        updated_at: new Date().toISOString()
      };
      
      await updateRecord(editingMaterial.id, materialData, 'materials');
      setSuccess('Material updated successfully');
      setEditingMaterial(null);
      
      // Refresh materials
      const materialsData = await getAllRecords('materials');
      setMaterials(materialsData);
      
    } catch (error) {
      console.error('Error updating material:', error);
      setError('Failed to update material. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique suppliers for filter (client-side only)
  const suppliers = isClient ? [...new Set(materials.map(m => m.supplier).filter(Boolean))] : [];

  const filteredMaterials = materials.filter(material => {
    // Apply search filter
    const matchesSearch = 
      material.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter;
    
    // Apply supplier filter
    const matchesSupplier = supplierFilter === 'all' || material.supplier === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'discontinued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4 mr-1" />;
      case 'out_of_stock': return <XCircle className="w-4 h-4 mr-1" />;
      case 'discontinued': return <XCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const formatCurrency = (value: number | string) => {
    if (!value) return '$0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderMaterialForm = (isCreate: boolean) => {
    const formTitle = isCreate ? 'Add New Material' : 'Edit Material';
    const submitHandler = isCreate ? handleSubmitCreate : handleSubmitEdit;
    const cancelHandler = isCreate ? () => setShowCreateForm(false) : () => setEditingMaterial(null);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-600" />
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
            {/* Material Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter material name"
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
                placeholder="Enter material description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter supplier name"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter SKU"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter unit price"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter storage location"
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
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleFormChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter reorder level"
              />
            </div>

            {/* Last Ordered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Ordered Date
              </label>
              <input
                type="date"
                name="last_ordered"
                value={formData.last_ordered}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400 flex items-center"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  {isCreate ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreate ? 'Add Material' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderMaterialDetail = () => {
    if (!selectedMaterial) return null;
    
    // Calculate total value safely
    const quantity = selectedMaterial.quantity || 0;
    const unitPrice = selectedMaterial.unit_price || 0;
    const totalValue = quantity * unitPrice;
    
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
            <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.name}</h2>
            <p className="text-gray-600">{selectedMaterial.category} • SKU: {selectedMaterial.sku || 'N/A'}</p>
          </div>
        </div>
        
        {/* Material Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-600" />
              Material Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedMaterial.description || 'No description available'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMaterial.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedMaterial.status)}`}>
                    {getStatusIcon(selectedMaterial.status)}
                    {selectedMaterial.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMaterial.supplier || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {selectedMaterial.location || 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditClick(selectedMaterial)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Material
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedMaterial)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Inventory Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
              Inventory Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-xl font-bold text-gray-900">
                    {quantity} {selectedMaterial.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reorder Level</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMaterial.reorder_level || 0} {selectedMaterial.unit}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(unitPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Last Ordered</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMaterial.last_ordered ? formatDate(selectedMaterial.last_ordered) : 'Not recorded'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMaterial.expiry_date ? formatDate(selectedMaterial.expiry_date) : 'Not applicable'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center hover:bg-green-200 transition-colors">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Add Stock
                  </button>
                  <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium flex items-center hover:bg-orange-200 transition-colors">
                    <ArrowDown className="w-4 h-4 mr-1" />
                    Remove Stock
                  </button>
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center hover:bg-blue-200 transition-colors">
                    <Truck className="w-4 h-4 mr-1" />
                    Order More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Usage History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-purple-600" />
              Usage History
            </h3>
          </div>
          
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No usage history available</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              View Usage Reports
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
          <p className="text-gray-600">Loading materials management...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail') {
    return renderMaterialDetail();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Materials Management</h1>
          <p className="text-gray-600">
            Manage inventory and track construction materials
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Material
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && renderMaterialForm(true)}
      {editingMaterial && renderMaterialForm(false)}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading materials...</p>
            </div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No materials found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or add a new material</p>
            <button
              onClick={handleCreateClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Material
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.map((material) => {
                  const quantity = material.quantity || 0;
                  const unitPrice = material.unit_price || 0;
                  const totalValue = quantity * unitPrice;
                  
                  return (
                    <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="ml-4">
                            <div 
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                              onClick={() => handleViewMaterial(material)}
                            >
                              {material.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {material.sku ? `SKU: ${material.sku}` : 'No SKU'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {material.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {quantity} {material.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(material.status)}`}>
                          {getStatusIcon(material.status)}
                          {material.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewMaterial(material)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(material)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit Material"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(material)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsManagement;