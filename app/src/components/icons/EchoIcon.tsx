
import React from 'react';

export const EchoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="echo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Asymmetric concentric crystalline forms */}
    <path d="M50 10 L90 35 V70 L50 90 L10 70 V35 Z" stroke="url(#echo-gradient)" strokeWidth="3" opacity="0.9" />
    <path d="M50 20 L80 40 V65 L50 80 L20 65 V40 Z" stroke="url(#echo-gradient)" strokeWidth="2.5" opacity="0.6" />
    <path d="M50 30 L70 45 V60 L50 70 L30 60 V45 Z" stroke="url(#echo-gradient)" strokeWidth="2" opacity="0.3" />

    {/* Radiating lines suggesting memory recall/links */}
    <path d="M50 30 L50 10" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M70 45 L90 35" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M70 60 L90 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M30 45 L10 35" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M30 60 L10 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M50 70 L50 90" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />

    <circle cx="50" cy="50" r="4" fill="url(#echo-gradient)" />
  </svg>
);
