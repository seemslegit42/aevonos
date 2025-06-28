
import React from 'react';

export const VandelayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="vandelay-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstract architectural blueprint / data flow glyph */}
    <path d="M20 80 L20 20 L50 5 L80 20 L80 80 L50 95 Z" fill="url(#vandelay-gradient)" opacity="0.3" />
    <path d="M20 80 L20 20 L50 5 L80 20 L80 80 L50 95 Z" stroke="url(#vandelay-gradient)" strokeWidth="3" fill="none" />
    
    {/* Import/Export arrows */}
    <path d="M40 40 L60 60 M60 40 L40 60" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.7" />
    
    {/* Architectural lines */}
    <path d="M20 20 L80 20" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M20 80 L80 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M50 5 L50 30" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M50 95 L50 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
  </svg>
);
