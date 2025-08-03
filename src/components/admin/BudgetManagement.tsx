"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  PieChart, 
  Calendar, 
  Download, 
  RefreshCw, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Save, 
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

// Dynamically import chart components to avoid SSR issues
const Pie = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Pie })), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chart...</p>
      </div>
    </div>
  )
});

const Bar = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chart...</p>
      </div>
    </div>
  )
});

// XLSX import handled differently for SSR
const useXLSX = () => {
  const [XLSX, setXLSX] = useState<any>(null);
  
  useEffect(() => {
    import('xlsx').then((module) => {
      setXLSX(module);
    });
  }, []);
  
  return XLSX;
};

const BudgetManagement = () => {
  const { getAllRecords } = useDatabase();
  const { user } = useAuth();
  const XLSX = useXLSX();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Register Chart.js components (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const registerChartComponents = async () => {
      try {
        const {
          Chart,
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend,
          ArcElement,
        } = await import('chart.js');

        Chart.register(
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend,
          ArcElement
        );
      } catch (error) {
        console.log('Chart.js registration not needed or failed:', error);
      }
    };

    registerChartComponents();
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const projectsData = await getAllRecords('projects');
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading budget data:', error);
        setError('Failed to load budget data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isClient]);

  const handleRefresh = async () => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      const projectsData = await getAllRecords('projects');
      setProjects(projectsData);
      setSuccess('Budget data refreshed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error refreshing budget data:', error);
      setError('Failed to refresh budget data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBudget = async () => {
    if (!isClient || isExporting) return;

    setIsExporting(true);
    try {
      // Dynamically import XLSX
      const XLSXModule = await import('xlsx');
      
      // Prepare data for export
      const dataToExport = projects.map(project => ({
        name: project.name,
        status: project.status,
        budget: project.budget || 0,
        spent: project.spent || 0,
        remaining: (project.budget || 0) - (project.spent || 0),
        utilization: project.budget ? Math.round((project.spent || 0) / project.budget * 100) : 0,
        manager: project.manager?.name || 'Unassigned',
        startDate: project.start_date,
        endDate: project.end_date
      }));
      
      // Create a worksheet from the data
      const worksheet = XLSXModule.utils.json_to_sheet(dataToExport);
      
      // Create a workbook and add the worksheet
      const workbook = XLSXModule.utils.book_new();
      XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Budget');
      
      // Generate the file and trigger download
      XLSXModule.writeFile(workbook, `budget_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setSuccess('Budget data exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting budget data:', error);
      setError('Failed to export budget data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    // Apply search filter
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    // Apply budget filter
    let matchesBudget = true;
    if (budgetFilter === 'under-50k') {
      matchesBudget = (project.budget || 0) < 50000;
    } else if (budgetFilter === '50k-100k') {
      matchesBudget = (project.budget || 0) >= 50000 && (project.budget || 0) < 100000;
    } else if (budgetFilter === '100k-250k') {
      matchesBudget = (project.budget || 0) >= 100000 && (project.budget || 0) < 250000;
    } else if (budgetFilter === 'over-250k') {
      matchesBudget = (project.budget || 0) >= 250000;
    }
    
    return matchesSearch && matchesStatus && matchesBudget;
  });

  // Calculate total budget and spent
  const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const totalSpent = projects.reduce((sum, project) => sum + (project.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Prepare chart data (only when projects are available and client-side)
  const budgetByStatusData = isClient && projects.length > 0 ? {
    labels: ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    datasets: [
      {
        label: 'Budget',
        data: [
          projects.filter(p => p.status === 'planning').reduce((sum, p) => sum + (p.budget || 0), 0),
          projects.filter(p => p.status === 'in_progress').reduce((sum, p) => sum + (p.budget || 0), 0),
          projects.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.budget || 0), 0),
          projects.filter(p => p.status === 'on_hold').reduce((sum, p) => sum + (p.budget || 0), 0),
          projects.filter(p => p.status === 'cancelled').reduce((sum, p) => sum + (p.budget || 0), 0)
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  } : null;

  const topProjectsByBudgetData = isClient && projects.length > 0 ? {
    labels: projects.sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 5).map(p => p.name),
    datasets: [
      {
        label: 'Budget',
        data: projects.sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 5).map(p => p.budget || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Spent',
        data: projects.sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 5).map(p => p.spent || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  const formatCurrency = (value: number) => {
    if (!isClient) return '$0';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } catch (error) {
      return `$${value.toLocaleString()}`;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 90) return 'text-orange-600';
    if (utilization > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBarColor = (utilization: number) => {
    if (utilization > 100) return 'bg-red-600';
    if (utilization > 90) return 'bg-orange-600';
    if (utilization > 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  // Chart options with proper configuration for Next.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budget management...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
          <p className="text-gray-600">
            Track and manage project budgets and expenditures
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportBudget}
            disabled={isExporting || projects.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export Budget'}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-500 font-medium">Total Budget</div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(totalBudget)}</div>
          <div className="text-sm text-gray-500">Across {projects.length} projects</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-500 font-medium">Total Spent</div>
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(totalSpent)}</div>
          <div className="text-sm text-gray-500">
            {overallUtilization}% of total budget
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-500 font-medium">Remaining Budget</div>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(totalRemaining)}</div>
          <div className="text-sm text-gray-500">
            {100 - overallUtilization}% of total budget
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-500 font-medium">Budget Utilization</div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${getUtilizationColor(overallUtilization)} mb-1`}>
            {overallUtilization}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${getUtilizationBarColor(overallUtilization)}`} 
              style={{ width: `${Math.min(overallUtilization, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
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
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Budget Filter */}
          <div>
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Budget Ranges</option>
              <option value="under-50k">Under $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-250k">$100,000 - $250,000</option>
              <option value="over-250k">Over $250,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Budget by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Budget by Project Status
          </h3>
          <div className="h-64">
            {budgetByStatusData ? (
              <Pie data={budgetByStatusData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No budget data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Projects by Budget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-green-600" />
            Top 5 Projects by Budget
          </h3>
          <div className="h-64">
            {topProjectsByBudgetData ? (
              <Bar data={topProjectsByBudgetData} options={barChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No budget data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading budget data...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No projects found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const budget = project.budget || 0;
                  const spent = project.spent || 0;
                  const remaining = budget - spent;
                  const utilization = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.manager?.name || 'Unassigned'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
                          project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(remaining)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full transition-all duration-300 ${getUtilizationBarColor(utilization)}`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${getUtilizationColor(utilization)}`}>
                            {utilization}%
                          </span>
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

export default BudgetManagement;