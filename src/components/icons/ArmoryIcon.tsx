
import React from 'react';

export const ArmoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="armory-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Shield Background */}
    <path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" fill="url(#armory-gradient)" opacity="0.2" />
    <path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" stroke="url(#armory-gradient)" strokeWidth="3" />
    
    {/* Crossed crystalline tools/swords */}
    <path d="M30 30 L70 70" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round" />
    <path d="M70 30 L30 70" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round" />

    {/* Glints on tools */}
    <path d="M35 35 L40 40" stroke="hsl(var(--primary))" strokeWidth="2" />
    <path d="M65 35 L60 40" stroke="hsl(var(--primary))" strokeWidth="2" />
  </svg>
);
