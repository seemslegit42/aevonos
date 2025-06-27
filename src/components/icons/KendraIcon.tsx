import React from 'react';

export const KendraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="kendra-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--destructive))' }} />
      </linearGradient>
       <filter id="kendra-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Abstracted stiletto heel / sharp shard shape */}
    <g filter="url(#kendra-glow)" opacity="0.8">
      <path d="M50 95 L20 80 L70 10 L80 20 Z" fill="url(#kendra-gradient)" />
    </g>
    <path d="M50 95 L20 80 L70 10 L80 20 Z" stroke="url(#kendra-gradient)" strokeWidth="3" />
    
    {/* Crystalline glint / facet */}
    <path d="M65 20 L40 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
  </svg>
);
