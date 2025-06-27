import React from 'react';

export const WinstonWolfeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="wolfe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Stylized 'W' glyph, representing a sharp, clean solution. */}
    <path d="M15 20 L35 80 L50 60 L65 80 L85 20 L70 20 L60 50 L50 20 L40 50 L30 20 Z" fill="url(#wolfe-gradient)" opacity="0.3" />
    <path d="M15 20 L35 80 L50 60 L65 80 L85 20 L70 20 L60 50 L50 20 L40 50 L30 20 Z" stroke="url(#wolfe-gradient)" strokeWidth="3" fill="none" />

    {/* Internal facets for precision */}
    <path d="M50 20 L50 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M35 80 L65 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
  </svg>
);
