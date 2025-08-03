"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Building2,
  Phone,
  Mail,
  User,
  Briefcase,
  CheckCircle,
  Sparkles,
  Calendar,
  Clock,
  Award
} from "lucide-react";

import { supabase } from "../lib/supabase";

/**
 * Props
 */
interface QuoteModalProps {
  isOpen: boolean;
  mode?: 'create' | 'edit';
  source?: 'website' | 'admin' | 'hero_get_free_quote' | 'products_get_product_quote' | 'footer_contact_now';
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  location: string;
  description: string;
  preferred_contact: 'email' | 'phone' | 'both';
  _gotcha: string;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  QuoteModal - Next.js optimized version
 * ────────────────────────────────────────────────────────────────────────────────
 */
const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  source = "footer_contact_now"
}) => {
  /* -------------------------------------------------------------------------- */
  /*                               Local state                                  */
  /* -------------------------------------------------------------------------- */
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    project_type: "",
    budget_range: "",
    timeline: "",
    location: "",
    description: "",
    preferred_contact: "email",
    _gotcha: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(15);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                            Success countdown                               */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!success) return;
    if (countdown === 0) {
      handleCloseSuccess();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown]);

  // Handle ESC key press
  useEffect(() => {
    if (!mounted) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !success) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, success, onClose, mounted]);

  /* -------------------------------------------------------------------------- */
  /*                              Submit handler                                */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Bot check - honeypot must stay empty
    if (formData._gotcha) return;

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const quoteData = buildQuoteData(formData, source);

      console.log("📝 Inserting quote", quoteData);

      const { error: insertError } = await supabase
        .from("quotes")
        .insert(quoteData);

      if (insertError) throw insertError;

      // Optional side-effects
      await Promise.all([
        sendConfirmationEmail(formData.email, formData.name),
        notifyCRM(quoteData)
      ]);

      // New email sending logic
      await fetch('/api/send-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source, // optional: include the source of the quote
        }),
      });

      setSuccess(true);
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error("❌ Submit error", err);
      setError("Failed to submit quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                           Helper – build record                            */
  /* -------------------------------------------------------------------------- */
  const buildQuoteData = (data: FormData, src: string) => {
    return {
      // Direct mappings
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      company: data.company.trim() || "Individual Customer",
      project_type: data.project_type || null,
      budget_range: data.budget_range || null,
      timeline: data.timeline || null,
      location: data.location.trim() || null,
      description: data.description.trim() || null,
      preferred_contact: data.preferred_contact,

      // Auto-generated metadata
      status: "new",
      priority: getBudgetPriority(data.budget_range),
      source: src,
      estimated_value: getEstimatedValue(data.budget_range),
      follow_up_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lead_score: calculateLeadScore(data),
      win_probability: calculateWinProbability(data),

      // Nested JSONB columns
      customer_profile: {
        fullName: data.name.trim(),
        firstName: data.name.trim().split(" ")[0],
        lastName: data.name.trim().split(" ").slice(1).join(" ") || "",
        companyName: data.company.trim() || "Individual Customer",
        customerType: data.company.trim() ? "Business" : "individual",
        leadScore: calculateLeadScore(data),
        qualification: getQualification(data.budget_range, data.project_type)
      },
      project_details: {
        type: data.project_type,
        budgetRange: data.budget_range,
        estimatedBudget: getEstimatedValue(data.budget_range),
        timelineCategory: data.timeline,
        location: data.location.trim(),
        description: data.description.trim()
      },
      sales_tracking: {
        salesStage: "initial_inquiry",
        nextAction: getNextAction(data.project_type, data.budget_range),
        winProbability: calculateWinProbability(data),
        sourceDetails: getSourceDetails(src),
        submittedAt: new Date().toISOString(),
        recommendedSalesperson: getAssignedSalesperson(data.project_type, data.budget_range)
      }
    };
  };

  /* -------------------------------------------------------------------------- */
  /*                       Side-effect helper stubs                             */
  /* -------------------------------------------------------------------------- */
  const sendConfirmationEmail = async (email: string, name: string) => {
    // In production, trigger a Supabase function / 3rd-party email service
    console.log(`✉️ Sending confirmation email to ${email} for ${name}`);
  };

  const notifyCRM = async (quote: any) => {
    // Example: POST to HubSpot / Slack / etc.
    console.log("🤖 Pushing quote to CRM", quote);
  };

  /* -------------------------------------------------------------------------- */
  /*                            Generic handlers                                */
  /* -------------------------------------------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    setCountdown(15);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      project_type: "",
      budget_range: "",
      timeline: "",
      location: "",
      description: "",
      preferred_contact: "email",
      _gotcha: ""
    });
    onClose();
  };

  // Don't render until mounted (prevents hydration issues)
  if (!mounted || !isOpen) return null;

  /* -------------------------------------------------------------------------- */
  /*                                UI helpers                                  */
  /* -------------------------------------------------------------------------- */
  const getModalTitle = () => {
    if (source === "hero_get_free_quote") return "Get Your Free Quote";
    if (source === "products_get_product_quote") return "Get Product Quote";
    return "Get Quick Quote";
  };

  const getModalSubtitle = () => {
    if (source === "hero_get_free_quote") return "Start your construction project with us";
    if (source === "products_get_product_quote") return "Get pricing for our premium materials";
    return "Tell us about your project";
  };

  /* -------------------------------------------------------------------------- */
  /*                        Render – modal shell                                */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={success ? undefined : onClose}
      />

      {success ? (
        /* ------------------------- Success screen ------------------------- */
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full animate-scale-in">
            <SuccessHeader countdown={countdown} />
            <SuccessBody
              formData={formData}
              calculateLeadScore={calculateLeadScore}
              getAssignedSalesperson={getAssignedSalesperson}
            />
            <SuccessFooter onClose={handleCloseSuccess} />
            <button
              onClick={handleCloseSuccess}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        /* -------------------------- Form modal --------------------------- */
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full lg:w-auto max-w-full lg:max-w-8xl max-h-[90vh] lg:max-h-[75vh] overflow-y-auto mx-auto">
            <ModalHeader title={getModalTitle()} subtitle={getModalSubtitle()} onClose={onClose} />

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 mx-6 mt-6 rounded-lg">
                {error}
              </div>
            )}

            {/* The form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <Section title="Personal Information" icon={<User className="w-4 h-4 mr-2" />}>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                  <Input 
                    name="name" 
                    label="Full Name *" 
                    required 
                    value={formData.name} 
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="e.g. John Smith"
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email Address *"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="e.g. john@email.com"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    label="Phone Number *"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="e.g. +856 20 5551 5551"
                  />
                  <Input
                    name="company"
                    label="Company Name (optional)"
                    value={formData.company}
                    onChange={handleChange}
                    autoComplete="organization"
                    placeholder="e.g. SLK Trading Co., Ltd."
                  />
                </div>
                {/* Honeypot */}
                <input
                  type="text"
                  name="_gotcha"
                  value={formData._gotcha}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </Section>

              <Section title="Project Information" icon={<Briefcase className="w-4 h-4 mr-2" />}>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                  <Select
                    name="project_type"
                    label="Project Type"
                    value={formData.project_type}
                    onChange={handleChange}
                    options={[
                      "residential",
                      "commercial",
                      "industrial",
                      "renovation",
                      "waterproofing",
                      "flooring",
                      "materials",
                      "consultation"
                    ]}
                  />
                  <Select
                    name="budget_range"
                    label="Estimated Budget (USD)"
                    value={formData.budget_range}
                    onChange={handleChange}
                    options={[
                      "under-10000",
                      "10000-25000",
                      "25000-50000",
                      "50000-100000",
                      "100000-250000",
                      "250000-500000",
                      "over-500000"
                    ]}
                  />
                  <Select
                    name="timeline"
                    label="Project Timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    options={[
                      "asap",
                      "1-3months",
                      "3-6months",
                      "6-12months",
                      "over-1year",
                      "flexible"
                    ]}
                  />
                  <Input
                    name="location"
                    label="Project Location"
                    placeholder="e.g. Vientiane Capital, Laos"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                
                <Textarea
                  name="description"
                  label="Project Description"
                  placeholder="e.g. I need a 2-storey modern house in Vientiane, 3 bedrooms, 2 bathrooms, budget $100,000. Please include landscaping and a garage."
                  value={formData.description}
                  onChange={handleChange}
                />
              </Section>

              {/* Preferred contact */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Preferred Contact Method</label>
                <div className="flex flex-wrap gap-4">
                  {([
                    { v: "email" as const, label: "Email", icon: <Mail className="w-4 h-4 ml-2 mr-1" /> },
                    { v: "phone" as const, label: "Phone Call", icon: <Phone className="w-4 h-4 ml-2 mr-1" /> },
                    { v: "both" as const, label: "Both Email & Phone", icon: null }
                  ]).map((opt) => (
                    <label key={opt.v} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="preferred_contact"
                        value={opt.v}
                        checked={formData.preferred_contact === opt.v}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#6dbeb0] border-gray-300 focus:ring-[#6dbeb0]"
                      />
                      {opt.icon}
                      <span className="text-sm text-gray-700 ml-1">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit row */}
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-sm text-gray-600">* Required fields. We'll respond within 24 hours.</p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#6dbeb0] hover:bg-[#3d9392] text-white px-8 py-3 rounded-lg font-semibold flex items-center transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Get Quote
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                       Reusable UI primitives                               */
/* -------------------------------------------------------------------------- */
interface InputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({ label, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      {...rest}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6dbeb0] focus:border-transparent transition-colors"
    />
  </div>
);

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea
      {...rest}
      rows={4}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6dbeb0] focus:border-transparent resize-none transition-colors text-base text-gray-900 placeholder-gray-500"
      style={{ minHeight: '120px', fontSize: '1.1rem', color: '#1a2936', background: '#fff' }}
    />
  </div>
);

interface SelectProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<SelectProps> = ({ label, options, value, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      {...rest}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6dbeb0] focus:border-transparent transition-colors"
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option: string) => (
        <option key={option} value={option}>
          {option.replace(/-/g, " - ").replace(/\b\w/g, l => l.toUpperCase())}
        </option>
      ))}
    </select>
  </div>
);

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

