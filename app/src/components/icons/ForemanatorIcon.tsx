
import React from 'react';

export const ForemanatorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="foremanator-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(51 100% 50%)' }} /> {/* Gilded Accent as Yellow */}
        <stop offset="100%" style={{ stopColor: 'hsl(var(--foreground))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted Hard Hat Shape */}
    <path d="M50 15 A 35 35 0 0 1 85 50 V 60 H 15 V 50 A 35 35 0 0 1 50 15 Z" fill="url(#foremanator-gradient)" opacity="0.3" />
    <path d="M50 15 A 35 35 0 0 1 85 50 V 60 H 15 V 50 A 35 35 0 0 1 50 15 Z" stroke="url(#foremanator-gradient)" strokeWidth="3" fill="none" />
    <path d="M10 60 H 90 V 70 H 10 Z" fill="url(#foremanator-gradient)" stroke="url(#foremanator-gradient)" strokeWidth="3" />
    
    {/* Crystalline facets / megaphone lines */}
    <path d="M50 15 L 50 45" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M30 40 L 70 40" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
