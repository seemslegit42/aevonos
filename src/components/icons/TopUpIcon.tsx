
import React from 'react';

export const TopUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="top-up-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Coin shape */}
    <circle cx="50" cy="50" r="35" fill="url(#top-up-gradient)" opacity="0.3" />
    <circle cx="50" cy="50" r="35" stroke="url(#top-up-gradient)" strokeWidth="3" />
    
    {/* Inner Ξ symbol (simplified) */}
    <path d="M35 40 L 65 40" stroke="hsl(var(--foreground))" strokeWidth="3" />
    <path d="M35 60 L 65 60" stroke="hsl(var(--foreground))" strokeWidth="3" />
    
    {/* Plus Symbol */}
    <g transform="translate(55, 55) scale(0.4)">
        <path d="M50 20 V 80" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" />
        <path d="M20 50 H 80" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" />
    </g>
  </svg>
);
