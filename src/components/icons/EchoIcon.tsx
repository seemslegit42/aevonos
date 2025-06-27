
import React from 'react';

export const EchoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="echo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Concentric Hexagons */}
    <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" stroke="url(#echo-gradient)" strokeWidth="3" opacity="0.9" />
    <path d="M50 20 L77 35 V65 L50 80 L23 65 V35 Z" stroke="url(#echo-gradient)" strokeWidth="2.5" opacity="0.6" />
    <path d="M50 30 L69 40 V60 L50 70 L31 60 V40 Z" stroke="url(#echo-gradient)" strokeWidth="2" opacity="0.3" />

    {/* Central Point */}
    <circle cx="50" cy="50" r="3" fill="url(#echo-gradient)" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
  </svg>
);
