
import React from 'react';

export const FileExplorerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="archive-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Central scroll/document */}
    <path d="M30 15 H 70 V 85 H 30 Z" fill="url(#archive-gradient)" opacity="0.1" />
    <path d="M30 15 C 30 5, 70 5, 70 15 V 85 C 70 95, 30 95, 30 85 Z" stroke="url(#archive-gradient)" strokeWidth="3" fill="none" />
    
    {/* Floating Data Crystals */}
    <path d="M15 30 L25 25 L35 30 L25 35 Z" fill="hsl(var(--accent))" opacity="0.8" />
    <path d="M75 20 L85 15 L95 20 L85 25 Z" fill="hsl(var(--primary))" opacity="0.7" />
    <path d="M80 75 L90 70 L90 80 Z" fill="hsl(var(--roman-aqua))" opacity="0.9" />
    <path d="M10 70 L20 65 L20 75 Z" fill="hsl(var(--gilded-accent))" opacity="0.8" />
  </svg>
);
