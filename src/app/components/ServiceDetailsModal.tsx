"use client";
import React from "react";
import { X, CheckCircle } from "lucide-react";

interface ServiceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  service: {
    title: string;
    description: string;
    features: string[];
    image: string;
    testimonials?: { name: string; text: string; avatar?: string }[];
    gallery?: string[];
    brochureUrl?: string;
    faqs?: { q: string; a: string }[];
  } | null;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ open, onClose, service }) => {
  if (!open || !service) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#3d9392] transition-colors text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
        <div className="flex flex-col gap-4">
          <img src={service.image} alt={service.title} className="w-full h-48 object-cover rounded-xl mb-2" />
          <h2 className="text-2xl font-bold text-[#3d9392] mb-2">{service.title}</h2>
          <p className="text-gray-700 mb-2">{service.description}</p>
          <div>
            <h3 className="font-semibold text-[#6dbeb0] mb-1">Key Features</h3>
            <ul className="space-y-2 mb-2">
              {service.features.map((f, i) => (
                <li key={i} className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> {f}
                </li>
              ))}
            </ul>
          </div>
          {service.gallery && service.gallery.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#6dbeb0] mb-1">Gallery</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {service.gallery.map((img, i) => (
                  <img key={i} src={img} alt="Gallery" className="w-28 h-20 object-cover rounded-lg border border-[#e5f1f1]" />
                ))}
              </div>
            </div>
          )}
          {service.testimonials && service.testimonials.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#6dbeb0] mb-1">Testimonials</h3>
              <div className="space-y-2">
                {service.testimonials.map((t, i) => (
                  <div key={i} className="bg-[#f7fafc] rounded-lg p-3 flex items-center gap-3">
                    {t.avatar && <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full" />}
                    <div>
                      <div className="font-semibold text-sm text-[#3d9392]">{t.name}</div>
                      <div className="text-xs text-gray-600">{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {service.brochureUrl && (
            <a href={service.brochureUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[#3d9392] underline font-medium">Download Brochure</a>
          )}
          {service.faqs && service.faqs.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold text-[#6dbeb0] mb-1">FAQs</h3>
              <div className="space-y-2">
                {service.faqs.map((faq, i) => (
                  <details key={i} className="bg-[#f7fafc] rounded-lg p-2">
                    <summary className="font-medium cursor-pointer text-[#3d9392]">{faq.q}</summary>
                    <div className="text-xs text-gray-600 mt-1">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
