
import React from 'react';

export const AegisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aegis-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Main Crystalline Shield Shape */}
    <path d="M50 5 L95 25 V55 C95 85 50 95 50 95 C50 95 5 85 5 55 V25 Z" fill="url(#aegis-gradient)" opacity="0.3" />
    <path d="M50 5 L95 25 V55 C95 85 50 95 50 95 C50 95 5 85 5 55 V25 Z" stroke="url(#aegis-gradient)" strokeWidth="3" />
    
    {/* Inner Crystal Facet (Hexagon) */}
    <path d="M50 20 L75 35 V65 L50 80 L25 65 V35 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.8" />
    
    {/* Radiating Facet Lines */}
    <path d="M50 20 L50 5 M25 35 L5 25 M75 35 L95 25 M25 65 L5 55 M75 65 L95 55" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
