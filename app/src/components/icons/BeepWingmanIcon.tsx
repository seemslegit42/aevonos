
import React from 'react';

export const BeepWingmanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="wingman-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted, sharp, asymmetrical wing/shard glyph */}
    <path d="M20 80 L30 20 L80 10 L70 50 L95 70 L50 95 Z" fill="url(#wingman-gradient)" opacity="0.3" />
    <path d="M20 80 L30 20 L80 10 L70 50 L95 70 L50 95 Z" stroke="url(#wingman-gradient)" strokeWidth="3" />
    
    {/* Internal Facets creating movement and sharpness */}
    <path d="M30 20 L50 95" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M20 80 L70 50" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M55 40 L80 10" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
  </svg>
);
