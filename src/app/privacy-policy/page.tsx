'use client';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AnimatedSection from '../../components/AnimatedSection';
import { Shield, Lock, Eye, FileText, CheckCircle, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        <AnimatedSection animation="fade-up" className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
          </p>
        </AnimatedSection>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
              </div>
              <p className="text-gray-700 mb-4">
                SLK Trading & Design Construction Co., Ltd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
              <p className="text-gray-700">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Fill out forms on our website</li>
                <li>Request a quote or consultation</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us via email, phone, or other communication channels</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="text-gray-700">
                The personal information we may collect includes your name, email address, phone number, company name, project details, and any other information you choose to provide.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process your requests for quotes and consultations</li>
                <li>Communicate with you about our services and projects</li>
                <li>Send you newsletters and marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist us in operating our website and conducting our business</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> info@slklaos.la</p>
                <p className="text-gray-700 mb-2"><strong>Phone:</strong> +856 21 773 737</p>
                <p className="text-gray-700"><strong>Address:</strong> Vientiane, Laos</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
