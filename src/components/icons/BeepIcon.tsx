import React from 'react';

export const BeepIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <radialGradient id="beep-core-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.8 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0 }} />
      </radialGradient>
      <linearGradient id="beep-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    
    {/* The core with a radial glow */}
    <circle cx="50" cy="50" r="20" fill="url(#beep-core-glow)" />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
    
    {/* Orbiting Rings */}
    <ellipse cx="50" cy="50" rx="35" ry="15" stroke="url(#beep-ring-gradient)" strokeWidth="2" transform="rotate(-30 50 50)" />
    <ellipse cx="50" cy="50" rx="45" ry="10" stroke="url(#beep-ring-gradient)" strokeWidth="1.5" opacity="0.7" transform="rotate(20 50 50)" />
    <ellipse cx="50" cy="50" rx="25" ry="25" stroke="url(#beep-ring-gradient)" strokeWidth="1" opacity="0.5" transform="rotate(60 50 50)" />
  </svg>
);
