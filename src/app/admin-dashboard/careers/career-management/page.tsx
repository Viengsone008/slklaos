"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Briefcase, Mail, Users, Settings, TrendingUp, Files } from "lucide-react";
import dynamic from "next/dynamic";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ApplicationEmailManagementModal from "@/components/ApplicationEmailManagementModal";
import InterviewReminderEmail from "@/components/InterviewReminderEmail";

const JobManagement = dynamic(() => import("@/components/admin/JobManagement"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>,
  ssr: false
});

const AdminJobApplications = dynamic(
  () => import("../job-applications/page"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>,
    ssr: false,
  }
);

const InterviewAppointment = dynamic(
  () => import("../InterviewAppointment/page"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>,
    ssr: false,
  }
);

const CareerManagement = () => {
  const [activeTab, setActiveTab] = useState("vacancy");
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const tabNavRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch real data from Supabase
  const loadStats = async () => {
    try {
      // Fetch jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*");
      // Fetch applications
      const { data: applications, error: appsError } = await supabase
        .from("job_applications")
        .select("*");

      if (jobsError) throw jobsError;
      if (appsError) throw appsError;

      setStats({
        totalJobs: jobs?.length || 0,
        activeJobs: jobs?.filter((job: any) =>
          ["active", "published", "open"].includes((job.status || "").toLowerCase())
        ).length || 0,
        totalApplications: applications?.length || 0,
        pendingApplications: applications?.filter((app: any) => app.status === "pending").length || 0
      });
    } catch (error) {
      console.error("Error loading career stats:", error);
      toast.error("Failed to load career statistics.");
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadStats();
  }, []);

  useEffect(() => {
    if (isClient) {
      loadStats();
    }
  }, [activeTab, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career management...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "vacancy",
      label: "Job Management",
      icon: Briefcase,
      description: "Create and manage job postings"
    },
    {
      id: "applications", 
      label: "Applications",
      icon: Mail,
      description: "Review job applications"
    },
     {
      id: "send-email",
      label: "Send Email",
      icon: Mail,
      description: "Send email to job applicants"
    },
    {
      id: "appointment",
      label: "Interview Appointment",
      icon: Settings,
      description: "Set and manage interview slots"
    },
   
    {
      id: "send-remind-email",
      label: "Send Reminder Email",
      icon: Mail,
      description: "Send reminder email to shortlisted applicants"
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    toast.success(`Switched to ${tabs.find(t => t.id === tabId)?.label}`);
    // Scroll to tab navigation
    tabNavRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickReviewApplications = () => {
    setActiveTab("applications");
    tabNavRef.current?.scrollIntoView({ behavior: "smooth" });
    toast.success("Switched to Applications");
  };


  const handleQuickCreateJob = () => {
    setActiveTab("vacancy");
    tabNavRef.current?.scrollIntoView({ behavior: "smooth" });
    toast.success("Switched to Job Management");
  };

  const handleQuickSendEmail = () => {
    setActiveTab("send-email");
    tabNavRef.current?.scrollIntoView({ behavior: "smooth" });
    toast.success("Switched to Send Email");
  };
  const handleQuickSetAppointment = () => {
    setActiveTab("appointment");
    tabNavRef.current?.scrollIntoView({ behavior: "smooth" });
    toast.success("Switched to Interview Appointment");
  };
  const handleQuickSendRemindEmail = () => {
    setActiveTab("send-remind-email");
    tabNavRef.current?.scrollIntoView({ behavior: "smooth" });
    toast.success("Switched to Send Reminder Email");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3500,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }} 
      />
      {/* Sticky Top Quick Actions Bar */}
      <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg px-2 sm:px-4 md:px-6 py-4 flex flex-wrap items-center gap-2 sm:gap-4">
        <button 
          onClick={handleQuickCreateJob}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Briefcase className="w-5 h-5" />
          <span>Create New Job</span>
        </button>
        <button 
          onClick={handleQuickReviewApplications}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Files className="w-5 h-5" />
          <span>Review Applications</span>
        </button>
        <button
          onClick={handleQuickSendEmail}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Mail className="w-5 h-5" />
          <span>Send Shortlisted Email</span>
        </button>
         <button
          onClick={handleQuickSetAppointment}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          <span>Interview Appointment</span>
        </button>
        <button
          onClick={handleQuickSendRemindEmail}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Mail className="w-5 h-5" />
          <span>Send Reminder Email</span>
        </button>
      </div>
      {/* Header Section */}
      <AnimatedSection animation="fade-down" delay={100} duration={600}>
        <div className="bg-white shadow-sm border-b border-gray-200 px-2 sm:px-4 md:px-6 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Career Management</h1>
                <p className="text-gray-600 text-sm md:text-base">Manage job postings and applications for SLK Trading & Construction</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 md:px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold text-sm md:text-base">HR Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="flex flex-col">
        {/* Main Content */}
        <main className="flex-1">
          {/* Statistics Cards */}
          <AnimatedSection animation="fade-up" delay={300} duration={600}>
            <div className="max-w-8xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
              <div className="grid lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Total Jobs",
                    value: stats.totalJobs,
                    icon: Briefcase,
                    color: "bg-blue-500",
                    description: "All job postings"
                  },
                  {
                    title: "Active Jobs",
                    value: stats.activeJobs,
                    icon: Settings,
                    color: "bg-green-500",
                    description: "Currently hiring"
                  },
                  {
                    title: "Total Applications",
                    value: stats.totalApplications,
                    icon: Mail,
                    color: "bg-purple-500",
                    description: "All submitted applications"
                  },
                  {
                    title: "Pending Review",
                    value: stats.pendingApplications,
                    icon: Users,
                    color: "bg-orange-500",
                    description: "Awaiting review"
                  }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <AnimatedSection 
                      key={index}
                      animation="scale" 
                      delay={300 + (index * 100)} 
                      duration={500}
                    >
                      <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                          </div>
                          <div className={`${stat.color} p-3 rounded-lg`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* Tab Navigation */}
          <AnimatedSection animation="fade-up" delay={400} duration={600}>
            <div ref={tabNavRef} className="max-w-8xl mx-auto px-2 sm:px-4 md:px-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {tabs.map((tab, index) => {
                    const IconComponent = tab.icon;
                    return (
                      <AnimatedSection 
                        key={tab.id}
                        animation="fade-right" 
                        delay={500 + (index * 100)} 
                        duration={400}
                      >
                        <button
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex items-center gap-3 px-6 py-4 rounded-lg font-medium border transition-all duration-300 transform hover:scale-105 ${
                            activeTab === tab.id
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-transparent"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-orange-300 hover:shadow-md"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-semibold">{tab.label}</div>
                            <div className={`text-xs ${activeTab === tab.id ? 'text-orange-100' : 'text-gray-500'}`}>
                              {tab.description}
                            </div>
                          </div>
                        </button>
                      </AnimatedSection>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Tab Content */}
          <AnimatedSection animation="fade-up" delay={600} duration={600}>
            <div className="max-w-8xl mx-auto px-2 sm:px-4 md:px-6 pb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] md:min-h-[600px]">
                {activeTab === "vacancy" && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Briefcase className="w-6 h-6 mr-3 text-orange-500" />
                        Job Management
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Create, edit, and manage job postings
                      </p>
                    </div>
                    <div className="space-y-8">
                      <JobManagement />
                    </div>
                  </div>
                )}

                {activeTab === "applications" && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Mail className="w-6 h-6 mr-3 text-orange-500" />
                        Job Applications
                      </h2>
                      <p className="text-gray-600 mt-1">Review and manage job applications</p>
                    </div>
                    <AdminJobApplications />
                  </div>
                )}

                {activeTab === "appointment" && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Settings className="w-6 h-6 mr-3 text-orange-500" />
                        Interview Appointment
                      </h2>
                      <p className="text-gray-600 mt-1">Set and manage interview slots</p>
                    </div>
                    <InterviewAppointment />
                  </div>
                )}

                {activeTab === "send-email" && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Mail className="w-6 h-6 mr-3 text-orange-500" />
                        Send Email to Applications
                      </h2>
                      <p className="text-gray-600 mt-1">Compose and send emails to job applicants</p>
                    </div>
                    <ApplicationEmailManagementModal onClose={() => {}} />
                  </div>
                )}

                {activeTab === "send-remind-email" && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Mail className="w-6 h-6 mr-3 text-orange-500" />
                        Send Remind Email to Shortlisted
                      </h2>
                      <p className="text-gray-600 mt-1">Send a reminder email to all shortlisted applicants</p>
                    </div>
                    <InterviewReminderEmail onClose={() => {}} />
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        </main>
      </div>
    </div>
  );
};

// Modal Wrapper Component
const ModalWrapper = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40 transition-opacity duration-300">
      <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-0 md:p-8 animate-fadeIn max-h-[90vh] overflow-y-auto md:min-h-fit md:rounded-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96);}
          to { opacity: 1; transform: scale(1);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default CareerManagement;
