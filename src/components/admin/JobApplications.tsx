"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FileText, Download, Eye, Mail, Phone, Calendar, User, Briefcase, AlertCircle, CheckCircle, Clock, Trash2, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import AnimatedSection from "../AnimatedSection";

interface JobApplication {
  id: string;
  job_title: string;
  name: string;
  email: string;
  phone?: string;
  cover_letter?: string;
  cv_url?: string;
  submitted_at: string;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  experience_years?: number;
  desired_salary?: string;
  availability?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

const JobApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchApplications();
    }
  }, [isClient]);

  const fetchApplications = async () => {
    if (!isClient) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("applied_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error.message, error.details);
        toast.error("Failed to load applications");
        setApplications([]);
      } else {
        setApplications(data || []);
        toast.success(`Loaded ${data?.length || 0} applications`);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    }
    setLoading(false);
  };

  const getCVLink = (cv_url: string) => {
    if (!cv_url) return "#";
    // If it's already a full URL, just return it
    if (cv_url.startsWith("http")) return cv_url;
    // Remove any duplicate bucket prefix
    const cleanedPath = cv_url.replace(/^cv-applications\//, "");
    return `https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/cv-applications/${cleanedPath}`;
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    if (!isClient) return;
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) {
        throw error;
      }
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as JobApplication['status'] }
            : app
        )
      );
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!isClient) return;
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }
    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", applicationId);

      if (error) {
        throw error;
      }
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (filteredApplications.length === 0) return;

    const csvRows: string[] = [];
    // Headers
    csvRows.push([
      "ID",
      "Job Title",
      "Name",
      "Email",
      "Phone",
      "Cover Letter",
      "CV URL",
      "Submitted At",
      "Status",
      "Experience (Years)",
      "Desired Salary",
      "Availability",
      "LinkedIn URL",
      "Portfolio URL"
    ].join(","));

    // Data rows
    filteredApplications.forEach(app => {
      csvRows.push([
        app.id,
        app.job_title,
        app.name,
        app.email,
        app.phone || "",
        app.cover_letter ? `"${app.cover_letter.replace(/"/g, '""')}"` : "",
        app.cv_url ? getCVLink(app.cv_url) : "",
        new Date(app.submitted_at).toISOString(),
        app.status,
        app.experience_years || 0,
        app.desired_salary || "",
        app.availability || "",
        app.linkedin_url || "",
        app.portfolio_url || ""
      ].join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "job_applications.csv");
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <AnimatedSection animation="fade-down" delay={100} duration={600}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications</h1>
          <p className="text-gray-600">Manage and review job applications from candidates</p>
        </div>
      </AnimatedSection>

      {/* Filters, Search, and Export */}
      <AnimatedSection animation="fade-up" delay={200} duration={600}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Export button top right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={filteredApplications.length === 0}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text" 
                  placeholder="Search by name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-base text-gray-900 font-semibold bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 " />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-base text-gray-600 font-semibold bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', count: applications.length, color: 'text-gray-600' },
              { label: 'Pending', count: applications.filter(a => a.status === 'pending').length, color: 'text-yellow-600' },
              { label: 'Reviewed', count: applications.filter(a => a.status === 'reviewed').length, color: 'text-blue-600' },
              { label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length, color: 'text-green-600' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Applications List */}
      {loading ? (
        <AnimatedSection animation="fade-in" delay={300} duration={600}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading applications...</p>
          </div>
        </AnimatedSection>
      ) : filteredApplications.length === 0 ? (
        <AnimatedSection animation="bounce-in" delay={300} duration={600}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "No applications match your current filters." 
                : "No job applications have been submitted yet."
              }
            </p>
          </div>
        </AnimatedSection>
      ) : (
         <div className="grid lg:grid-cols-3 gap-4 mt-6">
          {filteredApplications.map((app, index) => (
            <AnimatedSection 
              key={app.id}
              animation="fade-up" 
              delay={400 + (index * 100)} 
              duration={600}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative">
                {/* Status Badge - Top Right */}
                <div className={`absolute top-6 right-6 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold z-10 ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  <span className="ml-1 capitalize">{app.status || 'pending'}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {app.job_title || "Untitled Position"}
                    </h3>
                    {/* Candidate Info */}
                    <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-800 mt-6 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="font-medium">{app.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{app.email}</span>
                      </div>
                      {app.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{app.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-800">
                      {app.experience_years && (
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-2" />
                          <span>{app.experience_years} years experience</span>
                        </div>
                      )}
                      {app.desired_salary && (
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2">💰</span>
                          <span>{app.desired_salary}</span>
                        </div>
                      )}
                      {app.availability && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{app.availability}</span>
                        </div>
                      )}
                    </div>

                    {/* Cover Letter Preview */}
                    {app.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                        <p className="text-gray-800 text-sm line-clamp-3">
                          {app.cover_letter.length > 200 
                            ? `${app.cover_letter.substring(0, 200)}...` 
                            : app.cover_letter
                          }
                        </p>
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.linkedin_url && (
                        <a
                          href={app.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 text-sm flex items-center font-medium"
                        >
                          <span className="w-4 h-4 mr-1">💼</span>
                          LinkedIn
                        </a>
                      )}
                      {app.portfolio_url && (
                        <a
                          href={app.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 text-sm flex items-center font-medium"
                        >
                          <span className="w-4 h-4 mr-1">🎨</span>
                          Portfolio
                        </a>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col space-y-3 lg:w-48">
                    {/* CV Download */}
                    {app.cv_url ? (
                      <a
                        href={getCVLink(app.cv_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View CV
                      </a>
                    ) : (
                      <div className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        No CV
                      </div>
                    )}

                    {/* Status Actions */}
                    <div className="flex flex-col space-y-2">
                      <select
                        value={app.status || 'pending'}
                        onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                        className="px-3 py-2 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="pending" className="font-semibold text-yellow-700 bg-yellow-50">Pending</option>
                        <option value="reviewed" className="font-semibold text-blue-700 bg-blue-50">Reviewed</option>
                        <option value="shortlisted" className="font-semibold text-green-700 bg-green-50">Shortlisted</option>
                        <option value="rejected" className="font-semibold text-red-700 bg-red-50">Rejected</option>
                      </select>

                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowDetailModal(true);
                        }}
                        className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </button>

                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{selectedApplication.job_title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900 font-medium">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedApplication.email}</p>
                    </div>
                    {selectedApplication.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedApplication.phone}</p>
                      </div>
                    )}
                    {selectedApplication.experience_years && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Experience</label>
                        <p className="text-gray-900">{selectedApplication.experience_years} years</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedApplication.cover_letter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedApplication.cv_url && (
                    <a
                      href={getCVLink(selectedApplication.cv_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      View CV
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;
