import React from 'react';

export const CrystalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="crystal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#20B2AA' }} />
        <stop offset="100%" style={{ stopColor: '#3EB991' }} />
      </linearGradient>
    </defs>
    <path d="M50 10 L70 30 L60 50 L80 70 L50 90 L20 70 L40 50 L30 30 Z" fill="url(#crystal-gradient)" opacity="0.3" />
    <path d="M50 10 L70 30 L60 50 L80 70 L50 90 L20 70 L40 50 L30 30 Z" stroke="url(#crystal-gradient)" strokeWidth="3" />
    <path d="M50 10 L50 90 M20 70 L80 70 M30 30 L70 30 M40 50 L60 50" stroke="#F0F8FF" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
