"use client";
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Users,
  Building2,
  CheckSquare,
  Package,
  FileText,
  Phone,
  DollarSign,
  Settings,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Globe,
  Server,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Dynamic import for XLSX (client-side only)
let XLSX: any = null;

interface TableData {
  [key: string]: any;
}

interface CreateFormData {
  [key: string]: any;
}

const DatabaseDashboard = () => {
  const { 
    getAllRecords, 
    createRecord, 
    updateRecord, 
    deleteRecord, 
    getStatistics, 
    getRecentActivity,
    isOnline,
    lastSyncTime,
    pendingChanges,
    dataAccuracy,
    verifyDataIntegrity,
    refreshDatabase
  } = useDatabase();
  
  const { user } = useAuth();
  
  const [selectedTable, setSelectedTable] = useState('dashboard');
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableData | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateFormData>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<any>({ isValid: true, issues: [] });
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [queryTimes, setQueryTimes] = useState<{[key: string]: number}>({});
  const [isPerformanceTestRunning, setIsPerformanceTestRunning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
    
    // Load XLSX dynamically on client-side
    import('xlsx').then((xlsxModule) => {
      XLSX = xlsxModule;
    }).catch(error => {
      console.error('Failed to load XLSX library:', error);
    });
  }, []);

  // Available tables based on user role
  const getAvailableTables = () => {
    const baseTables = [
      { id: 'dashboard', name: 'Dashboard Overview', icon: BarChart3, description: 'System overview and statistics' }
    ];

    switch (user?.loginType) {
      case 'admin':
        return [
          ...baseTables,
          { id: 'users', name: 'Users', icon: Users, description: 'User accounts and permissions' },
          { id: 'projects', name: 'Projects', icon: Building2, description: 'Construction projects' },
          { id: 'tasks', name: 'Tasks', icon: CheckSquare, description: 'Project tasks and assignments' },
          { id: 'materials', name: 'Materials', icon: Package, description: 'Inventory and materials' },
          { id: 'documents', name: 'Documents', icon: FileText, description: 'Project documents and files' },
          { id: 'contacts', name: 'Contacts', icon: Phone, description: 'Customer inquiries and leads' },
          { id: 'quotes', name: 'Quotes', icon: DollarSign, description: 'Project quotes and estimates' },
          { id: 'posts', name: 'Posts', icon: FileText, description: 'Blog posts and news' },
          { id: 'settings', name: 'Settings', icon: Settings, description: 'System configuration' },
          { id: 'performance', name: 'Performance', icon: Zap, description: 'Database performance metrics' }
        ];
      case 'manager':
        return [
          ...baseTables,
          { id: 'projects', name: 'Projects', icon: Building2, description: 'Construction projects' },
          { id: 'tasks', name: 'Tasks', icon: CheckSquare, description: 'Project tasks and assignments' },
          { id: 'materials', name: 'Materials', icon: Package, description: 'Inventory and materials' },
          { id: 'documents', name: 'Documents', icon: FileText, description: 'Project documents and files' },
          { id: 'contacts', name: 'Contacts', icon: Phone, description: 'Customer inquiries and leads' },
          { id: 'quotes', name: 'Quotes', icon: DollarSign, description: 'Project quotes and estimates' },
          { id: 'performance', name: 'Performance', icon: Zap, description: 'Database performance metrics' }
        ];
      case 'employee':
        return [
          ...baseTables,
          { id: 'tasks', name: 'Tasks', icon: CheckSquare, description: 'Project tasks and assignments' },
          { id: 'materials', name: 'Materials', icon: Package, description: 'Inventory and materials' },
          { id: 'documents', name: 'Documents', icon: FileText, description: 'Project documents and files' },
          { id: 'performance', name: 'Performance', icon: Zap, description: 'Database performance metrics' }
        ];
      default:
        return baseTables;
    }
  };

  const tables = getAvailableTables();

  // Load data when selected table changes (client-side only)
  useEffect(() => {
    if (isClient) {
      loadData();
    }
  }, [selectedTable, isClient]);

  // Load dashboard data (client-side only)
  useEffect(() => {
    if (isClient && selectedTable === 'dashboard') {
      loadDashboardData();
    }
  }, [selectedTable, isClient]);

  const loadDashboardData = async () => {
    if (!isClient) return;
    
    try {
      setIsLoading(true);
      const stats = await getStatistics();
      setStatistics(stats);
      
      const activity = await getRecentActivity();
      setRecentActivity(activity);
      
      const integrity = await verifyDataIntegrity();
      setIntegrityStatus(integrity);
      
      // Measure network latency
      const startTime = performance.now();
      await supabase.from('settings').select('count').limit(1);
      const endTime = performance.now();
      setNetworkLatency(Math.round(endTime - startTime));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    if (!isClient) return;
    
    if (selectedTable === 'dashboard') {
      return loadDashboardData();
    }
    
    if (selectedTable === 'performance') {
      return loadPerformanceData();
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const startTime = performance.now();
      const data = await getAllRecords(selectedTable);
      const endTime = performance.now();
      
      setTableData(data);
      
      // Update query time for this table
      setQueryTimes(prev => ({
        ...prev,
        [selectedTable]: Math.round(endTime - startTime)
      }));
      
      console.log(`📊 Loaded ${data.length} records from ${selectedTable} in ${Math.round(endTime - startTime)}ms`);
      setIsLoading(false);
    } catch (error) {
      console.error(`Error loading ${selectedTable} data:`, error);
      setError(`Failed to load ${selectedTable} data. Please try again.`);
      setIsLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    if (!isClient) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Measure network latency
      const startTime = performance.now();
      await supabase.from('settings').select('count').limit(1);
      const endTime = performance.now();
      setNetworkLatency(Math.round(endTime - startTime));
      
      // Get integrity status
      const integrity = await verifyDataIntegrity();
      setIntegrityStatus(integrity);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setError('Failed to load performance data. Please try again.');
      setIsLoading(false);
    }
  };

  const runPerformanceTest = async () => {
    if (!isClient) return;
    
    try {
      setIsPerformanceTestRunning(true);
      setError('');
      
      const tables = ['users', 'projects', 'tasks', 'materials', 'documents', 'contacts', 'quotes', 'posts'];
      const newQueryTimes: {[key: string]: number} = {};
      
      // Run tests sequentially to avoid overwhelming the connection
      for (const table of tables) {
        const startTime = performance.now();
        await getAllRecords(table);
        const endTime = performance.now();
        newQueryTimes[table] = Math.round(endTime - startTime);
        
        // Small delay between queries
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setQueryTimes(newQueryTimes);
      setSuccess('Performance test completed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error running performance test:', error);
      setError('Failed to complete performance test. Please try again.');
    } finally {
      setIsPerformanceTestRunning(false);
    }
  };

  const handleRefresh = () => {
    if (!isClient) return;
    
    loadData();
    setSuccess('Data refreshed successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDatabaseRefresh = () => {
    if (!isClient) return;
    
    refreshDatabase();
    setSuccess('Database connection refreshed successfully');
    setTimeout(() => setSuccess(''), 3000);
    loadData();
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    setSearchTerm('');
    setShowCreateForm(false);
    setEditingRecord(null);
    setError('');
    setSuccess('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = tableData.filter(record => {
    if (!searchTerm) return true;
    
    // Search in all string and number fields
    return Object.entries(record).some(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingRecord(null);
    setCreateFormData({});
    setError('');
  };

  const handleEditClick = (record: TableData) => {
    setEditingRecord(record);
    setShowCreateForm(false);
    setCreateFormData({});
    setError('');
  };

  const handleDeleteClick = async (record: TableData) => {
    if (!isClient) return;
    
    if (window.confirm(`Are you sure you want to delete this ${selectedTable.slice(0, -1)}?`)) {
      try {
        setIsLoading(true);
        await deleteRecord(record.id, selectedTable);
        setSuccess(`${selectedTable.slice(0, -1)} deleted successfully`);
        loadData();
      } catch (error) {
        console.error('Error deleting record:', error);
        setError(`Failed to delete ${selectedTable.slice(0, -1)}. Please try again.`);
        setIsLoading(false);
      }
    }
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCreateFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle regular inputs
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Create the record
      const newRecord = await createRecord(selectedTable, createFormData);
      
      setSuccess(`${selectedTable.slice(0, -1)} created successfully`);
      setShowCreateForm(false);
      setCreateFormData({});
      loadData();
    } catch (error: any) {
      console.error('Error creating record:', error);
      setError(`Failed to create ${selectedTable.slice(0, -1)}: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !isClient) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Get form data from the form elements
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const updatedData: {[key: string]: any} = {};
      
      // Convert FormData to object
      formData.forEach((value, key) => {
        updatedData[key] = value;
      });
      
      // Update the record
      await updateRecord(editingRecord.id, updatedData, selectedTable);
      
      setSuccess(`${selectedTable.slice(0, -1)} updated successfully`);
      setEditingRecord(null);
      loadData();
    } catch (error: any) {
      console.error('Error updating record:', error);
      setError(`Failed to update ${selectedTable.slice(0, -1)}: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    if (!isClient || !XLSX) {
      setError('Export functionality is not available. Please try again.');
      return;
    }
    
    try {
      // Create a worksheet from the filtered data
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      
      // Create a workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedTable);
      
      // Generate the file and trigger download
      XLSX.writeFile(workbook, `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    }
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            System Status
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isOnline ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className="font-medium text-gray-900">Connection</span>
              </div>
              <div className={`text-sm mt-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
              {networkLatency !== null && (
                <div className={`text-xs mt-1 ${
                  networkLatency < 300 ? 'text-green-600' : 
                  networkLatency < 1000 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Latency: {networkLatency}ms
                </div>
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center">
                <Server className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <div className="text-sm mt-1 text-blue-600">
                Connected
              </div>
              {pendingChanges > 0 && (
                <div className="text-xs mt-1 text-yellow-600">
                  {pendingChanges} pending changes
                </div>
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-purple-500 mr-2" />
                <span className="font-medium text-gray-900">Last Sync</span>
              </div>
              <div className="text-sm mt-1 text-purple-600">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
              </div>
              {lastSyncTime && (
                <div className="text-xs mt-1 text-purple-600">
                  {new Date(lastSyncTime).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className={`p-4 rounded-lg ${dataAccuracy >= 95 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium text-gray-900">Data Accuracy</span>
              </div>
              <div className={`text-sm mt-1 ${dataAccuracy >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                {dataAccuracy}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    dataAccuracy >= 95 ? 'bg-green-500' : 
                    dataAccuracy >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dataAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Data Integrity Status */}
          {!integrityStatus.isValid && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-red-800">Data Integrity Issues Detected</h4>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {integrityStatus.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDatabaseRefresh}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Connection
            </button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
            Key Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{statistics.totalProjects || 0}</div>
              <div className="text-sm text-blue-600">Total Projects</div>
              <div className="text-xs text-blue-500 mt-1">{statistics.activeProjects || 0} active</div>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{statistics.totalTasks || 0}</div>
              <div className="text-sm text-green-600">Total Tasks</div>
              <div className="text-xs text-green-500 mt-1">{statistics.completedTasks || 0} completed</div>
            </div>
            
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{statistics.totalContacts || 0}</div>
              <div className="text-sm text-orange-600">Total Contacts</div>
              <div className="text-xs text-orange-500 mt-1">{statistics.newContacts || 0} new</div>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{statistics.totalQuotes || 0}</div>
              <div className="text-sm text-purple-600">Total Quotes</div>
              <div className="text-xs text-purple-500 mt-1">{statistics.pendingQuotes || 0} pending</div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Recent Activity
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">{activity.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        {activity.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.validated ? 'Validated' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No recent activity found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceData = () => {
    return (
      <div className="space-y-8">
        {/* Performance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Database Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Network Latency</span>
                <span className={`text-sm font-medium ${
                  networkLatency === null ? 'text-gray-500' :
                  networkLatency < 300 ? 'text-green-600' : 
                  networkLatency < 1000 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {networkLatency === null ? 'Unknown' : `${networkLatency}ms`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                {networkLatency !== null && (
                  <div 
                    className={`h-2 rounded-full ${
                      networkLatency < 300 ? 'bg-green-500' : 
                      networkLatency < 1000 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, networkLatency / 20)}%` }}
                  ></div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {networkLatency === null ? 'Not measured' :
                 networkLatency < 300 ? 'Good' : 
                 networkLatency < 1000 ? 'Moderate' : 'Poor'}
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Data Accuracy</span>
                <span className={`text-sm font-medium ${
                  dataAccuracy >= 95 ? 'text-green-600' : 
                  dataAccuracy >= 90 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dataAccuracy}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    dataAccuracy >= 95 ? 'bg-green-500' : 
                    dataAccuracy >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dataAccuracy}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dataAccuracy >= 95 ? 'Excellent' : 
                 dataAccuracy >= 90 ? 'Good' : 'Needs Attention'}
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Sync Status</span>
                <span className={`text-sm font-medium ${
                  pendingChanges === 0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {pendingChanges === 0 ? 'Synced' : `${pendingChanges} pending`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    pendingChanges === 0 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: pendingChanges === 0 ? '100%' : `${Math.max(5, 100 - (pendingChanges * 10))}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Connection Status:</span> {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDatabaseRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={isPerformanceTestRunning}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Connection
              </button>
              <button
                onClick={runPerformanceTest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                disabled={isPerformanceTestRunning}
              >
                {isPerformanceTestRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Running Test...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Performance Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Query Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Query Performance
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Query Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(queryTimes).length > 0 ? (
                  Object.entries(queryTimes).map(([table, time], index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {table}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                time < 500 ? 'bg-green-500' : 
                                time < 2000 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, time / 50)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${
                            time < 500 ? 'text-green-600' : 
                            time < 2000 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {time}ms
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          time < 500 ? 'bg-green-100 text-green-800' : 
                          time < 2000 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {time < 500 ? 'Good' : time < 2000 ? 'Moderate' : 'Slow'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No query performance data available. Run a performance test to see results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTableData = () => {
    if (selectedTable === 'dashboard') {
      return renderDashboard();
    }
    
    if (selectedTable === 'performance') {
      return renderPerformanceData();
    }
    
    if (isLoading && tableData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    if (tableData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Database className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No data found in {selectedTable}</p>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New {selectedTable.slice(0, -1)}
          </button>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Search className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No results found for "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Clear Search
          </button>
        </div>
      );
    }

    // Get column headers from the first record
    const firstRecord = filteredData[0];
    const columns = Object.keys(firstRecord).filter(key => 
      // Exclude complex objects and arrays from display
      typeof firstRecord[key] !== 'object' || firstRecord[key] === null
    );

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map(column => (
                  <th 
                    key={column} 
                    className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map(column => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCellValue(record[column])}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(record)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
      </div>
    );
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 
        <span className="text-green-600">Yes</span> : 
        <span className="text-red-600">No</span>;
    }
    
    if (typeof value === 'object') {
      if (value.name) {
        return value.name;
      }
      return JSON.stringify(value).substring(0, 30) + '...';
    }
    
    // Format dates
    if (typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      } catch (e) {
        // Not a valid date, continue with default rendering
      }
    }
    
    return String(value);
  };

  // Simplified form rendering for brevity - you would include all the form logic here
  const renderCreateForm = () => {
    if (!showCreateForm) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Create New {selectedTable.slice(0, -1)}
          </h3>
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmitCreate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={createFormData.name || ''}
                onChange={handleCreateFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={createFormData.description || ''}
                onChange={handleCreateFormChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editingRecord) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Edit {selectedTable.slice(0, -1)}
          </h3>
          <button
            onClick={() => setEditingRecord(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitEdit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={editingRecord.name || ''}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editingRecord.description || ''}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
          <p className="text-gray-600">
            Manage and explore your database tables
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
          {selectedTable !== 'dashboard' && selectedTable !== 'performance' && (
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {tables.map((table) => {
          const IconComponent = table.icon;
          return (
            <button
              key={table.id}
              onClick={() => handleTableSelect(table.id)}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center text-center ${
                selectedTable === table.id
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <IconComponent className={`w-6 h-6 mb-2 ${
                selectedTable === table.id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`font-medium ${
                selectedTable === table.id ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {table.name}
              </span>
              <span className="text-xs text-gray-500 mt-1">{table.description}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      {selectedTable !== 'dashboard' && selectedTable !== 'performance' && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${selectedTable}...`}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              title="Export to Excel"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {renderCreateForm()}

      {/* Edit Form */}
      {renderEditForm()}

      {/* Table Data */}
      {renderTableData()}
    </div>
  );
};

export default DatabaseDashboard;