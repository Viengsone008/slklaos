import React from 'react';
import Navbar from '../app/Navbar';
import Footer from '../app/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Package, FileText, Users, Phone, Mail, Shield, Layers } from 'lucide-react';

const SitemapPage = () => {
  const navigate = useNavigate();

  const sitemapSections = [
    {
      title: 'Main Pages',
      icon: Home,
      links: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Products', path: '/products' },
        { name: 'Projects', path: '/projects' },
        { name: 'About Us', path: '/about' },
        { name: 'News', path: '/news' },
        { name: 'Contact', path: '/contact' }
      ]
    },
    {
      title: 'Services',
      icon: Building2,
      links: [
        { name: 'Design & Construction', path: '/services' },
        { name: 'Waterproofing Solutions', path: '/services' },
        { name: 'Flooring Materials & Installation', path: '/services' }
      ]
    },
    {
      title: 'Products',
      icon: Package,
      links: [
        { name: 'Waterproofing Materials', path: '/products/waterproofing' },
        { name: 'Flooring Materials', path: '/products/flooring' }
      ]
    },
    {
      title: 'Projects',
      icon: FileText,
      links: [
        { name: 'Commercial Projects', path: '/projects' },
        { name: 'Residential Projects', path: '/projects' },
        { name: 'Industrial Projects', path: '/projects' },
        { name: 'Hospitality Projects', path: '/projects' },
        { name: 'Educational Projects', path: '/projects' },
        { name: 'Healthcare Projects', path: '/projects' }
      ]
    },
    {
      title: 'About',
      icon: Users,
      links: [
        { name: 'Company History', path: '/about' },
        { name: 'Our Team', path: '/about' },
        { name: 'Values & Mission', path: '/about' },
        { name: 'Certifications', path: '/about' }
      ]
    },
    {
      title: 'Legal',
      icon: Shield,
      links: [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms-of-service' }
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        <AnimatedSection animation="fade-up" className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Sitemap</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find all pages and resources available on our website
          </p>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {sitemapSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <AnimatedSection 
                key={index} 
                animation="fade-up" 
                delay={index * 100}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg mr-3">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button 
                        onClick={() => handleNavigate(link.path)}
                        className="text-blue-600 hover:text-orange-500 hover:underline transition-colors flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            );
          })}
        </div>
        
        <AnimatedSection animation="fade-up" delay={300} className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Phone className="w-6 h-6 text-blue-600 mr-3" />
            Contact Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Main Office</h3>
              <p className="text-gray-700">Vientiane Capital, Laos</p>
              <p className="text-gray-700">Nongbone Road</p>
              <p className="text-gray-700">+856 20 5551 5551</p>
              <p className="text-gray-700">info@slklaos.la</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-700">Monday - Friday: 8:00 AM - 5:00 PM</p>
              <p className="text-gray-700">Saturday: 8:00 AM - 12:00 PM</p>
              <p className="text-gray-700">Sunday: Closed</p>
              <p className="text-gray-700">Emergency Support: 24/7</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => handleNavigate('/contact')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </button>
          </div>
        </AnimatedSection>
        
        <AnimatedSection animation="fade-up" delay={400} className="text-center">
          <p className="text-gray-600">
            © 2025 SLK Trading & Design Construction Co., Ltd. All rights reserved.
          </p>
        </AnimatedSection>
      </div>
      
      <Footer />
    </div>
  );
};

export default SitemapPage;