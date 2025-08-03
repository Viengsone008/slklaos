"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  DollarSign, 
  Users, 
  Building2, 
  CheckSquare,
  Package,
  Phone,
  FileText
} from 'lucide-react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from "../../lib/supabase";
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to prevent SSR issues
const Chart = dynamic(() => import('react-chartjs-2').then(mod => ({
  Pie: mod.Pie,
  Bar: mod.Bar,
  Line: mod.Line
})), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading Chart...</p>
    </div>
  )
});

// Dynamically import XLSX to prevent SSR issues
const XLSX = dynamic(() => import('xlsx'), {
  ssr: false
});

// Chart.js registration (client-side only)
let ChartJS: any = null;
let Pie: any = null;
let Bar: any = null;
let Line: any = null;

if (typeof window !== 'undefined') {
  const chartModule = require('chart.js');
  const reactChartModule = require('react-chartjs-2');
  
  ChartJS = chartModule.Chart;
  ChartJS.register(
    chartModule.ArcElement, 
    chartModule.Tooltip, 
    chartModule.Legend, 
    chartModule.CategoryScale, 
    chartModule.LinearScale, 
    chartModule.BarElement, 
    chartModule.Title,
    chartModule.PointElement,
    chartModule.LineElement
  );
  
  Pie = reactChartModule.Pie;
  Bar = reactChartModule.Bar;
  Line = reactChartModule.Line;
}

interface Project {
  id: string;
  name: string;
  status: string;
  budget?: number;
  spent?: number;
  progress?: number;
  location?: string;
  start_date?: string;
  end_date?: string;
  manager?: { name: string };
  client_name?: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_user?: { name: string };
  project?: { name: string };
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  category?: string;
  created_at: string;
}

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price?: number;
  total_value?: number;
  status: string;
  location?: string;
  supplier?: string;
  sku?: string;
  reorder_level?: number;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  status: string;
  source?: string;
  service?: string;
  lead_score?: number;
  estimated_value?: number;
  created_at: string;
}

interface Quote {
  id: string;
  name: string;
  email: string;
  status: string;
  project_type?: string;
  budget_range?: string;
  estimated_value?: number;
  quoted_amount?: number;
  win_probability?: number;
  source?: string;
  created_at: string;
}

