
import React from 'react';

export const OracleOfDelphiValleyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="oracle-valley-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
      <filter id="oracle-valley-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Abstracted Temple Shape */}
    <path d="M20 85 L20 40 L50 20 L80 40 L80 85 Z" stroke="url(#oracle-valley-gradient)" strokeWidth="3" fill="none" opacity="0.7" />
    <path d="M15 85 H 85" stroke="url(#oracle-valley-gradient)" strokeWidth="3" />
    
    {/* Vapor/Cloud */}
    <path d="M30 75 Q 40 65, 50 75 T 70 75" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" opacity="0.5" filter="url(#oracle-valley-glow)" />

    {/* Floating Unicorn Glyph (Simplified) */}
    <path d="M45 50 C 40 40, 50 35, 55 40 L 60 60" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" opacity="0.9" />
    <path d="M53 40 L57 38" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" opacity="0.9" />
  </svg>
);
