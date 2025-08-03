"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Mail, Users, Paperclip, Send, Eye } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ApplicationEmailManagementModal = ({ onClose }: { onClose: () => void }) => {
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState("all");
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [jobTitleOptions, setJobTitleOptions] = useState<string[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState("all");
  const [groupEmailPreview, setGroupEmailPreview] = useState<{to: string, subject: string, message: string}[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Fetch distinct statuses from job_applications table
  useEffect(() => {
    const fetchStatuses = async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("status")
        .neq("status", null);
      const allPossibleStatuses = ["pending", "reviewed", "shortlisted", "rejected"];
      let statuses: string[] = [];
      if (!error && data) {
        statuses = Array.from(new Set(data.map((row: { status: string }) => row.status)));
      }
      // Ensure "shortlisted" and "rejected" are always present
      allPossibleStatuses.forEach(s => {
        if (!statuses.includes(s)) statuses.push(s);
      });
      // Keep order: all, pending, reviewed, shortlisted, rejected, manual
      const sortedStatuses = allPossibleStatuses.filter(s => statuses.includes(s));
      setStatusOptions(["all", ...sortedStatuses, "manual"]);
    };
    fetchStatuses();
  }, []);

  // Fetch job titles from job_applications table
  useEffect(() => {
    const fetchJobTitles = async () => {
      let query = supabase.from("job_applications").select("job_title").neq("job_title", null);
      if (recipientType !== "all" && recipientType !== "manual") {
        query = query.eq("status", recipientType);
      }
      const { data, error } = await query;
      if (!error && data) {
        const titles = Array.from(new Set(data.map((row: { job_title: string }) => row.job_title)));
        setJobTitleOptions(["all", ...titles]);
        // Reset selected job title if not in new options
        if (!titles.includes(selectedJobTitle)) setSelectedJobTitle("all");
      }
    };
    fetchJobTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientType]);

  // Fetch recipient emails by status
  useEffect(() => {
    const fetchEmails = async () => {
      if (recipientType === "manual") {
        setRecipientEmails([]);
        return;
      }
      let query = supabase.from("job_applications").select("email");
      if (recipientType !== "all") {
        query = query.eq("status", recipientType);
      }
      if (selectedJobTitle !== "all") {
        query = query.eq("job_title", selectedJobTitle);
      }
      const { data, error } = await query;
      if (error) {
        toast.error("Failed to fetch recipient emails");
        setRecipientEmails([]);
      } else {
        setRecipientEmails(data?.map((row: { email: string }) => row.email) || []);
      }
    };
    fetchEmails();
  }, [recipientType, selectedJobTitle]);

  // Fetch email subject and message template based on recipient status and job title
  useEffect(() => {
    // Only fetch template for non-manual, non-all recipients
    if (recipientType === "manual" || recipientType === "all") {
      setSubject("");
      setMessage("");
      return;
    }
    fetch("/api/send-application-email-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: recipientType,
        jobTitle: selectedJobTitle !== "all" ? selectedJobTitle : undefined,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setSubject(data.subject || "");
        setMessage(data.message || "");
      })
      .catch(() => {
        setSubject("");
        setMessage("");
      });
  }, [recipientType, selectedJobTitle]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // Only for group (not manual)
      if (recipientType !== "manual" && recipientType !== "all") {
        // Fetch personalized emails from backend
        const response = await fetch('/api/send-application-email-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: recipientType,
            jobTitle: selectedJobTitle !== "all" ? selectedJobTitle : undefined,
          }),
        });
        const { emails } = await response.json();

        // Overwrite subject/message with edited values
        const editedEmails = emails.map(email => ({
          ...email,
          subject,   // use the current subject state
          message,   // use the current message state
        }));

        // Send all emails in one request
        const sendResponse = await fetch('/api/send-application-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: editedEmails }), 
        });
        const result = await sendResponse.json();
        if (result.results && result.results.every(r => r.success)) {
          toast.success("All emails sent!");
        } else {
          toast.error("Some emails failed to send.");
        }
      } else {
        // Manual or all: fallback to your existing logic
        const response = await fetch('/api/send-application-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: [
              {
                to: recipientType === "manual" ? manualEmails : recipientEmails.join(","),
                subject,
                message,
              }
            ]
          }),
        });
        const result = await response.json();
        if (result.results && result.results.every(r => r.success)) {
          toast.success("Email sent!");
        } else {
          toast.error("Failed to send email.");
        }
      }
    } catch (error) {
      toast.error("Error sending email.");
    } finally {
      setIsSending(false);
    }
  };

  const handlePreviewOpen = async () => {
    if (recipientType !== "manual" && recipientType !== "all") {
      const response = await fetch('/api/send-application-email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: recipientType,
          jobTitle: selectedJobTitle !== "all" ? selectedJobTitle : undefined,
        }),
      });
      const { emails } = await response.json();
      setGroupEmailPreview(emails || []);
    }
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-8xl mx-auto px-4 py-10">
       
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-8">
            <Mail className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Email to Applications</h1>
              <p className="text-gray-600 text-sm mt-1">Compose and send professional emails to job applicants.</p>
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipients</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setRecipientType(status)}
                  className={`flex items-center px-3 py-2 rounded-lg border transition-all duration-200 ${
                    recipientType === status
                      ? "bg-orange-500 text-white border-orange-500 font-semibold"
                      : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-orange-50"
                  }`}
                >
                  {status === "manual" ? <Mail className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                  {status === "all"
                    ? "All Applicants"
                    : status === "manual"
                    ? "Manual Entry"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            {recipientType === "manual" && (
              <input
                type="text"
                placeholder="Enter email addresses separated by commas"
                value={manualEmails}
                onChange={(e) => setManualEmails(e.target.value)}
                className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
              />
            )}
          </div>

          {/* Job Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
            <select
              value={selectedJobTitle}
              onChange={e => setSelectedJobTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
            >
              {jobTitleOptions.map(title => (
                <option key={title} value={title}>
                  {title === "all" ? "All Job Titles" : title}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              rows={7}
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base text-gray-900"
            />
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment (optional)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={handleAttachmentChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700"
              />
              {attachment && (
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <Paperclip className="w-4 h-4" />
                  {attachment.name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handlePreviewOpen}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition ${
                isSending
                  ? "bg-orange-300 text-white cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              disabled={isSending}
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-orange-500 mr-2" />
              <span className="text-lg font-bold text-gray-900">Email Preview</span>
            </div>
            {recipientType !== "manual" && recipientType !== "all" && groupEmailPreview.length > 0 ? (
              <div>
                <h2 className="font-semibold mb-2 text-gray-900">Group Email Preview</h2>
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">To: </span>
                  {recipientEmails.length > 0
                    ? <span className="text-gray-800">{recipientEmails.join(", ")}</span>
                    : <span className="text-gray-400">No recipients found</span>
                  }
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">Subject: </span>
                  {subject ? <span className="text-gray-800">{subject}</span> : <span className="text-gray-400">No subject</span>}
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">Message:</span>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 text-gray-900 whitespace-pre-line">{message || <span className="text-gray-400">No message</span>}</div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">To: </span>
                  {recipientType === "manual"
                    ? (manualEmails ? <span className="text-gray-800">{manualEmails}</span> : <span className="text-gray-400">No emails entered</span>)
                    : recipientEmails.length > 0
                      ? <span className="text-gray-800">{recipientEmails.join(", ")}</span>
                      : <span className="text-gray-400">No recipients found</span>
                  }
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">Subject: </span>
                  {subject ? <span className="text-gray-800">{subject}</span> : <span className="text-gray-400">No subject</span>}
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">Message:</span>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 text-gray-900 whitespace-pre-line">{message || <span className="text-gray-400">No message</span>}</div>
                </div>
              </>
            )}
            {attachment && (
              <div className="mb-3">
                <span className="font-semibold text-gray-900">Attachment: </span>
                <span className="flex items-center gap-1 text-sm text-gray-800">
                  <Paperclip className="w-4 h-4" />
                  {attachment.name}
                </span>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationEmailManagementModal;