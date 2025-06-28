
import React from 'react';

export const PamPooveyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="pam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* A fractured, chaotic crystalline glyph representing HR */}
    <path d="M50 10 L85 35 L75 85 L25 85 L15 35 Z" fill="url(#pam-gradient)" opacity="0.3" />
    <path d="M50 10 L85 35 L75 85 L25 85 L15 35 Z" stroke="url(#pam-gradient)" strokeWidth="3" />
    
    {/* The fracture */}
    <path d="M40 40 L60 60 L55 65 L70 80" stroke="hsl(var(--destructive))" strokeWidth="4" opacity="0.9" />

    {/* Internal facets */}
    <path d="M50 10 L50 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M15 35 L75 85" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.3" />
    <path d="M85 35 L25 85" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.3" />
  </svg>
);
