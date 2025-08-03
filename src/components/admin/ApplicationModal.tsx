"use client";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { UploadCloud, CheckCircle, X, FileText, Upload, AlertCircle } from "lucide-react";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

interface FormData {
  name: string;
  email: string; 
  phone: string;
  cover_letter: string;
}

interface JobData {
  hero_image_url?: string;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle 
}) => {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isClient, setIsClient] = useState(false);
  
  const coverRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (coverRef.current) {
      coverRef.current.style.height = "auto";
      coverRef.current.style.height = `${coverRef.current.scrollHeight}px`;
    }
  }, [form.cover_letter]);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !isClient) return;

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("hero_image_url")
          .eq("id", jobId)
          .single();

        if (error) {
          console.error("Error fetching job hero image:", error);
          setJobData(null);
        } else {
          setJobData(data);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setJobData(null);
      }
    };

    if (isOpen && isClient) {
      fetchJob();
    }
  }, [isOpen, jobId, isClient]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // Enhanced form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s\-()]+$/;

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Cover letter validation
    if (!form.cover_letter.trim()) {
      newErrors.cover_letter = "Cover letter is required";
    } else if (form.cover_letter.trim().length < 50) {
      newErrors.cover_letter = "Cover letter must be at least 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection with validation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      showNotification('error', 'Please upload a PDF file only');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      showNotification('error', 'File size must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFile(selectedFile);
    showNotification('success', `CV uploaded: ${selectedFile.name}`);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Enhanced submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('error', 'Please fix the errors above');
      return;
    }

    if (!file) {
      showNotification('error', 'Please upload your CV (PDF format)');
      return;
    }

    if (!jobId) {
      showNotification('error', 'Job ID is missing');
      return;
    }

    setSubmitting(true);

    try {
      // Generate safe file path
      const fileExt = file.name.split(".").pop();
      const safeJobTitle = jobTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const timestamp = Date.now();
      const safeName = form.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const fileName = `${timestamp}_${safeName}_cv.${fileExt}`;
      const filePath = `cv-applications/${safeJobTitle}/${fileName}`;

      // Upload CV to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("cv-applications")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`CV upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("cv-applications")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to generate CV URL");
      }

      // Save application to database
      const applicationData = {
        job_title: jobTitle,
        job_id: jobId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        cover_letter: form.cover_letter.trim(),
        cv_url: publicUrlData.publicUrl,
        applied_at: new Date().toISOString(),
        status: 'pending'
      };

      const { error: insertError } = await supabase
        .from("job_applications")
        .insert(applicationData);

      if (insertError) {
        // If database insert fails, clean up uploaded file
        await supabase.storage
          .from("cv-applications")
          .remove([filePath]);
        throw new Error(`Application submission failed: ${insertError.message}`);
      }

      // Reset form
      setForm({ name: "", email: "", phone: "", cover_letter: "" });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setErrors({});
      
      // Show success message
      setShowThankYou(true);
      showNotification('success', 'Application submitted successfully!');

      // Auto-close after 15 seconds
      setTimeout(() => {
        setShowThankYou(false);
        onClose();
      }, 15000);

    } catch (err: any) {
      console.error('Application submission error:', err);
      showNotification('error', err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (submitting) return; // Prevent closing during submission
    
    setForm({ name: "", email: "", phone: "", cover_letter: "" });
    setFile(null);
    setErrors({});
    setShowThankYou(false);
    setNotification(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Don't render on server-side
  if (!isClient || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-60 flex justify-center items-center p-4 backdrop-blur-sm">
      {/* Custom Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : notification.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showThankYou ? (
        /* Thank You Screen */
        <div className="bg-white p-8 rounded-xl text-center shadow-xl max-w-md w-full animate-fadeIn">
          <div className="mb-6">
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Thank you for applying for <strong className="text-[#3d9392]">{jobTitle}</strong>. 
              We have received your application and CV.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-700">
              <strong>What's next?</strong><br />
              Our HR team will review your application. Only shortlisted candidates will be contacted within 7-14 business days.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-[#3d9392] text-white rounded-lg hover:bg-[#6dbeb0] transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        /* Application Form */
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header Image */}
          {jobData?.hero_image_url ? (
            <div className="relative h-40 overflow-hidden">
              <img
                src={jobData.hero_image_url}
                alt={`Apply for ${jobTitle}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={handleClose}
                disabled={submitting}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="relative w-full h-40 bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] flex items-center justify-center">
              <div className="text-center text-white">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-80" />
                <p className="text-lg font-semibold">Job Application</p>
              </div>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Apply for {jobTitle}
              </h2>
              <p className="text-gray-600">
                Please fill out all required fields to submit your application.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full text-gray-900 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3d9392] focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className={`w-full text-gray-900 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3d9392] focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={submitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+856 20 1234 5678"
                  className={`w-full text-gray-900 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3d9392] focus:border-transparent transition-colors ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={submitting}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={coverRef}
                  placeholder="Tell us why you're interested in this position and what makes you a great candidate..."
                  className={`w-full text-gray-900 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3d9392] focus:border-transparent transition-colors resize-none overflow-hidden min-h-[120px] ${
                    errors.cover_letter ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={form.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  disabled={submitting}
                />
                {errors.cover_letter && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.cover_letter}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {form.cover_letter.length}/500 characters minimum: 50
                </p>
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload CV (PDF Only) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className={`flex  items-center gap-3 border border-dashed rounded-lg px-4 py-8 bg-gray-50 hover:bg-gray-100 transition-colors ${
                    submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}>
                    <div className="flex-1 text-center">
                      {file ? (
                        <div className="flex items-center justify-center">
                          <FileText className="w-8 h-8 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium">Click to upload your CV</p>
                          <p className="text-sm text-gray-500">PDF format only, max 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!file && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    CV upload is required
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-[#3d9392] text-white rounded-lg hover:bg-[#6dbeb0] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Privacy Notice:</strong> Your personal information and CV will be used solely for recruitment purposes and will be handled in accordance with our privacy policy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationModal;
