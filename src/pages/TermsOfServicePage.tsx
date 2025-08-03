import React from 'react';
import Navbar from '../app/Navbar';
import Footer from '../app/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { FileText, AlertCircle, Scale, Clock, Shield, Mail } from 'lucide-react';

const TermsOfServicePage = () => {
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
                We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Limitations of Liability</h2>
              </div>
              <p className="text-gray-700 mb-4">
                In no event shall SLK Trading & Design Construction Co., Ltd, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Your access to or use of or inability to access or use the service</li>
                <li>Any conduct or content of any third party on the service</li>
                <li>Any content obtained from the service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Warranty and Guarantees</h2>
              </div>
              <p className="text-gray-700 mb-4">
                SLK Trading & Design Construction Co., Ltd provides warranties and guarantees for our construction services and materials as specified in individual project contracts and agreements. These warranties are subject to proper use, maintenance, and care of the installed materials and constructed facilities.
              </p>
              <p className="text-gray-700">
                All materials supplied by us come with manufacturers' warranties as applicable. Specific warranty terms and conditions will be provided at the time of purchase or project completion.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Governing Law</h2>
              </div>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed and construed in accordance with the laws of Lao People's Democratic Republic, without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-700">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">SLK Trading & Design Construction Co., Ltd</p>
                <p className="text-gray-700">Vientiane Capital, Laos</p>
                <p className="text-gray-700">Email: info@slklaos.la</p>
                <p className="text-gray-700">Phone: +856 21 773 737</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
        
        <AnimatedSection animation="fade-up" delay={200} className="text-center mb-12">
          <p className="text-gray-600">
            Last updated: June 22, 2025
          </p>
        </AnimatedSection>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;