interface ModalHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, onClose }) => (
  <div className="sticky top-0 bg-gradient-to-r from-[#6dbeb0] to-[#3d9392] text-white p-6 rounded-t-2xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-white/20 p-2 rounded-lg mr-3">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-[#e5f1f1]">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
);

/* -------- Success components ------- */
const SuccessHeader: React.FC<{ countdown: number }> = ({ countdown }) => (
  <div className="bg-gradient-to-r from-[#6dbeb0] to-[#3d9392] text-white p-8 rounded-t-3xl relative overflow-hidden">
    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 flex items-center space-x-2">
      <Clock className="w-5 h-5" />
      <span className="font-bold text-lg">{countdown}</span>
    </div>
    <div className="relative z-10 text-center">
      <div className="bg-white/20 p-4 rounded-full inline-flex mb-4">
        <CheckCircle className="w-16 h-16 text-white" />
      </div>
      <h2 className="text-4xl font-bold mb-2">Quote Request Submitted!</h2>
      <div className="flex items-center justify-center space-x-2">
        <Sparkles className="w-6 h-6" />
        <p className="text-[#e5f1f1] text-xl">Your project inquiry has been received</p>
        <Sparkles className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const SuccessBody: React.FC<{
  formData: FormData;
  calculateLeadScore: (data: FormData) => number;
  getAssignedSalesperson: (projectType: string, budget: string) => string;
}> = ({ formData, calculateLeadScore, getAssignedSalesperson }) => (
  <div className="p-8">
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card iconBg="bg-[#6dbeb0]/20" icon={<User className="w-8 h-8 text-[#6dbeb0]" />} title="Request Details">
        <span>🆔 ID: #{Date.now().toString().slice(-6)}</span>
        <span>👤 Name: {formData.name}</span>
        <span>📧 Email: {formData.email}</span>
      </Card>
      <Card iconBg="bg-[#1b3d5a]/10" icon={<Building2 className="w-8 h-8 text-[#1b3d5a]" />} title="Project Info">
        {formData.project_type && <span>🏗️ Type: {formData.project_type}</span>}
        {formData.budget_range && <span>💰 Budget: {formData.budget_range.replace(/-/g, " - ")}</span>}
        <span>📊 Lead Score: {calculateLeadScore(formData)}/100</span>
      </Card>
      <Card iconBg="bg-[#3d9392]/20" icon={<Clock className="w-8 h-8 text-[#3d9392]" />} title="Response">
        <span>⏰ Within: 24 hours</span>
        <span>👤 Assigned: {getAssignedSalesperson(formData.project_type, formData.budget_range)}</span>
        <span>📞 Method: {formData.preferred_contact}</span>
      </Card>
    </div>
    
    {/* What happens next */}
    <div className="bg-[#e5f1f1] p-8 rounded-3xl border-2 border-[#6dbeb0]/30 mb-6">
      <div className="flex items-center text-[#1b3d5a] mb-4">
        <Calendar className="w-8 h-8 mr-3" />
        <span className="text-2xl font-bold">What Happens Next?</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6 text-[#1b3d5a]">
        {[
          "Our team reviews your project requirements",
          "We prepare a detailed, customized quote",
          "You receive a comprehensive proposal",
          "We schedule a consultation meeting"
        ].map((txt, i) => (
          <div key={txt} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#6dbeb0] text-white rounded-full flex items-center justify-center text-sm font-bold">
              {i + 1}
            </div>
            <span className="font-medium">{txt}</span>
          </div>
        ))}
      </div>
    </div>
    
    {/* Confirmation banner */}
    <div className="bg-[#e5f1f1] p-4 rounded-2xl text-center">
      <div className="flex items-center justify-center text-[#1b3d5a] mb-2">
        <Award className="w-6 h-6 mr-2" />
        <span className="font-bold text-lg">Success Confirmation</span>
      </div>
      <p className="text-[#1b3d5a] mb-4">✅ Your quote request has been saved & our sales team notified.</p>
    </div>
  </div>
);

const SuccessFooter: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="p-8 pt-0 text-center">
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={onClose}
        className="bg-[#6dbeb0] hover:bg-[#3d9392] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
      >
        Continue Browsing
      </button>
      <a
        href="tel:+85620555155551"
        className="border-2 border-[#6dbeb0] text-[#6dbeb0] hover:bg-[#e5f1f1] px-8 py-4 rounded-xl font-bold text-lg transition-colors"
      >
        Call Us Now
      </a>
    </div>
  </div>
);

interface CardProps {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ iconBg, icon, title, children }) => (
  <div className="bg-[#e5f1f1] p-6 rounded-2xl text-center space-y-1">
    <div className={`${iconBg} p-3 rounded-full inline-flex mb-3`}>{icon}</div>
    <h4 className="font-bold text-[#1b3d5a] mb-2">{title}</h4>
    <div className="text-sm text-[#1b3d5a] space-y-1">{children}</div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */
const getBudgetPriority = (budget: string): string => {
  if (!budget) return "low";
  if (budget.includes("over-500000") || budget.includes("250000-500000")) return "high";
  if (budget.includes("100000-250000") || budget.includes("50000-100000")) return "medium";
  return "low";
};

const getEstimatedValue = (budget: string): number => {
  const map: Record<string, number> = {
    "under-10000": 7500,
    "10000-25000": 17500,
    "25000-50000": 37500,
    "50000-100000": 75000,
    "100000-250000": 175000,
    "250000-500000": 375000,
    "over-500000": 750000
  };
  return map[budget] ?? 50000;
};

const calculateLeadScore = (d: FormData): number => {
  let s = 50;
  if (d.budget_range?.includes("over-500000")) s += 30;
  else if (d.budget_range?.includes("250000-500000")) s += 25;
  else if (d.budget_range?.includes("100000-250000")) s += 20;
  else if (d.budget_range?.includes("50000-100000")) s += 15;
  else if (d.budget_range?.includes("25000-50000")) s += 10;
  if (d.company.trim()) s += 15;
  if (d.timeline === "asap") s += 10;
  else if (d.timeline === "1-3months") s += 8;
  else if (d.timeline === "3-6months") s += 5;
  if (["commercial", "industrial"].includes(d.project_type)) s += 10;
  if (d.description.length > 100) s += 5;
  return Math.min(s, 100);
};

const calculateWinProbability = (d: FormData): number => {
  let p = 50;
  const est = getEstimatedValue(d.budget_range);
  if (est >= 100000) p += 20;
  else if (est >= 50000) p += 10;
  if (["asap", "1-3months"].includes(d.timeline)) p += 15;
  if (d.company.trim()) p += 10;
  if (d.description.length > 100) p += 5;
  return Math.min(p, 95);
};

const getQualification = (budget: string, _projectType: string): string => {
  const est = getEstimatedValue(budget);
  if (est >= 250000) return "hot";
  if (est >= 100000) return "warm";
  if (est >= 25000) return "qualified";
  return "lead";
};

const getAssignedSalesperson = (ptype: string, budget: string): string => {
  const est = getEstimatedValue(budget);
  if (est >= 250000) return "Sarah Wilson";
  if (["commercial", "industrial"].includes(ptype)) return "Lisa Brown";
  if (ptype === "residential") return "David Chen";
  return "Lisa Brown";
};

const getNextAction = (ptype: string, budget: string): string => {
  const est = getEstimatedValue(budget);
  if (est >= 250000) return "executive_consultation";
  if (ptype === "consultation") return "schedule_consultation";
  if (ptype === "materials") return "send_catalog";
  return "prepare_detailed_quote";
};

const getSourceDetails = (src: string) => {
  const map: Record<string, any> = {
    hero_get_free_quote: { section: "Hero", button: "Get Free Quote", priority: "high" },
    products_get_product_quote: { section: "Products", button: "Get Product Quote", priority: "medium" },
    footer_contact_now: { section: "Footer", button: "Contact Now", priority: "medium" }
  };
  return map[src] || { section: "Unknown", button: "Unknown", priority: "low" };
};

export default QuoteModal;
