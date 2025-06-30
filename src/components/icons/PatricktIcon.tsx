import React from 'react';

export const PatricktIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="patrickt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--destructive))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(0, 100%, 30%)' }} />
      </linearGradient>
    </defs>
    {/* Broken Heart Shape */}
    <path d="M50 35 C 30 10, 10 25, 25 50 L50 75 L75 50 C 90 25, 70 10, 50 35 Z" fill="url(#patrickt-gradient)" opacity="0.3" />
    <path d="M50 35 C 30 10, 10 25, 25 50 L50 75 L75 50 C 90 25, 70 10, 50 35 Z" stroke="url(#patrickt-gradient)" strokeWidth="3" />
    
    {/* The Crack */}
    <path d="M50 35 L50 75 L60 60" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.8" />
  </svg>
);
