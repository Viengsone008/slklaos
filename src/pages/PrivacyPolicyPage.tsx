import React from 'react';
import Navbar from '../app/Navbar';
import Footer from '../app/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { Shield, Lock, Eye, FileText, CheckCircle, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
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
                The personal information we collect may include your name, email address, phone number, company name, and any other information you choose to provide.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We may use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide, operate, and maintain our website and services</li>
                <li>Improve, personalize, and expand our website and services</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you about our products, services, and promotions</li>
                <li>Process transactions and send related information</li>
                <li>Find and prevent fraud</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Disclosure of Your Information</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>With service providers who perform services for us</li>
                <li>To comply with legal obligations</li>
                <li>To protect and defend our rights and property</li>
                <li>With your consent or at your direction</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>The right to access personal information we hold about you</li>
                <li>The right to request correction of inaccurate information</li>
                <li>The right to request deletion of your information</li>
                <li>The right to opt-out of marketing communications</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Security of Your Information</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We use administrative, technical, and physical security measures to protect your personal information. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us at:
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

export default PrivacyPolicyPage;