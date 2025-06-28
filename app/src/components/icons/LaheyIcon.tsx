
import React from 'react';

export const LaheyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="lahey-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstract surveillance camera / liquor bottle */}
    <path d="M50 15 C 40 15, 35 20, 35 30 V 85 H 65 V 30 C 65 20, 60 15, 50 15 Z" fill="url(#lahey-gradient)" opacity="0.3" />
    <path d="M50 15 C 40 15, 35 20, 35 30 V 85 H 65 V 30 C 65 20, 60 15, 50 15 Z" stroke="url(#lahey-gradient)" strokeWidth="3" fill="none" />
    
    {/* The Lens / "Eye" */}
    <circle cx="50" cy="55" r="15" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
    <circle cx="50" cy="55" r="5" fill="hsl(var(--destructive))" />

    {/* Bottle cap / top of camera */}
    <rect x="45" y="10" width="10" height="5" fill="url(#lahey-gradient)" />
  </svg>
);
