import React from 'react';

export const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="terminal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#20B2AA' }} />
        <stop offset="100%" style={{ stopColor: '#3EB991' }} />
      </linearGradient>
    </defs>
    <path d="M10 10 H90 V90 H10 Z" fill="url(#terminal-gradient)" opacity="0.3" rx="5" />
    <path d="M10 10 H90 V90 H10 Z" stroke="url(#terminal-gradient)" strokeWidth="3" rx="5" />
    <path d="M25 35 L45 50 L25 65" stroke="#F0F8FF" strokeWidth="3" opacity="0.9" fill="none" />
    <path d="M50 65 H75" stroke="#F0F8FF" strokeWidth="3" opacity="0.9" fill="none" />
  </svg>
);
