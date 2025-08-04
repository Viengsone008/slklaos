"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, Clock, Globe, CheckCircle, Sparkles, Calendar, User, X, Building2, MessageCircle, Star } from 'lucide-react';
import AnimatedSection from '../../components/AnimatedSection';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WhatsAppChatButton from '../../components/WhatsAppChatButton';
import FloatingQuoteButton from '../../components/FloatingQuoteButton';
import QuoteModal from '../../components/QuoteModal';

const serviceToDepartment: Record<string, string> = {
  construction: "Planning",
  waterproofing: "Sales & Marketing",
  flooring: "Sales & Marketing",
  rocksoil: "Sales & Marketing",
  consultation: "Planning",
  renovation: "Planning",
  maintenance: "Planning",
};

const ContactPage = () => {
  // Scroll progress indicator and 3D effects
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setScrollY(scrollTop);
      setShowNav(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const router = useRouter();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(15);

  // --- Dynamic users for assignment ---
  const [users, setUsers] = useState<any[]>([]);
  const [assignedPersonName, setAssignedPersonName] = useState('');

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) setUsers(data);
    };
    fetchUsers();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      handleCloseSuccess();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, countdown]);

  // Helper functions
  const calculateLeadScore = (data: typeof formData): number => {
    let score = 50;
    if (data.company.trim()) score += 20;
    if (data.phone.trim()) score += 15;
    if (data.service) score += 10;
    if (data.urgency === 'urgent') score += 15;
    else if (data.urgency === 'high') score += 10;
    if (data.message.length > 100) score += 10;
    if (data.subject.trim()) score += 5;
    return Math.min(score, 100);
  };

  const getQualification = (data: typeof formData): string => {
    const score = calculateLeadScore(data);
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    if (score >= 40) return 'qualified';
    return 'lead';
  };

  // --- Random assignment: employee in department, not manager ---
  function getRandomAssignedUserId(service: string) {
    const department = serviceToDepartment[service];
    if (!department) return '';
    const employees = users.filter(
      (u) =>
        u.department &&
        u.department.toLowerCase() === department.toLowerCase() &&
        u.role === 'employee' &&
        (!u.position || u.position.toLowerCase() !== 'manager')
    );
    if (employees.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * employees.length);
    return employees[randomIndex].id;
  }

  const getResponseTime = (urgency: string): string => {
    switch (urgency) {
      case 'urgent': return '2 hours';
      case 'high': return '4 hours';
      case 'medium': return '24 hours';
      case 'low': return '48 hours';
      default: return '24 hours';
    }
  };

  const calculateConversionProbability = (data: typeof formData): number => {
    let probability = 30;
    if (data.company.trim()) probability += 25;
    if (data.service) probability += 20;
    if (data.urgency === 'urgent') probability += 20;
    else if (data.urgency === 'high') probability += 15;
    if (data.phone.trim()) probability += 10;
    if (data.message.length > 150) probability += 10;
    return Math.min(probability, 95);
  };

  // Dummy helpers for project_context (customize as needed)
  const getEstimatedBudget = (service: string, message: string) => {
    if (service === 'construction') return 50000;
    if (service === 'waterproofing') return 10000;
    if (service === 'flooring') return 8000;
    if (message.toLowerCase().includes('large')) return 100000;
    return 5000;
  };
  const extractLocation = (message: string) => {
    if (message.toLowerCase().includes('vientiane')) return 'Vientiane';
    return '';
  };

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    setCountdown(15);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      subject: '',
      message: '',
      preferredContact: 'email',
      urgency: 'medium'
    });
    setAssignedPersonName('');
  };

  // Main submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // --- Random assignment ---
      const assigned_to = getRandomAssignedUserId(formData.service);
      const assignedUser = users.find(u => u.id === assigned_to);
      setAssignedPersonName(assignedUser ? assignedUser.name : 'Customer Service Team');

      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        service: formData.service,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        preferredContact: formData.preferredContact, // camelCase for frontend
        urgency: formData.urgency,
      };

      // Send email notification with ALL fields and correct names
      await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      setSuccess(true);
      setIsSubmitting(false);
      setCountdown(15);

    } catch (err) {
      console.error('❌ Error saving contact form:', err);
      setError('Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Numbers",
      primary: "+856 21 773 737",
      secondary: "+856 20 5443 3151",
      description: "Call us during business hours"
    },
    {
      icon: Mail,
      title: "Email Addresses",
      primary: "info@slklaos.la",
      secondary: "mark@slklaos.la",
      description: "We respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Office Location",
      primary: "Vientiane Capital, Laos",
      secondary: "Phonekham Village, Sikhottabong District",
      description: "Visit us for consultations"
    },
    {
      icon: Clock,
      title: "Business Hours",
      primary: "Mon - Fri: 8:00 - 17:00",
      secondary: "Sat: 8:00 - 12:00",
      description: "Emergency support available"
    }
  ];

  const officeLocations = [
    {
      name: "Main Office",
      address: "Vientiane Capital, Laos",
      phone: "+856 21 773 737",
      email: "info@slklaos.la",
      hours: "Mon-Fri: 8:00-17:00"
    },
    {
      name: "Project Office",
      address: "Vientiane Capital, Laos",
      phone: "+856 20 5443 3151",
      email: "project@slklaos.la",
      hours: "Mon-Fri: 8:00-17:00"
    },
    {
      name: "Materials Warehouse",
      address: "Vientiane Capital, Laos",
      phone: "+856 20 7859 2943",
      email: "material@slklaos.la",
      hours: "Mon-Fri: 8:00-17:00" 
    }
  ];

  const testimonials = [
    {
      name: "Somchai Vongphachan",
      company: "Lao Development Corp",
      message: "Excellent communication and professional service. They understood our needs perfectly.",
      rating: 5
    },
    {
      name: "Bounmy Phommachanh",
      company: "Private Client",
      message: "Quick response time and detailed explanations. Very satisfied with their approach.",
      rating: 5
    },
    {
      name: "Khamla Sisavath",
      company: "Hotel Group",
      message: "Professional team that delivers on promises. Highly recommend their services.",
      rating: 5
    }
  ];

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <style jsx global>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .luxury-card-glass {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(191, 167, 106, 0.18);
            box-shadow: 0 8px 32px 0 rgba(191, 167, 106, 0.37);
          }
          .shadow-gold {
            box-shadow: 0 25px 50px -12px rgba(191, 167, 106, 0.25), 0 0 0 1px rgba(191, 167, 106, 0.05);
          }
          .luxury-gradient-text {
            background: linear-gradient(135deg, #bfa76a 0%, #e5e2d6 50%, #bfa76a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .luxury-gold-text {
            color: #f7f0cfff;
            text-shadow: 0 0 25px rgba(246, 242, 225, 0.7), 0 0 50px rgba(241, 233, 201, 0.4);
          }
          .luxury-fade-text {
            background: linear-gradient(135deg, #3d3935 0%, #5a5550 50%, #3d3935 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .drop-shadow-gold {
            filter: drop-shadow(0 4px 8px rgba(220, 211, 179, 0.4)) drop-shadow(0 2px 4px rgba(227, 219, 184, 0.25)) drop-shadow(0 0 15px rgba(226, 217, 184, 0.5));
          }
        `}</style>
        {/* Hero Section */}
        <section className="relative py-36 bg-gradient-to-br from-[#e5e2d6] via-[#bfa76a]/30 to-[#3d9392]/20 text-white overflow-hidden luxury-card-glass shadow-gold perspective-1000">
          <div 
            className="absolute inset-0 preserve-3d"
            style={{
              transform: `translateZ(0) translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002}) rotateX(${scrollY * 0.02}deg)`,
              willChange: 'transform'
            }}
          >
            <img 
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Contact_us_Hero.png" 
              alt="Contact SLK Trading"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[#bfa76a]/80 via-[#e5e2d6]/60 to-[#3d9392]/80 preserve-3d"
            style={{
              transform: `translateZ(10px) translateY(${scrollY * 0.3}px)`,
              willChange: 'transform'
            }}
          ></div>
          <div 
            className="absolute inset-0 bg-white/30 backdrop-blur-xl preserve-3d"
            style={{
              transform: `translateZ(20px) translateY(${scrollY * 0.2}px)`,
              willChange: 'transform'
            }}
          ></div>

          <div className="relative z-10 container mx-auto px-4">
            <div 
              className="preserve-3d"
              style={{
                transform: `translateZ(30px) translateY(${scrollY * 0.1}px)`,
                willChange: 'transform'
              }}
            >
              <AnimatedSection className="text-center max-w-4xl mx-auto luxury-card-glass bg-white/60 rounded-3xl p-12 shadow-gold border-2 border-[#bfa76a]/30 backdrop-blur-2xl">
              <h1 className="text-5xl lg:text-7xl font-extrabold mb-4 drop-shadow-[0_6px_32px_rgba(191,167,106,0.55)]">
                <span className="luxury-gold-text drop-shadow-gold">Contact Us</span>
              </h1>
              <div className="flex justify-center mb-6">
                <div className="h-1 w-32 bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#bfa76a] rounded-full shadow-gold"></div>
              </div>
              <p className="text-2xl text-[#3d3935] mb-10 leading-relaxed luxury-fade-text">
                Get in touch with our <span className="luxury-gold-text">construction experts</span>
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="text-center">
                  <Phone className="w-10 h-10 text-[#bfa76a] mx-auto mb-2 luxury-gold-text" />
                  <div className="text-lg font-bold text-[#3d3935] luxury-fade-text">Call Us</div>
                  <div className="text-[#bfa76a] text-sm font-medium">24/7 Support</div>
                </div>
                <div className="text-center">
                  <Mail className="w-10 h-10 text-[#bfa76a] mx-auto mb-2 luxury-gold-text" />
                  <div className="text-lg font-bold text-[#3d3935] luxury-fade-text">Email Us</div>
                  <div className="text-[#bfa76a] text-sm font-medium">Quick Response</div>
                </div>
                <div className="text-center">
                  <MapPin className="w-10 h-10 text-[#bfa76a] mx-auto mb-2 luxury-gold-text" />
                  <div className="text-lg font-bold text-[#3d3935] luxury-fade-text">Visit Us</div>
                  <div className="text-[#bfa76a] text-sm font-medium">Multiple Locations</div>
                </div>
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 text-[#bfa76a] mx-auto mb-2 luxury-gold-text" />
                  <div className="text-lg font-bold text-[#3d3935] luxury-fade-text">Chat</div>
                  <div className="text-[#bfa76a] text-sm font-medium">Live Support</div>
                </div>
              </div>
            </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <AnimatedSection animation="fade-right">
                <div className="bg-white/80 p-8 rounded-2xl shadow-gold border-2 border-[#bfa76a]/30 luxury-card-glass backdrop-blur-xl">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 luxury-fade-text">
                    Send Us a <span className="luxury-gold-text">Message</span>
                  </h2>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                      <p className="font-medium">{error}</p>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                          placeholder="+856 20 xxx xxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Company/Organization
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Service Interest
                        </label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                        >
                          <option value="">Select a service</option>
                          <option value="construction">Design & Construction</option>
                          <option value="waterproofing">Waterproofing Solutions</option>
                          <option value="flooring">Flooring Materials</option>
                          <option value="consultation">Project Consultation</option>
                          <option value="renovation">Renovation Services</option>
                          <option value="maintenance">Maintenance Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Urgency Level
                        </label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleChange}
                          disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                        >
                          <option value="low">Low - General inquiry</option>
                          <option value="medium">Medium - Planning phase</option>
                          <option value="high">High - Ready to start</option>
                          <option value="urgent">Urgent - Immediate need</option>
                        </select>
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting || success}
                          className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                          placeholder="Brief subject of your inquiry"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        disabled={isSubmitting || success}
                        className="w-full px-4 py-3 rounded-lg border border-[#bfa76a]/30 focus:ring-2 focus:ring-[#bfa76a] focus:border-[#bfa76a] transition-all duration-300 resize-none disabled:opacity-50 text-gray-900 placeholder:text-[#bfa76a] font-semibold bg-white/80 shadow-gold"
                        placeholder="Please describe your project requirements, questions, or how we can help you..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-3">
                        Preferred Contact Method
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value="email"
                            checked={formData.preferredContact === 'email'}
                            onChange={handleChange}
                            disabled={isSubmitting || success}
                            className="w-4 h-4 text-[#6dbeb0] border-gray-300 focus:ring-[#6dbeb0] disabled:opacity-50"
                          />
                          <Mail className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">Email</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value="phone"
                            checked={formData.preferredContact === 'phone'}
                            onChange={handleChange}
                            disabled={isSubmitting || success}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                          />
                          <Phone className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-700">Phone Call</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="preferredContact"
                            value="both"
                            checked={formData.preferredContact === 'both'}
                            onChange={handleChange}
                            disabled={isSubmitting || success}
                            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700 ml-2">Both Email & Phone</span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || success}
                      className="w-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] hover:from-[#e5e2d6] hover:to-[#bfa76a] text-[#3d3935] px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-2xl disabled:opacity-60 disabled:transform-none disabled:shadow-none luxury-gradient-text border border-[#bfa76a]/40"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Sending Message...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Message Sent Successfully!
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </AnimatedSection>

              {/* Contact Information */}
              <div>
                <AnimatedSection animation="fade-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Get in Touch
                  </h2>
                  
                  <div className="space-y-6 mb-12">
                    {contactInfo.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <AnimatedSection
                          key={index}
                          animation="fade-left"
                          delay={index * 100}
                          className="bg-white/80 p-6 rounded-2xl shadow-gold hover:shadow-gold transition-all duration-300 transform hover:-translate-y-1 border-2 border-[#bfa76a]/20 luxury-card-glass backdrop-blur-xl"
                        >
                          <div className="flex items-start">
                            <div className="bg-[#6dbeb0]/20 p-3 rounded-lg mr-4 flex-shrink-0">
                              <IconComponent className="w-6 h-6 text-[#6dbeb0]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {item.title}
                              </h4>
                              <p className="text-gray-700 font-medium mb-1">{item.primary}</p>
                              <p className="text-gray-600 mb-2">{item.secondary}</p>
                              <p className="text-gray-500 text-sm">{item.description}</p>
                            </div>
                          </div>
                        </AnimatedSection>
                      );
                    })}
                  </div>
                </AnimatedSection>

                
              </div>
            </div>
          </div>
        </section>

        

        {/* Get a Quote Section */}
        <section className="py-20 bg-gradient-to-br from-[#e5e2d6] via-white to-[#bfa76a]/20">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Start Your <span className="text-yellow-400">Project?</span>
              </h2>
              <div className="flex justify-center mb-6">
                <div className="h-1 w-32 bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#bfa76a] rounded-full shadow-gold"></div>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Get a detailed quote for your construction, waterproofing, or flooring project. 
                Our experts will provide you with a comprehensive proposal tailored to your needs.
              </p>
            </AnimatedSection>
            {/* Call to Action */}
            <AnimatedSection animation="fade-up" delay={500} className="text-center mt-16">
              <div className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] rounded-2xl p-10 text-[#3d3935] relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="bg-white/20 p-4 rounded-full inline-flex mb-4">
                      <Star className="w-8 h-8 text-[#3d3935]" />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Work With Us?</h3>
                    <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                      Join <span className="font-bold">500+</span> satisfied customers who have trusted SLK Trading & Design Construction 
                      with their most important projects. From concept to completion, we deliver excellence.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-[#3d3935] mb-1">500+</div>
                      <div className="text-sm text-[#3d3935]/80">Projects Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-[#3d3935] mb-1">15+</div>
                      <div className="text-sm text-[#3d3935]/80">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-[#3d3935] mb-1">98%</div>
                      <div className="text-sm text-[#3d3935]/80">Client Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-[#3d3935] mb-1">24/7</div>
                      <div className="text-sm text-[#3d3935]/80">Support Available</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group"
                    >
                      <Send className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      Get Your Free Quote Now
                    </button>
                    <button
                      onClick={() => {
                        // Check if device is mobile
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                        if (isMobile) {
                          window.location.href = "tel:+85621773737";
                        }
                        // Do nothing on desktop
                      }}
                      className="bg-white/20 hover:bg-white/30 text-[#3d3935] px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center group border-2 border-white/30 hover:border-white/50"
                    >
                      <Phone className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      Call: +856 21 773 737
                    </button>
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#3d3935]/80">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Licensed & Insured</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Free Consultation</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Quality Guarantee</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Competitive Pricing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
            
              
            </div>

            {/* Quote Process Steps */}
            <AnimatedSection animation="fade-up" delay={400}>
              <div className="bg-white/60 rounded-2xl p-8 shadow-gold border-2 border-[#bfa76a]/30 luxury-card-glass backdrop-blur-xl">
                <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
                  Our Quote <span className="text-yellow-400">Process</span>
                </h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-[#bfa76a] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      1
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Submit Request</h4>
                    <p className="text-sm text-gray-600">Fill out our quote form with your project details and requirements</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-[#3d9392] text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      2
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Site Assessment</h4>
                    <p className="text-sm text-gray-600">Our experts visit your site to evaluate the scope and requirements</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      3
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Detailed Proposal</h4>
                    <p className="text-sm text-gray-600">Receive a comprehensive quote with timeline and material breakdown</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      4
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Project Start</h4>
                    <p className="text-sm text-gray-600">Approve the quote and begin your construction project with confidence</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            
          </div>
        </section>
        {/* Map Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Find <span className="text-[#3d9392]">Us</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Visit our office for consultations and project discussions
              </p>
            </AnimatedSection>

            <AnimatedSection animation="scale" delay={200}>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#3d9392]/70 to-[#3d9392]/90 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-8 h-8 mr-3" />
                      <div>
                        <h3 className="text-2xl font-bold">Our Main Office</h3>
                        <p className="text-blue-100">Vientiane Capital, Laos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100">Business Hours</p>
                      <p className="font-semibold">Mon-Fri: 8:00-17:00</p>
                    </div>
                  </div>
                </div>
                
                {/* Google Map */}
                <div className="relative h-96">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.04711173944!2d102.56207842167969!3d17.966664800000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x312465a564988917%3A0x4fcb7c5b4c7a0f4e!2sVientiane%2C%20Laos!5e0!3m2!1sen!2sus!4v1703123456789!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SLK Trading & Design Construction Location"
                    className="w-full h-full"
                  ></iframe>
                  
                  {/* Map Overlay */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                    <div className="flex items-center mb-2">
                      <Building2 className="w-8 h-8 text-[#3d9392] mr-2" />
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">SLK Trading</h5>
                        <p className="text-xs text-gray-600">& Design Construction</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p>📍 Vientiane Capital, Laos - Phonekham Village, Sikhottabong District</p>
                      <p>📞 +856 21 773 737</p>
                      <p>🕒 Mon-Fri: 8:00-17:00</p>
                    </div>
                  </div>

                  {/* Directions Button */}
                  <div className="absolute bottom-4 right-4">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=XHVX%2BQX3+SLK+Trading+and+Design-Construction+Complete+Sole+Co+LTD,+%E0%BA%AE%E0%BB%88%E0%BA%AD%E0%BA%A1+1,+Vientiane,+Laos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>

      {/* SUCCESS POPUP MODAL */}
      {success && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md"></div>
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white/90 rounded-3xl shadow-gold max-w-2xl w-full animate-scale-in border-2 border-[#bfa76a]/30 luxury-card-glass backdrop-blur-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#3d3935] p-8 rounded-t-3xl relative overflow-hidden luxury-gradient-text border-b-2 border-[#bfa76a]/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#bfa76a]/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#bfa76a]/10 rounded-full -ml-12 -mb-12"></div>
                
                {/* Countdown Timer */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-lg">{countdown}</span>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="bg-[#bfa76a]/20 p-4 rounded-full inline-flex mb-4">
                    <CheckCircle className="w-12 h-12 text-[#bfa76a]" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 luxury-fade-text">Message Sent <span className="luxury-gold-text">Successfully!</span></h2>
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#bfa76a]" />
                    <p className="text-[#bfa76a] text-lg">We've received your inquiry</p>
                    <Sparkles className="w-5 h-5 text-[#bfa76a]" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="flex items-center text-green-800 mb-2">
                      <User className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Contact Details</span>
                    </div>
                    <p className="text-sm text-green-700">
                      👤 Name: <span className="font-semibold">{formData.name}</span>
                    </p>
                    <p className="text-sm text-green-700">
                      📧 Email: <span className="font-semibold">{formData.email}</span>
                    </p>
                    {formData.company && (
                      <p className="text-sm text-green-700">
                        🏢 Company: <span className="font-semibold">{formData.company}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center text-blue-800 mb-2">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Response Timeline</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      ⏰ Response time: <span className="font-semibold">{getResponseTime(formData.urgency)}</span>
                    </p>
                    <p className="text-sm text-blue-700">
                      👤 Assigned to: <span className="font-semibold">{assignedPersonName}</span>
                    </p>
                    <p className="text-sm text-blue-700">
                      📊 Priority: <span className="font-semibold capitalize">{formData.urgency}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 mb-6">
                  <div className="flex items-center text-green-800 mb-3">
                    <Calendar className="w-6 h-6 mr-2" />
                    <span className="text-lg font-bold">What Happens Next?</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-green-700">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                        <span className="text-sm">Team reviews your message</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                        <span className="text-sm">Prepare detailed response</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-green-700">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                        <span className="text-sm">Contact you via preferred method</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                        <span className="text-sm">Schedule consultation if needed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center text-orange-800 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-bold">Auto-closing in {countdown} seconds</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCloseSuccess}
                    className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] hover:from-[#e5e2d6] hover:to-[#bfa76a] text-[#3d3935] px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-gold hover:shadow-2xl luxury-gradient-text border border-[#bfa76a]/40"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseSuccess}
                className="absolute top-4 right-16 text-[#bfa76a]/80 hover:text-[#bfa76a] hover:bg-[#bfa76a]/10 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {showNav && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <WhatsAppChatButton />
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)}
        source="footer_contact_now"
      />
    </>
  );
};

export default ContactPage;