import React from 'react';

export const HowardsSidekickIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="howard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--sidekick-gold))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--sidekick-brown))' }} />
      </linearGradient>
    </defs>
    {/* Gear Shape */}
    <path d="M 50,15 A 35,35 0 0,0 50,85 A 35,35 0 0,0 50,15 Z M 50,25 A 25,25 0 0,1 50,75 A 25,25 0 0,1 50,25 Z" fill="url(#howard-gradient)" opacity="0.2" />
    <path d="M 50,10 L 50,20 M 50,80 L 50,90 M 18,32 L 28,38 M 72,62 L 82,68 M 18,68 L 28,62 M 72,38 L 82,32 M 32,18 L 38,28 M 62,72 L 68,82 M 32,82 L 38,72 M 62,28 L 68,18" stroke="url(#howard-gradient)" strokeWidth="4" strokeLinecap="round" />
    
    {/* Paw Print */}
    <g fill="hsl(var(--foreground))" opacity="0.9">
      <circle cx="50" cy="48" r="8" />
      <circle cx="41" cy="62" r="5" />
      <circle cx="59" cy="62" r="5" />
      <circle cx="35" cy="50" r="4" />
      <circle cx="65" cy="50" r="4" />
    </g>
  </svg>
);
