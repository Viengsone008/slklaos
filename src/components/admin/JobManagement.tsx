"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  MapPin,
  Calendar,
  Building,
  Tag,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileDown,
  Eye,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-datepicker/dist/react-datepicker.css';

// Dynamic import for DatePicker to avoid SSR issues
const DatePicker = dynamic(() => import("react-datepicker"), {
  ssr: false,
  loading: () => <div className="w-full border rounded px-3 py-2 bg-gray-100 animate-pulse">Loading date picker...</div>
});

interface JobFormData {
  title: string;
  department: string;
  location: string;
  category: string;
  description: string;
  tasks: string;
  requirements: string;
  benefits: string;
  application_start: Date | null;
  application_end: Date | null;
  status: string;
  pdf_url: string;
  hero_image_url: string;
  job_type: string;
}

interface Job extends JobFormData {
  id: string;
  created_at: string;
  tasks: string[];
  requirements: string[];
  benefits: string[];
}

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [form, setForm] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    category: "",
    description: "",
    tasks: "",
    requirements: "",
    benefits: "",
    application_start: null,
    application_end: null,
    status: "Open",
    pdf_url: "",
    hero_image_url: "",
    job_type: "",
  });

  const departments = [
    "Engineering Department",
    "Planning Department",
    "Construction Department",
    "Project Management Department",
    "Procurement Department",
    "Quality Control Department",
    "Safety Department",
    "Human Resources Department",
    "Finance Department", 
    "Administration Department",
    "Site Operations Department",
    "Surveying Department"
  ];

  const categories = [
    "Engineering",
    "Planning",
    "Construction Management",
    "Sale & Marketing",
    "Administrative",
    "Architecture",
    "Infrastructure",
    "Building Works",
    "Internship"
  ];

  const laoCities = [
    "Vientiane Capital, Laos",
    "Luang Prabang, Laos",
    "Savannakhet, Laos",
    "Pakse, Laos",
    "Thakhek, Laos",
    "Xieng Khouang, Laos",
    "Attapeu, Laos",
    "Sekong, Laos",
    "Phongsaly, Laos",
    "Luang Namtha, Laos",
    "Bokeo, Laos",
    "Oudomxay, Laos", 
    "Huaphan, Laos",
    "Bolikhamxay, Laos",
    "Khammouane, Laos",
    "Salavan, Laos",
    "Champasak, Laos",
    "Xayabouly, Laos"
  ];

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Temporary",
  ];

  const statusOptions = [
    { value: "Open", label: "Open", icon: CheckCircle, color: "text-green-600" },
    { value: "Closed", label: "Closed", icon: XCircle, color: "text-red-600" },
    { value: "Draft", label: "Draft", icon: Clock, color: "text-yellow-600" }
  ];

  useEffect(() => {
    if (isClient) {
      fetchJobs();
    }
  }, [isClient]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } else {
        setJobs(data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      department: "",
      location: "",
      category: "",
      description: "",
      tasks: "",
      requirements: "",
      benefits: "",
      application_start: null,
      application_end: null,
      status: "Open",
      pdf_url: "",
      hero_image_url: "",
      job_type: "",
    });
    setPdfFile(null);
    setHeroImageFile(null);
    setEditingJob(null);
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      toast.error("Job title is required");
      return false;
    }
    if (!form.department) {
      toast.error("Department is required");
      return false;
    }
    if (!form.location) {
      toast.error("Location is required");
      return false;
    }
    if (!form.category) {
      toast.error("Category is required");
      return false;
    }
    if (!form.job_type) {
      toast.error("Job type is required");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Job description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    toast.dismiss();
    setIsSubmitting(true);
    
    let uploadedPdfUrl = form.pdf_url;
    let uploadedHeroUrl = form.hero_image_url;

    try {
      // Upload PDF file if provided
      if (pdfFile) {
        const ext = pdfFile.name.split(".").pop();
        const filename = `${Date.now()}_${form.title.replace(/\s+/g, "_")}.${ext}`;
        const filePath = `pdfs/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("career-announcement")
          .upload(filePath, pdfFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: "application/pdf",
          });

        if (uploadError) {
          console.error("PDF upload error:", uploadError);
          toast.error("PDF upload failed");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("career-announcement")
          .getPublicUrl(filePath);

        uploadedPdfUrl = publicUrlData.publicUrl;
      }

      // Upload hero image if provided
      if (heroImageFile) {
        const ext = heroImageFile.name.split(".").pop();
        const filename = `${Date.now()}_hero_${form.title.replace(/\s+/g, "_")}.${ext}`;
        const filePath = `images/${filename}`;

        const { error: imageUploadError } = await supabase.storage
          .from("career-images")
          .upload(filePath, heroImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (imageUploadError) {
          console.error("Hero image upload error:", imageUploadError);
          toast.error("Hero image upload failed");
          return;
        }

        const { data: heroUrlData } = supabase.storage
          .from("career-images")
          .getPublicUrl(filePath);

        uploadedHeroUrl = heroUrlData.publicUrl;
      }

      const payload = {
        ...form,
        application_start: form.application_start?.toISOString().split("T")[0] || null,
        application_end: form.application_end?.toISOString().split("T")[0] || null,
        pdf_url: uploadedPdfUrl,
        hero_image_url: uploadedHeroUrl,
        tasks: form.tasks.split("\n").filter(Boolean),
        requirements: form.requirements.split("\n").filter(Boolean),
        benefits: form.benefits.split("\n").filter(Boolean),
      };

      if (editingJob?.id) {
        const { error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", editingJob.id);
        
        if (error) throw error;
        toast.success("Job updated successfully");
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(payload);
        
        if (error) throw error;
        toast.success("Job created successfully");
      }

      resetForm();
      fetchJobs();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Save failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    confirmAlert({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this job post? This action cannot be undone.",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              const { error } = await supabase
                .from("jobs")
                .delete()
                .eq("id", id);
              
              if (error) {
                console.error("Delete error:", error);
                toast.error("Delete failed");
              } else {
                toast.success("Job deleted successfully");
                fetchJobs();
              }
            } catch (error) {
              console.error("Delete error:", error);
              toast.error("Delete failed");
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

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      category: job.category || "",
      description: job.description || "",
      tasks: Array.isArray(job.tasks) ? job.tasks.join("\n") : job.tasks || "",
      requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : job.requirements || "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : job.benefits || "",
      application_start: job.application_start ? new Date(job.application_start) : null,
      application_end: job.application_end ? new Date(job.application_end) : null,
      status: job.status || "Open",
      pdf_url: job.pdf_url || "",
      hero_image_url: job.hero_image_url || "",
      job_type: job.job_type || "",
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return null;
    const IconComponent = statusConfig.icon;
    return <IconComponent className={`w-4 h-4 ${statusConfig.color}`} />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || !isClient) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-700 bg-white";
  const selectClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-700";

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="p-6 space-y-6">
        <div className="border rounded-lg shadow bg-white p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Job Creation / Edit Form */}
      <section className="border rounded-lg shadow-sm bg-white p-6">
        <div className="flex items-center mb-6">
          <Building className="w-6 h-6 text-orange-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            {editingJob ? "Edit Job Post" : "Create New Job Vacancy"}
          </h2>
        </div>

         <div className="grid lg:grid-cols-4 gap-8">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="e.g. Senior Construction Engineer"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.job_type}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              className={selectClass}
            >
              <option value="">Select job type</option>
              {jobTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className={selectClass}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workplace Location <span className="text-red-500">*</span>
            </label>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={selectClass}
            >
              <option value="">Select City</option>
              {laoCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={selectClass}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={selectClass}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Application Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Start Date
            </label>
            <DatePicker
              selected={form.application_start}
              onChange={(date) => setForm({ ...form, application_start: date })}
              placeholderText="Select start date"
              dateFormat="yyyy-MM-dd"
              className={inputClass}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
            />
          </div>

          {/* Application End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application End Date
            </label>
            <DatePicker
              selected={form.application_end}
              onChange={(date) => setForm({ ...form, application_end: date })}
              placeholderText="Select end date"
              dateFormat="yyyy-MM-dd"
              className={inputClass}
              minDate={form.application_start || undefined}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
            />
          </div>
        </div>

        {/* Long Text Fields */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          {/* Job Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              rows={4}
              placeholder="Describe the position, responsibilities, and overview..."
            />
          </div>

          {/* Key Responsibilities */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Responsibilities (one per line)
            </label>
            <textarea
              value={form.tasks}
              onChange={(e) => setForm({ ...form, tasks: e.target.value })}
              rows={4}
              className={inputClass}
              placeholder={`Supervise construction site operations\nCoordinate with suppliers and contractors\nEnsure project timeline compliance`}
            />
          </div>

          {/* Required Qualifications */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Qualifications (one per line)
            </label>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={4}
              className={inputClass}
              placeholder={`Bachelor's degree in Civil Engineering\n3+ years of construction experience\nProficiency in AutoCAD and project management tools`}
            />
          </div>

          {/* Benefits */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits & Compensation (one per line)
            </label>
            <textarea
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              rows={3}
              className={inputClass}
              placeholder={`Competitive salary package\nAnnual performance bonus\nHealth insurance coverage`}
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Job Description PDF
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <FileText className="w-4 h-4" />
              Choose PDF
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type !== "application/pdf") {
                    toast.error("Only PDF files are allowed");
                    return;
                  }
                  setPdfFile(file || null);
                }}
                className="hidden"
              />
            </label>
            {pdfFile && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-1" />
                {pdfFile.name}
              </div>
            )}
          </div>

          {/* Hero Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Hero Image
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <ImageIcon className="w-4 h-4" />
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            {heroImageFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(heroImageFile)}
                  alt="Preview"
                  className="h-32 w-full object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting
              ? "Saving..."
              : editingJob
              ? "Update Job Post"
              : "Create Job Post"}
          </button>

          {editingJob && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Jobs List Section */}
      <section className="border rounded-lg shadow-sm bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Job Posts</h2>
          </div>
          <div className="text-sm text-gray-500">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No job posts found</p>
            <p className="text-gray-400">Create your first job posting to get started.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border rounded-lg shadow-sm p-6 bg-gray-50 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {job.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {job.job_type}
                    </div>
                  </div>
                </div>

                {/* Status and Dates */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(job.status)}
                      <span className="ml-1 text-sm font-medium">
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(job.application_start)} - {formatDate(job.application_end)}
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                {job.hero_image_url && (
                  <div className="mb-4">
                    <img
                      src={job.hero_image_url}
                      alt="Job hero"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* PDF Link */}
                {job.pdf_url && (
                  <div className="mb-4">
                    <a
                      href={job.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      <FileDown className="w-4 h-4 mr-1" />
                      View PDF
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(job)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default JobManagement;
