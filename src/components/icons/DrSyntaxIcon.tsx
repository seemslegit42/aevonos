
import React from 'react';

export const DrSyntaxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="dr-syntax-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* A sharp, crystalline scalpel/pen glyph */}
    <path d="M80 10 L90 20 L30 80 L20 70 Z" fill="url(#dr-syntax-gradient)" opacity="0.3" />
    <path d="M80 10 L90 20 L30 80 L20 70 Z" stroke="url(#dr-syntax-gradient)" strokeWidth="3" />
    
    {/* Redaction/emphasis line */}
    <path d="M10 60 L70 90" stroke="hsl(var(--destructive))" strokeWidth="4" opacity="0.7" />

    {/* Facet line on the blade */}
    <path d="M85 15 L25 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
