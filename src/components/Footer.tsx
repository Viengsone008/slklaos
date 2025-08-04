"use client";
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Linkedin, Instagram } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import QuoteModal from '../components/QuoteModal';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Image from "next/image";


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberName, setSubscriberName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const footerLinks = {
    services: [ 
      { name: 'Design & Construction', path: '/services' },
      { name: 'Waterproofing Materials', path: '/products/waterproofing' },
      { name: 'Flooring Materials', path: '/products/flooring' },
      { name: 'Project Consultation', path: '/services' },
      { name: 'Quality Assurance', path: '/services' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Team', path: '/about' },
      { name: 'Products', path: '/products' },
      { name: 'Projects', path: '/projects' },
      { name: 'Careers', path: '/careers' },
      { name: 'News & Updates', path: '/news' }
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'Technical Support', path: '/contact' },
      { name: 'Warranty', path: '/services' },
      { name: 'Maintenance', path: '/services' },
      { name: 'Emergency Service', path: '/contact' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/slklaos', label: 'Facebook' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/slklaos', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://www.instagram.com/slklaos', label: 'Instagram' }
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriberEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriberEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      // Use direct Supabase client to ensure public access
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: subscriberEmail.trim().toLowerCase(),
          status: 'active',
          source: 'footer',
          preferences: {
            news: true,
            projects: true,
            announcements: true,
            blog: true
          }
        });
      
      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.warn('Subscription warning: Email already subscribed', error);
          toast.error('This email is already subscribed to our newsletter');
        } else {
          console.error('Subscription error:', error);
          toast.error('Failed to subscribe. Please try again later.');
        }
        setIsSubscribing(false);
        return;
      }
      
      // Clear the input and show success message
      setSubscriberEmail('');
      toast.success('Thank you for subscribing to our newsletter!');
      
      // Send to external API
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriberEmail, name: subscriberName }),
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLinkClick = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <footer className="bg-[#1b3d5a] text-white">
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <AnimatedSection animation="fade-up">
              <div className="lg:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="mr-3">
                    <Image
                      src="/SLK-logo.png"
                      alt="SLK Trading & Design Construction Logo"
                      width={208}
                      height={208}
                      className="object-contain"
                    />
                  </div>
                 
                </div>
                <h3 className="text-xl font-bold">SLK Trading</h3>
                    <p className="text-sm text-gray-400">& Design Construction Co., Ltd</p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  
                </p>  
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Professional construction services, waterproofing materials, and flooring materials for all your building needs in Laos.
                </p>
                
                {/* Social Links */}
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a 
                        key={index}
                        href={social.href} 
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="bg-[#1b3d5a] hover:bg-[#6dbeb0] p-2 rounded-lg transition-colors duration-300"
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* Services */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div>
                <h4 className="text-lg font-semibold mb-6 text-[#6dbeb0]">Our Services</h4>
                <ul className="space-y-3">
                  {footerLinks.services.map((link, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => handleLinkClick(link.path)}
                        className="text-gray-300 hover:text-[#6dbeb0] transition-colors duration-300"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Company */}
            <AnimatedSection animation="fade-up" delay={200}>
              <div>
                <h4 className="text-lg font-semibold mb-6 text-[#6dbeb0]">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => handleLinkClick(link.path)}
                        className="text-gray-300 hover:text-[#6dbeb0] transition-colors duration-300"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Contact Info & Newsletter */}
            <AnimatedSection animation="fade-up" delay={300}>
              <div>
                <h4 className="text-lg font-semibold mb-6 text-[#6dbeb0]">Contact Us</h4>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#6dbeb0] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">Vientiane Capital, Laos</p>
                      <p className="text-gray-400 text-sm">Phonekham Village, Sikhottabong Distric</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-[#6dbeb0] mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">+856 21 773 737</p>
                      <p className="text-gray-400 text-sm">+856 20 5443 3151</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-[#6dbeb0] mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">info@slklaos.la</p>
                      <p className="text-gray-400 text-sm">mark@slklaos.la</p>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-6">
                  <h5 className="font-semibold mb-3 text-white">Subscribe to Newsletter</h5>
                  <form onSubmit={handleSubscribe} className="flex">
                    <input 
                      type="email"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      placeholder="Your email address"
                      className="flex-1 text-blue-900 px-4 py-2 rounded-l-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6dbeb0]"
                      required 
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="bg-[#6dbeb0] hover:bg-[#3d9392] disabled:bg-[#6dbeb0]/50 text-white px-4 py-2 rounded-r-lg font-medium transition-colors"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                </div>

                {/* Quick Quote CTA */}
                <div className="mt-6 bg-[#6dbeb0] p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Need a Quick Quote?</h5>
                  <p className="text-sm text-white/90 mb-3">
                    Get a free quote for your construction project or material needs.
                  </p>
                  <button 
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="bg-white text-[#6dbeb0] px-4 py-2 rounded font-medium text-sm hover:bg-[#e5f1f1] transition-colors duration-300 w-full"
                  >
                    Get Free Quote
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1b3d5a]/80">
          <div className="container mx-auto px-4 py-6">
            <AnimatedSection animation="fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm mb-4 md:mb-0">
                  © {currentYear} SLK Trading & Design Construction Co., Ltd. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm">
                  <button 
                    onClick={() => handleLinkClick('/privacy-policy')}
                    className="text-gray-400 hover:text-[#6dbeb0] transition-colors duration-300"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => handleLinkClick('/terms-of-service')}
                    className="text-gray-400 hover:text-[#6dbeb0] transition-colors duration-300"
                  >
                    Terms of Service
                  </button>
                  {/* Sitemap link removed */}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </footer>

      {/* Quote Modal */}
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
      
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default Footer;