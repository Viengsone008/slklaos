import React from 'react';

const LuxuryDivider: React.FC<{ animated?: boolean }> = ({ animated }) => (
  <div
    className={`h-1 w-24 rounded-full mb-4 ${animated ? 'luxury-divider-animated' : ''}`}
    style={{
      background: 'linear-gradient(90deg, #bfa76a 0%, #e5e2d6 100%)',
      opacity: 0.85,
      boxShadow: '0 2px 12px 0 rgba(191,167,106,0.18)',
    }}
  />
);

export default LuxuryDivider;
