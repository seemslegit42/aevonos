
import React from 'react';

export const OracleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="oracle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
      <filter id="oracle-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Central floating eye/crystal */}
    <g filter="url(#oracle-glow)">
        <path d="M30 50 C 40 35, 60 35, 70 50 C 60 65, 40 65, 30 50 Z" fill="url(#oracle-gradient)" />
        <circle cx="50" cy="50" r="5" fill="hsl(var(--foreground))" />
    </g>
    
    {/* Orbiting shards/data points */}
    <path d="M50 10 L55 15 L50 20 L45 15 Z" fill="url(#oracle-gradient)" opacity="0.8" />
    <path d="M90 50 L85 55 L80 50 L85 45 Z" fill="url(#oracle-gradient)" opacity="0.8" />
    <path d="M50 90 L45 85 L50 80 L55 85 Z" fill="url(#oracle-gradient)" opacity="0.8" />
    <path d="M10 50 L15 45 L20 50 L15 55 Z" fill="url(#oracle-gradient)" opacity="0.8" />
    
    {/* Connection lines */}
    <path d="M50 20 L50 38" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
    <path d="M80 50 L68 50" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
    <path d="M50 80 L50 62" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
    <path d="M20 50 L32 50" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
  </svg>
);
