"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import JobApplications from "@/components/admin/JobApplications"; // <-- Import JobApplications

const AdminJobApplications = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [cvLinks, setCvLinks] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: appsData } = await supabase.from("job_applications").select("*");

    setJobs(jobsData || []);
    setApplications(appsData || []);
  };

  const handleCheckboxChange = (jobId: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(jobs.map((job) => job.id));
    }
    setSelectAll(!selectAll);
  };

  const exportCSV = () => {
    let csvRows: string[] = [];
    csvRows.push("Job Title,Department,Location,Applicant Name,Email,Phone,Cover Letter,CV Link");

    jobs.forEach((job) => {
      if (!selectedJobIds.includes(job.id)) return;

      const jobApps = applications.filter((app) => app.job_id === job.id);
      jobApps.forEach((app) => {
        const row = [
          `"${job.title}"`,
          `"${job.department}"`,
          `"${job.location}"`,
          `"${app.name}"`,
          `"${app.email}"`,
          `"${app.phone}"`,
          `"${app.cover_letter?.replace(/"/g, '""')}"`,
          `"${app.cv_url}"`,
        ];
        csvRows.push(row.join(","));
      });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "selected_job_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (applicationId: string) => {
    confirmAlert({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this application?",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            const { error } = await supabase
              .from("job_applications")
              .delete()
              .eq("id", applicationId);

            if (error) {
              toast.error("Failed to delete application.");
            } else {
              toast.success("Application deleted.");
              setApplications((prev) => prev.filter((app) => app.id !== applicationId));
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    if (!applicationId || !newStatus) {
      console.error("Missing applicationId or newStatus", { applicationId, newStatus });
      return;
    }
    const { error, data, status, statusText } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", applicationId)
      .select();

    if (error || !data || data.length === 0) {
      console.error("Error updating status:", error, { applicationId, newStatus, status, statusText, data });
      toast.error("Failed to update status. Please check if the application exists and the status column is correct.");
    } else {
      toast.success("Status updated!");
      // Optionally update local state here
    }
  };

  const getCVLink = async (cvPath: string, appId: string) => {
    if (!cvPath) return "#";
    // Only generate if not already in state
    if (cvLinks[appId]) return cvLinks[appId];
    const { data, error } = await supabase.storage
      .from("cv-applications")
      .createSignedUrl(cvPath, 60); // 60 seconds
    if (error) {
      console.error(error);
      return "#";
    }
    setCvLinks((prev) => ({ ...prev, [appId]: data.signedUrl }));
    return data.signedUrl;
  };

  return (
    <div className="p-4">
      {/* Render JobApplications at the beginning */}
      <JobApplications />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Job Applications by Posting</h2>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-90"
          disabled={selectedJobIds.length === 0}
        >
          <Download className="w-4 h-4 text-white" />
          Export Selected
        </button>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="accent-blue-600"
          />
          Select All
        </label>
      </div>

      {jobs.map((job) => {
        const isChecked = selectedJobIds.includes(job.id);
        return (
          <div key={job.id} className="mb-8 p-4 border rounded bg-gray-50 shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold text-blue-700">{job.title}</h3>
                <p className="text-sm text-gray-500">
                  {job.department} | {job.location} | {job.application_start} - {job.application_end}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCheckboxChange(job.id)}
                className="accent-blue-600 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.filter((app) => app.job_id === job.id).length > 0 ? (
                applications
                  .filter((app) => app.job_id === job.id)
                  .map((app) => (
                    <div key={app.id} className="p-3 bg-white border rounded relative">
                      <p className="font-medium text-gray-700">
                        {app.name} ({app.email})
                      </p>
                      <p className="text-sm text-gray-600">📞 {app.phone}</p>
                      <p className="text-sm italic mt-1 text-gray-700">"{app.cover_letter}"</p>
                      {app.cv_url ? (
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <FileText className="w-4 h-4" /> View CV
                        </a>
                      ) : (
                        <span className="text-sm text-red-500">No CV uploaded</span>
                      )}

                      <button
                        onClick={() => handleDelete(app.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-400 col-span-full">No applications for this job.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminJobApplications;
