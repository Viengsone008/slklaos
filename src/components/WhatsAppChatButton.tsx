
"use client";
import React from 'react';


interface WhatsAppChatButtonProps {
  className?: string;
}

const WhatsAppChatButton: React.FC<WhatsAppChatButtonProps> = ({ className }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const halfScreen = window.innerHeight / 2;
      const footer = document.querySelector('footer');
      let footerInView = false;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        // If any part of the footer is visible in the viewport
        footerInView = rect.top < window.innerHeight && rect.bottom > 0;
      }
      setShow(scrollY > halfScreen);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;
  return (
    <a
      href="https://wa.me/856307780888"
      target="_blank"
      rel="noopener"
      className={`fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full shadow-lg p-2 md:p-4 flex items-center hover:scale-110 transition ${className || ''}`}
      aria-label="Chat on WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-7 md:h-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.72 11.06a6.5 6.5 0 10-2.2 2.2l2.48.83a1 1 0 001.26-1.26l-.83-2.48z" /></svg>
      <span className="text-xs md:text-base">Chat/WhatsApp</span>
    </a>
  );
};

export default WhatsAppChatButton;
