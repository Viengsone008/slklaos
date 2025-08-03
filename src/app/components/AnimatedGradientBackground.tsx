import React from 'react';

const AnimatedGradientBackground: React.FC = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 z-0 pointer-events-none animate-gradient-move"
    style={{
      background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 50%, #bfa76a 100%)',
      opacity: 0.25,
      filter: 'blur(32px)',
      transition: 'background 1s',
    }}
  />
);

export default AnimatedGradientBackground;
