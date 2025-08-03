'use client';
import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import AnimatedSection from '../../components/AnimatedSection';
import { FileText, AlertCircle, Scale, Clock, Shield, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        <AnimatedSection animation="fade-up" className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </AnimatedSection>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Agreement to Terms</h2>
              </div>
              <p className="text-gray-700 mb-4">
                These Terms of Service constitute a legally binding agreement made between you and SLK Trading & Design Construction Co., Ltd ("we," "us," or "our"), concerning your access to and use of our website and services.
              </p>
              <p className="text-gray-700">
                By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access our services.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Scale className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Services</h2>
              </div>
              <p className="text-gray-700 mb-4">
                SLK Trading & Design Construction Co., Ltd provides construction services, waterproofing materials, and flooring materials in Laos. Our services include but are not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Design and construction services for residential, commercial, and industrial projects</li>
                <li>Supply and installation of waterproofing materials</li>
                <li>Supply and installation of flooring materials</li>
                <li>Project consultation and management</li>
                <li>Maintenance and repair services</li>
              </ul>
              <p className="text-gray-700">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time without notice.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
              </div>
              <p className="text-gray-700 mb-4">
                By using our services, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Use our services for lawful purposes only</li>
                <li>Respect intellectual property rights</li>
                <li>Not interfere with the proper functioning of our website</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Project Terms</h2>
              </div>
              <p className="text-gray-700 mb-4">
                For construction and material supply projects:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>All quotes are valid for 30 days unless otherwise specified</li>
                <li>Project timelines are estimates and may vary due to unforeseen circumstances</li>
                <li>Payment terms will be specified in individual contracts</li>
                <li>Changes to project scope may result in additional costs</li>
                <li>We provide warranties as specified in individual contracts</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
              </div>
              <p className="text-gray-700 mb-4">
                To the fullest extent permitted by law, SLK Trading & Design Construction Co., Ltd shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
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
