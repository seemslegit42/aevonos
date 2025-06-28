
import React from 'react';

export const LucilleBluthIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="lucille-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted Martini Glass with a Winking Olive */}
    <path d="M20 30 L80 30 L50 65 Z" stroke="url(#lucille-gradient)" strokeWidth="3" fill="none" />
    <path d="M50 65 L50 85" stroke="url(#lucille-gradient)" strokeWidth="3" />
    <path d="M35 85 L65 85" stroke="url(#lucille-gradient)" strokeWidth="3" />
    
    {/* The Olive / Eye */}
    <circle cx="50" cy="45" r="8" fill="hsl(var(--destructive))" />
    
    {/* The Wink - a sharp crystalline facet */}
    <path d="M65 20 L85 40" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.8" />
  </svg>
);
