
"use client";
import React, { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const ContactForm = () => {
  const { t } = useLanguage ? useLanguage() : { t: (x: string) => x };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (success && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (success && countdown === 0) {
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      setSuccess(false);
      setCountdown(15);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [success, countdown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        service: formData.service,
        message: formData.message.trim(),
        status: 'new',
        priority: formData.service === 'waterproofing' ? 'high' : 'medium',
        source: 'contact_section',
        preferred_contact: 'email',
        urgency: 'medium',
        customer_profile: {
          fullName: formData.name.trim(),
          firstName: formData.name.trim().split(' ')[0],
          lastName: formData.name.trim().split(' ').slice(1).join(' ') || '',
          leadScore: Math.floor(Math.random() * 30) + 60,
          qualification: 'warm',
          communicationPreference: formData.phone ? 'phone' : 'email'
        },
        project_context: {
          estimatedBudget: getEstimatedBudget(formData.service, formData.message),
          projectType: formData.service || 'general',
          urgency: formData.message.toLowerCase().includes('urgent') ? 'urgent' : 'medium',
          location: extractLocation(formData.message) || 'Laos'
        },
        internal_notes: {
          assignedTo: getAssignedPerson(formData.service),
          nextAction: getNextAction(formData.service),
          estimatedValue: getEstimatedBudget(formData.service, formData.message),
          conversionProbability: Math.floor(Math.random() * 30) + 50
        }
      };
      const { error: insertError } = await supabase.from('contacts').insert([contactData]);
      if (insertError) throw insertError;
      try {
        await fetch('/api/send-contact-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch {}
      setSuccess(true);
      setIsSubmitting(false);
      setCountdown(15);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getEstimatedBudget = (service: string, message: string) => {
    const messageText = message.toLowerCase();
    if (messageText.includes('small') || messageText.includes('simple')) return 5000;
    if (messageText.includes('large') || messageText.includes('complex')) return 50000;
    if (messageText.includes('commercial') || messageText.includes('office')) return 30000;
    if (messageText.includes('house') || messageText.includes('home')) return 25000;
    switch (service) {
      case 'construction': return 40000;
      case 'waterproofing': return 8000;
      case 'flooring': return 12000;
      case 'consultation': return 2000;
      case 'renovation': return 20000;
      case 'maintenance': return 5000;
      default: return 15000;
    }
  };
  const extractLocation = (message: string) => {
    const messageText = message.toLowerCase();
    const locations = ['vientiane', 'luang prabang', 'savannakhet', 'pakse', 'champasak'];
    for (const location of locations) {
      if (messageText.includes(location)) {
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }
    return null;
  };
  const getAssignedPerson = (service: string) => {
    switch (service) {
      case 'construction': return 'Sarah Wilson';
      case 'waterproofing': return 'John Doe';
      case 'flooring': return 'Jane Smith';
      case 'consultation': return 'Mike Johnson';
      default: return 'Lisa Brown';
    }
  };
  const getNextAction = (service: string) => {
    switch (service) {
      case 'construction': return 'schedule_site_visit';
      case 'waterproofing': return 'send_technical_info';
      case 'flooring': return 'send_material_samples';
      case 'consultation': return 'schedule_consultation';
      default: return 'send_initial_quote';
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedSection animation="fade-right" delay={100}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting || success} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold" placeholder="Your full name" />
          </div>
        </AnimatedSection>
        <AnimatedSection animation="fade-left" delay={150}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting || success} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold" placeholder="your@email.com" />
          </div>
        </AnimatedSection>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedSection animation="fade-right" delay={200}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isSubmitting || success} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold" placeholder="+856 20 xxx xxxx" />
          </div>
        </AnimatedSection>
        <AnimatedSection animation="fade-left" delay={250}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Service Interest</label>
            <select name="service" value={formData.service} onChange={handleChange} disabled={isSubmitting || success} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold">
              <option value="">Select a service</option>
              <option value="construction">Design & Construction</option>
              <option value="waterproofing">Waterproofing</option>
              <option value="flooring">Flooring</option>
              <option value="consultation">Consultation</option>
              <option value="renovation">Renovation</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </AnimatedSection>
      </div>
      <AnimatedSection animation="fade-up" delay={300}>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} rows={5} disabled={isSubmitting || success} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold" placeholder="Tell us about your project requirements..."></textarea>
        </div>
      </AnimatedSection>
      <AnimatedSection animation="scale" delay={350}>
        <button type="submit" disabled={isSubmitting || success} className="w-full bg-[#3d9392] hover:bg-[#3d9392]/80 disabled:bg-primary/50 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none">
          {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>Sending Message...</>) : success ? (<><CheckCircle className="w-5 h-5 mr-2" />Message Sent Successfully!</>) : (<><Send className="w-5 h-5 mr-2" />Send Message</>)}
        </button>
      </AnimatedSection>
      {error && (
        <AnimatedSection animation="fade-up">
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mt-4">
            <p className="font-medium">{error}</p>
          </div>
        </AnimatedSection>
      )}

      {/* Success Popup Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <AnimatedSection animation="scale">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-8 border border-green-200/50 text-center">
              {/* Success Icon */}
              <div className="bg-green-100 p-6 rounded-full inline-flex mb-6 shadow-lg">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              {/* Success Message */}
              <h3 className="text-3xl font-bold text-[#1a2936] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Message Sent Successfully!
              </h3>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Thank you for contacting us! Our team will review your request and get back to you within 24 hours.
              </p>
              
              {/* Next Steps */}
              <div className="bg-gradient-to-r from-[#bfa76a]/10 to-[#e5e2d6]/20 rounded-2xl p-6 mb-6 border border-[#bfa76a]/20">
                <h4 className="font-bold text-[#bfa76a] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  What happens next?
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span>We'll review your project requirements</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span>Our expert will contact you within 24 hours</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    <span>Schedule your free consultation</span>
                  </div>
                </div>
              </div>
              
              {/* Auto-close countdown */}
              <div className="text-sm text-gray-500 mb-6">
                This window will close automatically in <span className="font-bold text-[#bfa76a]">{countdown}</span> seconds
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setSuccess(false);
                  setCountdown(15);
                  setFormData({ name: '', email: '', phone: '', service: '', message: '' });
                }}
                className="bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] text-[#1a2936] hover:from-[#e5e2d6] hover:to-[#bfa76a] px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Close
              </button>
            </div>
          </AnimatedSection>
        </div>
      )}
    </form>
  );
};

export default ContactForm;
