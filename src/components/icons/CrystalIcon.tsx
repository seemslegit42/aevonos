
import React from 'react';

export const CrystalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="crystal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
      <filter id="crystal-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#crystal-glow)">
        <path d="M50 10 L70 30 L60 50 L80 70 L50 90 L20 70 L40 50 L30 30 Z" fill="url(#crystal-gradient)" opacity="0.3" />
        <path d="M50 10 L70 30 L60 50 L80 70 L50 90 L20 70 L40 50 L30 30 Z" stroke="url(#crystal-gradient)" strokeWidth="3" />
    </g>
    <path d="M50 10 L50 90 M20 70 L80 70 M30 30 L70 30 M40 50 L60 50" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