const ReportsDashboard = () => {
  const { getAllRecords, getStatistics } = useDatabase();
  const { user } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [error, setError] = useState('');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load statistics
        const statsData = await getStatistics();
        setStats(statsData);

        // Load data for reports
        const [projectsData, tasksData, materialsData, contactsData, quotesData] = await Promise.all([
          getAllRecords('projects'),
          getAllRecords('tasks'),
          getAllRecords('materials'),
          getAllRecords('contacts'),
          getAllRecords('quotes')
        ]);
        
        setProjects(projectsData || []);
        setTasks(tasksData || []);
        setMaterials(materialsData || []);
        setContacts(contactsData || []);
        setQuotes(quotesData || []);
      } catch (error) {
        console.error('Error loading report data:', error);
        setError('Failed to load report data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isClient, getAllRecords, getStatistics]);

  const handleRefresh = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      // Reload all data
      const statsData = await getStatistics();
      setStats(statsData);

      const [projectsData, tasksData, materialsData, contactsData, quotesData] = await Promise.all([
        getAllRecords('projects'),
        getAllRecords('tasks'),
        getAllRecords('materials'),
        getAllRecords('contacts'),
        getAllRecords('quotes')
      ]);
      
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setMaterials(materialsData || []);
      setContacts(contactsData || []);
      setQuotes(quotesData || []);
    } catch (error) {
      console.error('Error refreshing report data:', error);
      setError('Failed to refresh report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      const xlsxModule = await import('xlsx');
      
      let dataToExport: any[] = [];
      let fileName = 'report';
      
      // Determine which data to export based on report type
      switch (reportType) {
        case 'overview':
          dataToExport = [
            { 
              category: 'Projects', 
              total: projects.length,
              active: projects.filter(p => p.status === 'in_progress').length,
              completed: projects.filter(p => p.status === 'completed').length
            },
            { 
              category: 'Tasks', 
              total: tasks.length,
              pending: tasks.filter(t => t.status === 'pending').length,
              inProgress: tasks.filter(t => t.status === 'in_progress').length,
              completed: tasks.filter(t => t.status === 'completed').length
            },
            { 
              category: 'Materials', 
              total: materials.length,
              inStock: materials.filter(m => m.status === 'in_stock').length,
              lowStock: materials.filter(m => m.status === 'low_stock').length,
              outOfStock: materials.filter(m => m.status === 'out_of_stock').length
            },
            { 
              category: 'Contacts', 
              total: contacts.length,
              new: contacts.filter(c => c.status === 'new').length,
              contacted: contacts.filter(c => c.status === 'contacted').length,
              converted: contacts.filter(c => c.status === 'converted').length
            },
            { 
              category: 'Quotes', 
              total: quotes.length,
              new: quotes.filter(q => q.status === 'new').length,
              quoted: quotes.filter(q => q.status === 'quoted').length,
              accepted: quotes.filter(q => q.status === 'accepted').length
            }
          ];
          fileName = 'overview_report';
          break;
        case 'projects':
          dataToExport = projects.map(p => ({
            name: p.name,
            status: p.status,
            budget: p.budget,
            spent: p.spent,
            progress: p.progress,
            location: p.location,
            startDate: p.start_date,
            endDate: p.end_date,
            manager: p.manager?.name || 'Unassigned',
            client: p.client_name
          }));
          fileName = 'projects_report';
          break;
        case 'tasks':
          dataToExport = tasks.map(t => ({
            title: t.title,
            status: t.status,
            priority: t.priority,
            assignedTo: t.assigned_user?.name || 'Unassigned',
            project: t.project?.name || 'No project',
            dueDate: t.due_date,
            estimatedHours: t.estimated_hours,
            actualHours: t.actual_hours,
            category: t.category
          }));
          fileName = 'tasks_report';
          break;
        case 'materials':
          dataToExport = materials.map(m => ({
            name: m.name,
            category: m.category,
            quantity: m.quantity,
            unit: m.unit,
            unitPrice: m.unit_price,
            totalValue: m.total_value,
            status: m.status,
            location: m.location,
            supplier: m.supplier,
            sku: m.sku,
            reorderLevel: m.reorder_level
          }));
          fileName = 'materials_report';
          break;
        case 'sales':
          dataToExport = [
            ...contacts.map(c => ({
              type: 'Contact',
              name: c.name,
              email: c.email,
              status: c.status,
              source: c.source,
              service: c.service,
              leadScore: c.lead_score,
              estimatedValue: c.estimated_value,
              createdAt: c.created_at
            })),
            ...quotes.map(q => ({
              type: 'Quote',
              name: q.name,
              email: q.email,
              status: q.status,
              projectType: q.project_type,
              budgetRange: q.budget_range,
              estimatedValue: q.estimated_value,
              quotedAmount: q.quoted_amount,
              winProbability: q.win_probability,
              createdAt: q.created_at
            }))
          ];
          fileName = 'sales_report';
          break;
        default:
          dataToExport = [];
      }
      
      // Create a worksheet from the data
      const worksheet = xlsxModule.utils.json_to_sheet(dataToExport);
      
      // Create a workbook and add the worksheet
      const workbook = xlsxModule.utils.book_new();
      xlsxModule.utils.book_append_sheet(workbook, worksheet, reportType);
      
      // Generate the file and trigger download
      xlsxModule.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report. Please try again.');
    }
  };

  // Prepare chart data
  const projectStatusData = {
    labels: ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    datasets: [
      {
        data: [
          projects.filter(p => p.status === 'planning').length,
          projects.filter(p => p.status === 'in_progress').length,
          projects.filter(p => p.status === 'completed').length,
          projects.filter(p => p.status === 'on_hold').length,
          projects.filter(p => p.status === 'cancelled').length
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
        borderWidth: 1,
      },
    ],
  };

  const taskStatusData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [
          tasks.filter(t => t.status === 'pending').length,
          tasks.filter(t => t.status === 'in_progress').length,
          tasks.filter(t => t.status === 'completed').length,
          tasks.filter(t => t.status === 'cancelled').length
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
      },
    ],
  };

  const materialStatusData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'],
    datasets: [
      {
        label: 'Materials by Status',
        data: [
          materials.filter(m => m.status === 'in_stock').length,
          materials.filter(m => m.status === 'low_stock').length,
          materials.filter(m => m.status === 'out_of_stock').length,
          materials.filter(m => m.status === 'discontinued').length
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
      },
    ],
  };

  const salesData = {
    labels: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'],
    datasets: [
      {
        label: 'Contacts',
        data: [
          contacts.filter(c => c.status === 'new').length,
          contacts.filter(c => c.status === 'contacted').length,
          contacts.filter(c => c.status === 'qualified').length,
          contacts.filter(c => c.status === 'converted').length,
          contacts.filter(c => c.status === 'closed').length
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Quotes',
        data: [
          quotes.filter(q => q.status === 'new').length,
          quotes.filter(q => q.status === 'reviewing').length,
          quotes.filter(q => q.status === 'quoted').length,
          quotes.filter(q => q.status === 'accepted').length,
          quotes.filter(q => q.status === 'rejected').length
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const budgetData = {
    labels: projects.slice(0, 5).map(p => p.name),
    datasets: [
      {
        label: 'Budget',
        data: projects.slice(0, 5).map(p => p.budget || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Spent',
        data: projects.slice(0, 5).map(p => p.spent || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const ChartComponent: React.FC<{ type: 'pie' | 'bar' | 'line'; data: any; options?: any }> = ({ type, data, options }) => {
    if (!isClient || !Pie || !Bar || !Line) {
      return (
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading Chart...</p>
        </div>
      );
    }

    const defaultOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
      ...options
    };

    switch (type) {
      case 'pie':
        return <Pie data={data} options={defaultOptions} />;
      case 'bar':
        return <Bar data={data} options={defaultOptions} />;
      case 'line':
        return <Line data={data} options={defaultOptions} />;
      default:
        return null;
    }
  };

  const renderOverviewReport = () => {
    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 font-medium">Projects</div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{projects.length}</div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">{projects.filter(p => p.status === 'completed').length} completed</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-blue-600 font-medium">{projects.filter(p => p.status === 'in_progress').length} active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 font-medium">Tasks</div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{tasks.length}</div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">{tasks.filter(t => t.status === 'completed').length} completed</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-orange-600 font-medium">{tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length} pending</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 font-medium">Materials</div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{materials.length}</div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">{materials.filter(m => m.status === 'in_stock').length} in stock</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-red-600 font-medium">{materials.filter(m => m.status === 'low_stock' || m.status === 'out_of_stock').length} low/out</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 font-medium">Contacts</div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{contacts.length}</div>
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">{contacts.filter(c => c.status === 'new').length} new</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-green-600 font-medium">{contacts.filter(c => c.status === 'converted').length} converted</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 font-medium">Quotes</div>
              <div className="bg-red-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{quotes.length}</div>
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">{quotes.filter(q => q.status === 'new' || q.status === 'reviewing').length} pending</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-green-600 font-medium">{quotes.filter(q => q.status === 'accepted').length} accepted</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Status Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Project Status
            </h3>
            <div className="h-64 flex items-center justify-center">
              {projects.length > 0 ? (
                <ChartComponent type="pie" data={projectStatusData} />
              ) : (
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No projects data</p>
                </div>
              )}
            </div>
          </div>

          {/* Task Status Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-600" />
              Task Status
            </h3>
            <div className="h-64 flex items-center justify-center">
              {tasks.length > 0 ? (
                <ChartComponent type="pie" data={taskStatusData} />
              ) : (
                <div className="text-center">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No tasks data</p>
                </div>
              )}
            </div>
          </div>

          {/* Material Status Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-orange-600" />
              Material Status
            </h3>
            <div className="h-64 flex items-center justify-center">
              {materials.length > 0 ? (
                <ChartComponent type="pie" data={materialStatusData} />
              ) : (
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No materials data</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Pipeline Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-purple-600" />
              Sales Pipeline
            </h3>
            <div className="h-64 flex items-center justify-center">
              {contacts.length > 0 || quotes.length > 0 ? (
                <ChartComponent 
                  type="bar" 
                  data={salesData} 
                  options={{ 
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              ) : (
                <div className="text-center">
                  <Phone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No sales data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Budget Overview
          </h3>
          <div className="h-80">
            {projects.length > 0 ? (
              <ChartComponent 
                type="bar" 
                data={budgetData} 
                options={{ 
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No budget data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectsReport = () => {
    // Project progress by status
    const projectProgress = {
      labels: projects.filter(p => p.status === 'in_progress').slice(0, 5).map(p => p.name),
      datasets: [
        {
          label: 'Progress (%)',
          data: projects.filter(p => p.status === 'in_progress').slice(0, 5).map(p => p.progress || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }
      ]
    };

    // Project budget utilization
    const projectBudgetUtilization = projects.map(p => ({
      name: p.name,
      budget: p.budget || 0,
      spent: p.spent || 0,
      utilization: p.budget ? Math.round((p.spent || 0) / p.budget * 100) : 0
    })).sort((a, b) => b.utilization - a.utilization).slice(0, 5);

    return (
      <div className="space-y-8">
        {/* Project Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Total Projects</div>
            <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Active Projects</div>
            <div className="text-3xl font-bold text-blue-600">{projects.filter(p => p.status === 'in_progress').length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Completed Projects</div>
            <div className="text-3xl font-bold text-green-600">{projects.filter(p => p.status === 'completed').length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Total Budget</div>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
            </div>
          </div>
        </div>

        {/* Project Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Project Status Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {projects.length > 0 ? (
              <ChartComponent type="pie" data={projectStatusData} />
            ) : (
              <div className="text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No projects data</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Active Project Progress
          </h3>
          <div className="h-64 flex items-center justify-center">
            {projects.filter(p => p.status === 'in_progress').length > 0 ? (
              <ChartComponent 
                type="bar" 
                data={projectProgress} 
                options={{ 
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No active projects</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
            Top 5 Projects by Budget Utilization
          </h3>
          {projectBudgetUtilization.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projectBudgetUtilization.map((project, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(project.budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(project.spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                project.utilization > 90 ? 'bg-red-600' : 
                                project.utilization > 70 ? 'bg-orange-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(project.utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-900">{project.utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No budget data available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSalesReport = () => {
    // Monthly sales data (quotes by month)
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlySales = months.map(month => {
      const monthIndex = months.indexOf(month);
      return quotes.filter(q => {
        const quoteDate = new Date(q.created_at);
        return quoteDate.getFullYear() === currentYear && quoteDate.getMonth() === monthIndex;
      }).length;
    });

    const monthlySalesData = {
      labels: months,
      datasets: [
        {
          label: 'Quotes',
          data: monthlySales,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Quote value by status
    const quoteValueByStatus = {
      labels: ['New', 'Reviewing', 'Quoted', 'Accepted', 'Rejected'],
      datasets: [
        {
          label: 'Total Value',
          data: [
            quotes.filter(q => q.status === 'new').reduce((sum, q) => sum + (q.estimated_value || 0), 0),
            quotes.filter(q => q.status === 'reviewing').reduce((sum, q) => sum + (q.estimated_value || 0), 0),
            quotes.filter(q => q.status === 'quoted').reduce((sum, q) => sum + (q.quoted_amount || q.estimated_value || 0), 0),
            quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.quoted_amount || q.estimated_value || 0), 0),
            quotes.filter(q => q.status === 'rejected').reduce((sum, q) => sum + (q.quoted_amount || q.estimated_value || 0), 0)
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ]
        }
      ]
    };

    // Lead sources
    const leadSources = [...new Set([...contacts, ...quotes].map(item => item.source).filter(Boolean))];
    const leadsBySource = leadSources.map(source => ({
      source,
      count: contacts.filter(c => c.source === source).length + quotes.filter(q => q.source === source).length
    })).sort((a, b) => b.count - a.count);

    return (
      <div className="space-y-8">
        {/* Sales Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Total Leads</div>
            <div className="text-3xl font-bold text-gray-900">{contacts.length + quotes.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Quotes Generated</div>
            <div className="text-3xl font-bold text-blue-600">{quotes.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Conversion Rate</div>
            <div className="text-3xl font-bold text-green-600">
              {quotes.length > 0 ? 
                Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100) : 0}%
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-gray-500 font-medium mb-2">Total Quote Value</div>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(quotes.reduce((sum, q) => sum + (q.quoted_amount || q.estimated_value || 0), 0))}
            </div>
          </div>
        </div>

        {/* Monthly Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Quote Trend ({currentYear})
          </h3>
          <div className="h-64 flex items-center justify-center">
            {quotes.length > 0 ? (
              <ChartComponent 
                type="line" 
                data={monthlySalesData} 
                options={{ 
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No quote data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quote Value by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Quote Value by Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            {quotes.length > 0 ? (
              <ChartComponent 
                type="bar" 
                data={quoteValueByStatus} 
                options={{ 
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No quote data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Lead Sources
          </h3>
          {leadsBySource.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leadsBySource.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {item.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-purple-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.round((item.count / (contacts.length + quotes.length)) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-900">
                            {Math.round((item.count / (contacts.length + quotes.length)) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No lead source data available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReport = () => {
    switch (reportType) {
      case 'overview':
        return renderOverviewReport();
      case 'projects':
        return renderProjectsReport();
      case 'sales':
        return renderSalesReport();
      default:
        return renderOverviewReport();
    }
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Reports Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">
            Comprehensive reports and analytics for business insights
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
            onClick={handleExportReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="overview">Overview Report</option>
                <option value="projects">Projects Report</option>
                <option value="sales">Sales & Leads Report</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default ReportsDashboard;