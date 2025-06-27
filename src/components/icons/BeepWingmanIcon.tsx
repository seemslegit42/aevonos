
import React from 'react';

export const BeepWingmanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="wingman-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Crystalline, asymmetric heart/wing shape */}
    <path d="M50 20 L70 15 L90 40 L50 90 L10 40 L30 15 Z" fill="url(#wingman-gradient)" opacity="0.3" />
    <path d="M50 20 L70 15 L90 40 L50 90 L10 40 L30 15 Z" stroke="url(#wingman-gradient)" strokeWidth="3" />
    
    {/* Internal Facets */}
    <path d="M50 20 L50 90" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
    <path d="M30 15 L50 45 L10 40" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M70 15 L50 45 L90 40" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
