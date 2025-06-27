
import React from 'react';

export const DrSyntaxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="dr-syntax-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* A sharper, more aggressive crystalline scalpel/pen glyph */}
    <path d="M85 5 L95 15 L25 85 L15 75 Z" fill="url(#dr-syntax-gradient)" opacity="0.3" />
    <path d="M85 5 L95 15 L25 85 L15 75 Z" stroke="url(#dr-syntax-gradient)" strokeWidth="3" />
    
    {/* A harsh redacting slash, more integrated */}
    <path d="M5 60 L75 95" stroke="hsl(var(--destructive))" strokeWidth="5" opacity="0.8" />

    {/* Multiple facet lines on the blade for a sharper glint */}
    <path d="M90 10 L20 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M75 5 L35 45" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
  </svg>
);
