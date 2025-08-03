'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AnimatedSection from '../../components/AnimatedSection';
import { Home, Building2, Package, FileText, Users, Phone, Mail, Shield, Layers } from 'lucide-react';

export default function SitemapPage() {
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
        { name: 'Educational Projects', path: '/projects' }
      ]
    },
    {
      title: 'Company',
      icon: Users,
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Our Team', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'News & Updates', path: '/news' }
      ]
    },
    {
      title: 'Support',
      icon: Phone,
      links: [
        { name: 'Contact Us', path: '/contact' },
        { name: 'Get a Quote', path: '/contact' },
        { name: 'Customer Support', path: '/contact' }
      ]
    },
    {
      title: 'Legal',
      icon: Shield,
      links: [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms-of-service' },
        { name: 'Sitemap', path: '/sitemap' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        <AnimatedSection animation="fade-up" className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Site Map</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Navigate through all the pages and sections of our website easily.
          </p>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section, index) => (
            <AnimatedSection key={section.title} animation="fade-up" delay={index * 100}>
              <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
                <div className="flex items-center mb-4">
                  <section.icon className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.path}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200 block py-1"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-up" delay={700} className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you find the information or services you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
      
      <Footer />
    </div>
  );
}
