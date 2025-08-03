
import React, { useState } from 'react';

const LiveChatConsultation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed z-50 bottom-8 right-8 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-96 max-w-full bg-white rounded-2xl shadow-2xl border border-gold/30 p-0 flex flex-col luxury-shadow luxury-border animate-fade-in-up" style={{ minHeight: '420px' }}>
          <div className="flex justify-between items-center px-4 py-2 border-b border-gold/10 bg-gradient-to-r from-gold/10 to-yellow-100 rounded-t-2xl">
            <span className="font-semibold text-lg text-gold">Live Chat / Consult</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gold text-2xl font-bold focus:outline-none"
              aria-label="Close Live Chat"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 luxury-font">Live Chat / Consultation</h1>
            <p className="text-lg text-gray-700 mb-6">Connect with our product experts for instant support or to book a free consultation. We’re here to help you choose the best solutions for your project.</p>
            <a
              href="mailto:info@slklaos.com?subject=Consultation Request"
              className="bg-gradient-to-r from-gold to-yellow-400 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all border-2 border-gold/40 block text-center mb-4"
            >
              Email Us for Consultation
            </a>
            <a
              href="tel:+856-20-1234-5678"
              className="bg-[#1b3d5a] text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all border-2 border-white/30 block text-center"
            >
              Call Our Hotline
            </a>
            <div className="mt-8 text-center text-gray-500 text-sm">
              (Live chat integration coming soon)
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          className="bg-gradient-to-r from-gold to-yellow-400 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 text-lg font-semibold luxury-shadow hover:scale-105 transition-all border-2 border-gold/40"
          style={{ fontFamily: 'inherit' }}
          onClick={() => setIsOpen(true)}
          aria-label="Live Chat or Book Consultation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          Live Chat / Consult
        </button>
      )}
    </div>
  );
};

export default LiveChatConsultation;
