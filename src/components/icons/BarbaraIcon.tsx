
import React from 'react';

export const BarbaraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="barbara-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--steely-lavender))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--polished-chrome))' }} />
      </linearGradient>
       <filter id="barbara-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Sharp, clean file folder */}
    <path d="M20 15 L45 15 L50 20 L80 20 L80 85 L20 85 Z" fill="url(#barbara-gradient)" opacity="0.2" />
    <path d="M20 15 L45 15 L50 20 L80 20 L80 85 L20 85 Z" stroke="url(#barbara-gradient)" strokeWidth="2.5" />
    
    {/* A single, judgmental, glowing red-tape line */}
    <path d="M15 50 L85 50" stroke="hsl(var(--destructive))" strokeWidth="3" filter="url(#barbara-glow)" />

    {/* The 'halo' of compliance */}
    <circle cx="50" cy="12" r="8" stroke="hsl(var(--faded-cream))" strokeWidth="1.5" fill="none" />
  </svg>
);
