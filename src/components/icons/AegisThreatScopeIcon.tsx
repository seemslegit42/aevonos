
import React from 'react';

export const AegisThreatScopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aegis-scope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
       <filter id="aegis-scope-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Central shield core */}
    <path d="M50 40 L60 45 V55 L50 60 L40 55 V45 Z" fill="url(#aegis-scope-gradient)" />
    
    {/* Concentric radar circles */}
    <circle cx="50" cy="50" r="25" stroke="url(#aegis-scope-gradient)" strokeWidth="2" opacity="0.8" />
    <circle cx="50" cy="50" r="35" stroke="url(#aegis-scope-gradient)" strokeWidth="1.5" opacity="0.5" />
    <circle cx="50" cy="50" r="45" stroke="url(#aegis-scope-gradient)" strokeWidth="1" opacity="0.3" />

    {/* Radar sweep/glint */}
    <path d="M50 50 L85 25" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" filter="url(#aegis-scope-glow)" />

     {/* Detected threat blips */}
    <circle cx="75" cy="40" r="3" fill="hsl(var(--destructive))" />
    <circle cx="30" cy="30" r="2" fill="hsl(var(--destructive))" opacity="0.7"/>
  </svg>
);
