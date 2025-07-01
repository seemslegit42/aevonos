
import React from 'react';

export const AppIconTemplate = ({ children, ...props }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aevon-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
      <filter id="aevon-icon-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* The "Ancient Roman Glass" Frame - slightly irregular hexagon */}
    <g filter="url(#aevon-icon-glow)" opacity="0.8">
        <path d="M50 5 L95 27.5 L90 75 L50 95 L10 75 L5 27.5 Z" fill="url(#aevon-icon-gradient)" opacity="0.2" />
        <path d="M50 5 L95 27.5 L90 75 L50 95 L10 75 L5 27.5 Z" stroke="url(#aevon-icon-gradient)" strokeWidth="2.5" />
    </g>

    {/* Content glyph goes here */}
    <g>
        {children}
    </g>
  </svg>
);
