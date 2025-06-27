
import React from 'react';

export const PamPooveyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="pam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* A crystalline glyph representing a dolphin puppet. Abstractly. */}
    <path d="M20 70 Q 30 40 50 50 T 80 30 L 70 60 Q 60 80 40 85 Z" fill="url(#pam-gradient)" opacity="0.3" />
    <path d="M20 70 Q 30 40 50 50 T 80 30 L 70 60 Q 60 80 40 85 Z" stroke="url(#pam-gradient)" strokeWidth="3" />

    {/* Facet lines */}
    <path d="M50 50 L 70 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M35 60 L 50 50" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
