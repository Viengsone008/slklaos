"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Mail, Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getReminderEmailTemplate } from "@/pages/api/reminder-email-template";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Recipient = {
  candidate_email: string;
  candidate_name: string;
  status: "confirmed" | "pending" | null;
  date?: string | null;
  time?: string | null;
};

const InterviewReminderEmail = ({ onClose }: { onClose: () => void }) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch shortlisted candidates and their appointment status
  useEffect(() => {
    const fetchRecipients = async () => {
      // Get all shortlisted candidates from job_applications
      const { data: applications, error: appError } = await supabase
        .from("job_applications")
        .select("email, name")
        .eq("status", "shortlisted");

      if (appError || !applications) {
        setRecipients([]);
        return;
      }

      // For each candidate, check appointment status
      const recipientList: Recipient[] = [];
      for (const app of applications) {
        const { data: appointment } = await supabase
          .from("appointments")
          .select("status, date, time")
          .eq("candidate_email", app.email) // <-- use app.email
          .maybeSingle();

        recipientList.push({
          candidate_email: app.email,      // <-- use app.email
          candidate_name: app.name,        // <-- use app.name
          status: appointment?.status ?? null,
          date: appointment?.date ?? null,
          time: appointment?.time ?? null,
        });
      }
      setRecipients(recipientList);
    };
    fetchRecipients();
  }, []);

  // Preview for the first recipient
  const handlePreviewOpen = async () => {
    if (recipients.length === 0) {
      setPreviewSubject("");
      setPreviewMessage("");
      setPreviewOpen(true);
      return;
    }
    const r = recipients[0];
    const slotSelected = r.status === "confirmed" || r.status === "pending";
    const { subject, message } = getReminderEmailTemplate({
      candidateName: r.candidate_name,
      interviewDate: r.date ?? undefined,
      interviewTime: r.time ?? undefined,
      slotSelected,
    });
    setPreviewSubject(subject);
    setPreviewMessage(message);
    setPreviewOpen(true);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      for (const r of recipients) {
        const slotSelected = r.status === "confirmed" || r.status === "pending";
        await fetch("/api/send-reminder-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: [
              { candidateName: r.candidate_name, candidateEmail: r.candidate_email },
            ],
          }),
        });
      }
      toast.success("Reminder emails sent!");
    } catch (error) {
      toast.error("Error sending reminder emails.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-8xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-8">
            <Mail className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Interview Reminders</h1>
              <p className="text-gray-600 text-sm mt-1">
                This will send reminder emails to all shortlisted candidates. The email content will depend on their appointment status.
              </p>
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipients</label>
            <div className="bg-gray-50 rounded-lg p-3 text-gray-900 max-h-32 overflow-y-auto">
              {recipients.length > 0
                ? recipients.map((r) => (
                    <div key={r.candidate_email} className="flex justify-between items-center text-sm">
                      <span>{r.candidate_name} ({r.candidate_email})</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        r.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {r.status === "confirmed"
                          ? "Confirmed"
                          : r.status === "pending"
                          ? "Pending"
                          : "No Appointment Yet"}
                      </span>
                    </div>
                  ))
                : <span className="text-gray-400">No shortlisted candidates found</span>
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handlePreviewOpen}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
            >
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
              disabled={isSending || recipients.length === 0}
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Reminder Emails"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
            >
              Close
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
            <div className="mb-3">
              <span className="font-semibold text-gray-900">To: </span>
              {recipients.length > 0
                ? <span className="text-gray-800">{`${recipients[0].candidate_name} (${recipients[0].candidate_email})`}</span>
                : <span className="text-gray-400">No recipients found</span>
              }
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-900">Subject: </span>
              {previewSubject ? <span className="text-gray-800">{previewSubject}</span> : <span className="text-gray-400">No subject</span>}
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-900">Message:</span>
              <div className="bg-gray-50 rounded-lg p-3 mt-1 text-gray-900 whitespace-pre-line">{previewMessage || <span className="text-gray-400">No message</span>}</div>
            </div>
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

export default InterviewReminderEmail;