import React from 'react';

export const AegisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aegis-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    <path d="M50 5 L95 20 V50 C95 80 50 95 50 95 C50 95 5 80 5 50 V20 Z" fill="url(#aegis-gradient)" opacity="0.3" />
    <path d="M50 5 L95 20 V50 C95 80 50 95 50 95 C50 95 5 80 5 50 V20 Z" stroke="url(#aegis-gradient)" strokeWidth="3" />
    <path d="M50 25 L75 40 V60 L50 75 L25 60 V40 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.8" />
  </svg>
);
