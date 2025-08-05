"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, Clock, Globe, CheckCircle, Sparkles, Calendar, User, X } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import Trans from '../components/Trans';

const Contact = () => {
  const { t } = useLanguage();
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

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      // Auto-close when countdown reaches 0
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
      setSuccess(false);
      setCountdown(15); // Reset countdown for next time
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      console.log('📝 Submitting contact form:', formData);

      // Create comprehensive contact record
      const contactData = {
        // Core form fields
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        service: formData.service,
        message: formData.message.trim(),
        
        // Additional tracking fields
        status: 'new',
        priority: formData.service === 'waterproofing' ? 'high' : 'medium',
        source: 'contact_section',
        preferred_contact: 'email',
        urgency: 'medium',
        
        // Customer profile
        customer_profile: {
          fullName: formData.name.trim(),
          firstName: formData.name.trim().split(' ')[0],
          lastName: formData.name.trim().split(' ').slice(1).join(' ') || '',
          leadScore: Math.floor(Math.random() * 30) + 60,
          qualification: 'warm',
          communicationPreference: formData.phone ? 'phone' : 'email'
        },
        
        // Project context
        project_context: {
          estimatedBudget: getEstimatedBudget(formData.service, formData.message),
          projectType: formData.service || 'general',
          urgency: formData.message.toLowerCase().includes('urgent') ? 'urgent' : 'medium',
          location: extractLocation(formData.message) || 'Laos'
        },
        
        // Internal notes
        internal_notes: {
          assignedTo: getAssignedPerson(formData.service),
          nextAction: getNextAction(formData.service),
          estimatedValue: getEstimatedBudget(formData.service, formData.message),
          conversionProbability: Math.floor(Math.random() * 30) + 50
        }
      };

      // Save to database directly using Supabase client
      const { data: savedRecord, error: insertError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Database insert error:', insertError);
        throw insertError;
      }
      
      console.log('✅ Contact form saved successfully:', {
        id: savedRecord.id,
        name: contactData.name,
        service: contactData.service,
        leadScore: contactData.customer_profile.leadScore
      });

        // Send email notification
      try {
        const response = await fetch('/api/send-contact-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        console.log('Email API response:', result);
      } catch (emailError) {
        console.error('❌ Email notification error:', emailError);
      } 

      // Show success immediately and start countdown
      setSuccess(true);
      setIsSubmitting(false);
      setCountdown(15); // Start 15-second countdown

    } catch (err) {
      console.error('❌ Error saving contact form:', err);
      setError('Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getEstimatedBudget = (service: string, message: string): number => {
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

  const extractLocation = (message: string): string | null => {
    const messageText = message.toLowerCase();
    const locations = ['vientiane', 'luang prabang', 'savannakhet', 'pakse', 'champasak'];
    
    for (const location of locations) {
      if (messageText.includes(location)) {
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }
    return null;
  };

  const getAssignedPerson = (service: string): string => {
    switch (service) {
      case 'construction': return 'Sarah Wilson';
      case 'waterproofing': return 'John Doe';
      case 'flooring': return 'Jane Smith';
      case 'consultation': return 'Mike Johnson';
      default: return 'Lisa Brown';
    }
  };

  const getNextAction = (service: string): string => {
    switch (service) {
      case 'construction': return 'schedule_site_visit';
      case 'waterproofing': return 'send_technical_info';
      case 'flooring': return 'send_material_samples';
      case 'consultation': return 'schedule_consultation';
      default: return 'send_initial_quote';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    setCountdown(15); // Reset countdown
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('Phone Numbers'),
      info: "+856 21 773 737",
      subInfo: "+856 20 5443 3151" 
    },
    {
      icon: Mail,
      title: t('Email Address'),
      info: "info@slklaos.la",
      subInfo: "mark@slklaos.la"
    },
    {
      icon: MapPin,
      title: t('Office Location'),
      info: t('Vientiane Capital, Laos'),
      subInfo: t('Phonekham Village, Sikhottabong District')
    },
    {
      icon: Clock,
      title: t('Business Hours'),
      info: t('Mon - Fri: 8:00 - 17:00'),
      subInfo: t('Sat: 8:00 - 12:00')
    }
  ];

  return (
    <section id="contact" className="relative py-20 bg-white overflow-hidden">
      {/* Parallax/Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-gradient-to-br from-[#e8f6f5] via-white to-[#f3f7fa] animate-gradient-move"></div>
        {/* Floating Sparkles/Glow */}
        <svg className="absolute top-10 left-10 animate-float-slow opacity-30" width="80" height="80" fill="none" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="#3d9392" fillOpacity="0.15" />
          <circle cx="60" cy="20" r="8" fill="#3d9392" fillOpacity="0.12" />
        </svg>
        <svg className="absolute bottom-20 right-20 animate-float-medium opacity-20" width="60" height="60" fill="none" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="20" fill="#6dbeb0" fillOpacity="0.13" />
        </svg>
        {/* Floating/Fade-in Company Logo */}
        <img src="/SLK-logo.png" alt="SLK Logo" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 opacity-10 animate-fade-in-slow pointer-events-none select-none" />
      </div>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-luxury">
            <Trans as="span">Contact</Trans> <span className="text-[#3d9392]"><Trans as="span">Us</Trans></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            <Trans as="span">Get in touch with our team for inquiries, quotes, or support</Trans>
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <AnimatedSection animation="fade-right">
            <div className="relative p-8 rounded-2xl border border-gray-200 shadow-xl bg-white/60 backdrop-blur-xl glass-card overflow-hidden">
              {/* 100% Response Rate Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-100 border border-green-300 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-md animate-badge-pop z-10">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                100% Response Rate
              </div>
              <AnimatedSection animation="fade-up">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  <Trans as="span">Send Us a Message</Trans>
                </h3>
              </AnimatedSection>

              {/* Error Message */}
              {error && (
                <AnimatedSection animation="fade-in">
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                    <p className="font-medium">{error}</p>
                  </div>
                </AnimatedSection>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <AnimatedSection animation="fade-right" delay={100}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <Trans as="span">Full Name</Trans> *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting || success}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold"
                        placeholder={t('Your full name')}
                      />
                    </div>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="fade-left" delay={150}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <Trans as="span">Email Address</Trans> *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting || success}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold"
                        placeholder={t('your@email.com')}
                      />
                    </div>
                  </AnimatedSection>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <AnimatedSection animation="fade-right" delay={200}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <Trans as="span">Phone Number</Trans>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting || success}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold"
                        placeholder={t('+856 20 xxx xxxx')}
                      />
                    </div>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="fade-left" delay={250}>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <Trans as="span">Service Interest</Trans>
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        disabled={isSubmitting || success}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold"
                      >
                        <option value="">{t('Select a service')}</option>
                        <option value="construction">{t('Design & Construction')}</option>
                        <option value="waterproofing">{t('Waterproofing')}</option>
                        <option value="flooring">{t('Flooring')}</option>
                        <option value="consultation">{t('Consultation')}</option>
                        <option value="renovation">{t('Renovation')}</option>
                        <option value="maintenance">{t('Maintenance')}</option>
                      </select>
                    </div>
                  </AnimatedSection>
                </div>

                <AnimatedSection animation="fade-up" delay={300}>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <Trans as="span">Message</Trans>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      disabled={isSubmitting || success}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none bg-white disabled:opacity-50 text-gray-900 font-semibold placeholder:text-[#bfa76a] placeholder:font-semibold"
                      placeholder={t('Tell us about your project requirements...')}
                    ></textarea>
                  </div>
                </AnimatedSection>

                <AnimatedSection animation="scale" delay={350}>
                  <button
                    type="submit"
                    disabled={isSubmitting || success}
                    className="w-full bg-[#3d9392] hover:bg-[#3d9392]/80 disabled:bg-primary/50 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none relative overflow-hidden group"
                  >
                    {/* Ripple/Glow Effect */}
                    <span className="absolute inset-0 rounded-lg pointer-events-none group-active:animate-ripple-glow group-hover:animate-glow" />
                    {isSubmitting ? ( 
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        <Trans as="span">Sending Message...</Trans>
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <Trans as="span">Message Sent Successfully!</Trans>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        <Trans as="span">Send Message</Trans>
                      </>
                    )}
                  </button>
                </AnimatedSection>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Information */}
          <div>
            <AnimatedSection animation="fade-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                <Trans as="span">Get in Touch</Trans>
              </h3>
              
              <div className="space-y-6 mb-12">
                {contactInfo.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <AnimatedSection
                      key={index}
                      animation="fade-left"
                      delay={index * 100}
                      className="flex items-start"
                    >
                      <AnimatedSection animation="bounce-in" delay={index * 100 + 100}>
                        <div className="bg-primary/10 p-3 rounded-lg mr-4 flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-[#3d9392]" /> 
                        </div>
                      </AnimatedSection>
                      <div>
                        <AnimatedSection animation="fade-up" delay={index * 100 + 150}>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-gray-700 mb-1">{item.info}</p>
                          <p className="text-gray-500 text-sm">{item.subInfo}</p>
                        </AnimatedSection>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            </AnimatedSection>

           {/* Interactive Google Map */}
            <AnimatedSection animation="scale" delay={400}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                <AnimatedSection animation="slide-down">
                  <div className="bg-gradient-to-r from-[#3d9392] to-[#3d9392]/40 text-white p-4">
                    <div className="flex items-center">
                      <MapPin className="w-6 h-6 mr-3" />
                      <div>
                        <h4 className="font-bold text-lg">{t('Our Location')}</h4>
                        <p className="text-blue-100 text-sm">{t('Vientiane Capital, Laos')}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
                
                {/* Google Map Embed */}
                <div className="relative h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.035234013353!2d102.5979300750489!3d17.97086119399556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x312468e2e7e7c2e7%3A0x6e2e7c2e7e7c2e7c!2sSLK%20Trading%20and%20Design-Construction%20Complete%20Sole%20Co%20LTD!5e0!3m2!1sen!2sla!4v1722345678901!5m2!1sen!2sla"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SLK Trading & Design Construction Location in Vientiane, Laos"
                    className="w-full h-full"
                  ></iframe>
                </div>

                {/* Map Overlay with Company Info + Verified Badge */}
                <AnimatedSection animation="fade-in" delay={600}>
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs">
                    <div className="flex items-center mb-2">
                      <img 
                        src="/SLK-logo.png" 
                        alt="SLK Logo"
                        className="w-8 h-8 object-contain mr-2"
                      />
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">SLK Trading</h5>
                        <p className="text-xs text-gray-600">& Design Construction</p>
                      </div>
                      {/* Verified Business Badge */}
                      <span className="ml-2 flex items-center bg-blue-100 border border-blue-300 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold animate-badge-pop">
                        <svg className="w-3 h-3 mr-1 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Verified Business
                      </span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <p className="flex items-center mb-1">
                        <MapPin className="w-3 h-3 mr-1 text-[#6dbeb0]" />
                        Vientiane Capital, Laos 
                      </p>
                      <p className="flex items-center mb-1">
                        <Phone className="w-3 h-3 mr-1 text-[#6dbeb0]" />
                        +856 20 5551 5551     
                      </p>
                      <p className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-[#6dbeb0]" />
                        Mon-Fri: 8:00-17:00
                      </p>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Directions Button */}
                <AnimatedSection animation="scale" delay={700}>
                  <div className="absolute bottom-4 right-4">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=XHVX%2BQX3+SLK+Trading+and+Design-Construction+Complete+Sole+Co+LTD,+%E0%BA%AE%E0%BB%88%E0%BA%AD%E0%BA%A1+1,+Vientiane,+Laos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#3d9392] hover:bg-[#3d9392]/70 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg transition-colors duration-300"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      <Trans as="span">Get Directions</Trans>
                    </a> 
                  </div>
                </AnimatedSection>
              </div>
            </AnimatedSection> 

            {/* Quick Contact */}
            <AnimatedSection animation="fade-up" delay={600}>
              <div className="bg-[#417d80] text-white p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-4"><Trans as="span">Need Urgent Assistance?</Trans></h4>
                <p className="mb-4 text-light">
                  <Trans as="span">Call our emergency support line for immediate assistance with your construction needs.</Trans>
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    <span className="font-semibold">+856 21 773 737</span>
                  </div>
                  <div className="flex items-center text-sm text-light">
                    <Globe className="w-4 h-4 mr-1" /> 
                    <Trans as="span">Available 24/7</Trans> 
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP MODAL WITH 15-SECOND COUNTDOWN */}
      {success && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          
          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4 pt-20 pb-8">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full animate-scale-in max-h-[90vh] overflow-y-auto">
              {/* Header with Countdown */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-6 rounded-t-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-float-slow"></div>
                
                {/* Countdown Timer */}
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-2 flex items-center space-x-2 shadow-lg border border-white/30">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="font-bold text-base text-white">{countdown}</span>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="bg-white/20 p-3 rounded-full inline-flex mb-3 shadow-lg backdrop-blur-sm">
                    <CheckCircle className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 animate-fade-in">
                    <Trans as="span">🎉 Message Sent Successfully!</Trans>
                  </h2>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 animate-bounce" />
                    <p className="text-white/90 text-lg font-medium">
                      <Trans as="span">Your inquiry has been received by our expert team</Trans>
                    </p>
                    <Sparkles className="w-5 h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <div className="bg-white/20 rounded-full px-4 py-1 inline-block backdrop-blur-sm border border-white/30">
                    <p className="text-white/90 text-xs font-semibold">
                      ✨ Premium Construction Services • Trusted Since 2010 ✨
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 mb-4">
                    <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Thank You for Choosing SLK!</h3>
                    <p className="text-green-700 text-base leading-relaxed">
                      Your message has been received and is now being processed by our expert team. 
                      We appreciate your interest in our premium construction services.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center text-blue-800 mb-3">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="font-bold text-base">Your Submission Details</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          <strong>Name:</strong> {formData.name}
                        </span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          <strong>Email:</strong> {formData.email}
                        </span>
                      </div>
                      {formData.service && (
                        <div className="flex items-center text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm">
                            <strong>Service:</strong> {formData.service}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-600 font-semibold">
                          📋 Reference ID: SLK-{Date.now().toString().slice(-6)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                    <div className="flex items-center text-amber-800 mb-3">
                      <Clock className="w-5 h-5 mr-2 text-amber-600" />
                      <span className="font-bold text-base">Response Timeline</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-amber-100 rounded-lg">
                        <span className="text-xs font-semibold text-amber-700">Assigned Expert:</span>
                        <span className="text-xs font-bold text-amber-800">{getAssignedPerson(formData.service)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-amber-100 rounded-lg">
                        <span className="text-xs font-semibold text-amber-700">Response Time:</span>
                        <span className="text-xs font-bold text-amber-800">Within 2-4 hours</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg">
                        <span className="text-xs font-semibold text-green-700">Priority Level:</span>
                        <span className="text-xs font-bold text-green-800 uppercase">
                          {formData.service === 'waterproofing' ? 'HIGH' : 'STANDARD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200 mb-6 shadow-lg">
                  <div className="flex items-center text-emerald-800 mb-3">
                    <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
                    <span className="text-lg font-bold">🚀 What Happens Next?</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-md">1</div>
                        <div>
                          <h5 className="font-bold text-emerald-800 mb-1 text-sm">Immediate Review</h5>
                          <p className="text-xs text-emerald-700">Our expert team reviews your message and project requirements within 30 minutes</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-md">2</div>
                        <div>
                          <h5 className="font-bold text-emerald-800 mb-1 text-sm">Expert Analysis</h5>
                          <p className="text-xs text-emerald-700">We prepare a detailed response with preliminary recommendations and cost estimates</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-md">3</div>
                        <div>
                          <h5 className="font-bold text-emerald-800 mb-1 text-sm">Personal Contact</h5>
                          <p className="text-xs text-emerald-700">We'll reach out via your preferred method with a comprehensive proposal</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-md">4</div>
                        <div>
                          <h5 className="font-bold text-emerald-800 mb-1 text-sm">Site Consultation</h5>
                          <p className="text-xs text-emerald-700">Schedule a free on-site consultation to discuss your project in detail</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-emerald-100 rounded-xl border border-emerald-300">
                    <div className="flex items-center justify-center text-emerald-800">
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span className="font-bold text-base">🎯 100% Response Guarantee</span>
                      <Sparkles className="w-4 h-4 ml-2" />
                    </div>
                    <p className="text-center text-emerald-700 text-xs mt-1">
                      We pride ourselves on responding to every inquiry with professional expertise and care
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 mb-4 shadow-md">
                    <div className="flex items-center justify-center text-orange-800 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-bold text-base">⏰ Auto-closing in {countdown} seconds</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-1000 ease-linear shadow-sm"
                        style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-orange-700 text-xs mt-2 font-medium">
                      You can continue browsing or close this message manually
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleCloseSuccess}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <Trans as="span">Continue Browsing</Trans>
                    </button>
                    
                    <a
                      href="tel:+85621773737"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-sm"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      <Trans as="span">Call Us Now</Trans>
                    </a>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">
                      💡 <strong>Pro Tip:</strong> Check your email inbox (including spam folder) for our detailed response within the next few hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseSuccess}
                className="absolute top-4 right-16 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


// Helper function for response time
const getResponseTime = (urgency: string): string => {
  switch (urgency) {
    case 'urgent': return '2 hours';
    case 'high': return '4 hours';
    case 'medium': return '24 hours';
    case 'low': return '48 hours';
    default: return '24 hours';
  }
};

// --- Custom Styles for luxury features ---
// Add these to your global CSS (e.g., globals.css) if not already present:
// .font-luxury { font-family: 'Playfair Display', serif; }
// .glass-card { box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18); }
// .animate-gradient-move { animation: gradientMove 12s ease-in-out infinite; background-size: 200% 200%; }
// @keyframes gradientMove { 0% {background-position:0% 50%;} 50% {background-position:100% 50%;} 100% {background-position:0% 50%;} }
// .animate-float-slow { animation: floatSlow 8s ease-in-out infinite alternate; }
// .animate-float-medium { animation: floatMedium 6s ease-in-out infinite alternate; }
// @keyframes floatSlow { 0% {transform:translateY(0);} 100% {transform:translateY(-20px);} }
// @keyframes floatMedium { 0% {transform:translateY(0);} 100% {transform:translateY(16px);} }
// .animate-fade-in-slow { animation: fadeInSlow 2.5s ease-in; }
// @keyframes fadeInSlow { from { opacity: 0; } to { opacity: 0.10; } }
// .animate-badge-pop { animation: badgePop 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
// @keyframes badgePop { 0% { transform: scale(0.7); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
// .animate-ripple-glow { animation: rippleGlow 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
// @keyframes rippleGlow { 0% { box-shadow: 0 0 0 0 #3d9392aa; opacity: 1; } 100% { box-shadow: 0 0 24px 16px #3d939233; opacity: 0; } }
// .animate-glow { animation: glowPulse 1.5s infinite alternate; }
// @keyframes glowPulse { 0% { box-shadow: 0 0 0 0 #3d939244; } 100% { box-shadow: 0 0 16px 8px #3d939244; } }

export default Contact;