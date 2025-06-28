
import React from 'react';

export const AegisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aegis-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
       <filter id="aegis-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Central crystalline core with glow */}
    <g filter="url(#aegis-glow)">
      <path d="M50 35 L65 42.5 V57.5 L50 65 L35 57.5 V42.5 Z" fill="url(#aegis-gradient)" />
    </g>
    
    {/* Radiating shield facets */}
    <path d="M50 5 L95 25 V50 L65 57.5 M50 5 L5 25 V50 L35 57.5 M50 95 L5 75 V50 M50 95 L95 75 V50" stroke="url(#aegis-gradient)" strokeWidth="3" opacity="0.7" fill="none"/>
    
    {/* Connecting inner lines */}
    <path d="M50 35 L50 5 M50 65 L50 95 M35 42.5 L5 25 M65 42.5 L95 25 M35 57.5 L5 75 M65 57.5 L95 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
  </svg>
);
