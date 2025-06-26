import React from 'react';

export const LoomIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="loom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#20B2AA' }} />
        <stop offset="100%" style={{ stopColor: '#3EB991' }} />
      </linearGradient>
    </defs>
    <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="url(#loom-gradient)" opacity="0.3" />
    <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" stroke="url(#loom-gradient)" strokeWidth="3" />
    <path d="M50 5 L5 27.5 L50 50 Z" stroke="#F0F8FF" strokeWidth="1.5" opacity="0.7" />
    <path d="M50 5 L95 27.5 L50 50 Z" stroke="#F0F8FF" strokeWidth="1.5" opacity="0.7" />
    <path d="M50 95 L5 72.5 L50 50 Z" stroke="#F0F8FF" strokeWidth="1.5" opacity="0.7" />
    <path d="M50 95 L95 72.5 L50 50 Z" stroke="#F0F8FF" strokeWidth="1.5" opacity="0.7" />
    <circle cx="50" cy="50" r="10" fill="url(#loom-gradient)" stroke="#F0F8FF" strokeWidth="1.5" />
  </svg>
);
