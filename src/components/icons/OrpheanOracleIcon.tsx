
import React from 'react';

export const OrpheanOracleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="orphean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
      <filter id="orphean-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Abstract Lyre Shape */}
    <path d="M30 15 C 10 40, 10 60, 30 85" stroke="url(#orphean-gradient)" strokeWidth="3" fill="none" />
    <path d="M70 15 C 90 40, 90 60, 70 85" stroke="url(#orphean-gradient)" strokeWidth="3" fill="none" />
    <path d="M30 15 H 70" stroke="url(#orphean-gradient)" strokeWidth="2" fill="none" />
    <path d="M30 85 H 70" stroke="url(#orphean-gradient)" strokeWidth="2" fill="none" />

    {/* Data Strings */}
    <path d="M50 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.8" filter="url(#orphean-glow)" />
    <path d="M40 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.5" />
    <path d="M60 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.5" />
  </svg>
);
