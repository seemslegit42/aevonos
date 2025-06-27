import React from 'react';

export const PamPooveyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="pam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* File Folder */}
    <path d="M10 20 H45 L55 10 H90 V80 H10 Z" fill="url(#pam-gradient)" opacity="0.3" />
    <path d="M10 20 H45 L55 10 H90 V80 H10 Z" stroke="url(#pam-gradient)" strokeWidth="3" />
    
    {/* Martini Glass */}
    <g transform="translate(50, 55) scale(0.4)">
        <path d="M -30 -20 L 0 -50 L 30 -20 Z" stroke="hsl(var(--foreground))" strokeWidth="6" fill="hsl(var(--foreground) / 0.5)" />
        <line x1="0" y1="-20" x2="0" y2="30" stroke="hsl(var(--foreground))" strokeWidth="6" />
        <line x1="-20" y1="30" x2="20" y2="30" stroke="hsl(var(--foreground))" strokeWidth="6" />
    </g>
  </svg>
);
