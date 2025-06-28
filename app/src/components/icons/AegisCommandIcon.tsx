
import React from 'react';

export const AegisCommandIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="aegis-cmd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Shield background */}
    <path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" fill="url(#aegis-cmd-gradient)" opacity="0.3" />
    <path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" stroke="url(#aegis-cmd-gradient)" strokeWidth="3" />
    
    {/* Gear Icon */}
    <path d="M50 40 a 10 10 0 1 0 0.001 0" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none"/>
    <path d="M50 35 V 28 M50 65 V 72 M62 40 H 69 M38 40 H 31 M60 60 L 65 65 M40 40 L 35 35 M60 40 L 65 35 M40 60 L 35 65" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
