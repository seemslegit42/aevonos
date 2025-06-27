
import React from 'react';

export const StonksIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="stonks-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Diamond */}
    <path d="M50 10 L80 40 L50 90 L20 40 Z" stroke="url(#stonks-gradient)" strokeWidth="3" fill="url(#stonks-gradient)" fillOpacity="0.2" />
    <path d="M20 40 L80 40" stroke="url(#stonks-gradient)" strokeWidth="2" />
    <path d="M50 10 L35 40 L50 90 L65 40 Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />

    {/* Rocket Exhaust */}
    <path d="M40 85 C 45 100, 55 100, 60 85" stroke="hsl(var(--destructive))" strokeWidth="4" fill="none" opacity="0.8" />
  </svg>
);
