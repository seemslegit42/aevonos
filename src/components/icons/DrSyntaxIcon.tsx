import React from 'react';

export const DrSyntaxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="dr-syntax-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    <path d="M50 10 L60 20 L40 80 L30 90 L50 10 Z" fill="url(#dr-syntax-gradient)" opacity="0.3" />
    <path d="M50 10 L60 20 L40 80 L30 90 L50 10 Z" stroke="url(#dr-syntax-gradient)" strokeWidth="3" />
    <path d="M65 25 L85 45 L55 75 L35 55 Z" fill="url(#dr-syntax-gradient)" opacity="0.5" />
    <path d="M65 25 L85 45 L55 75 L35 55 Z" stroke="url(#dr-syntax-gradient)" strokeWidth="2" />
  </svg>
);
