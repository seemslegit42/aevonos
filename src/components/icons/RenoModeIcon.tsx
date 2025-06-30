
import React from 'react';

export const RenoModeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="reno-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Spray Bottle Body */}
    <path d="M35 85 V 45 C 35 35, 40 30, 50 30 C 60 30, 65 35, 65 45 V 85 Z" stroke="url(#reno-gradient)" strokeWidth="3" fill="url(#reno-gradient)" fillOpacity="0.2" />
    
    {/* Nozzle and Trigger - forming a heart */}
    <path d="M50 30 C 40 20, 30 30, 50 45 C 70 30, 60 20, 50 30 Z" fill="hsl(var(--destructive))" />
    <path d="M50 30 C 40 20, 30 30, 50 45" stroke="hsl(var(--destructive))" strokeWidth="2.5" fill="none" />
    <path d="M50 30 C 70 30, 60 20, 50 30" stroke="hsl(var(--destructive))" strokeWidth="2.5" fill="none" />

    {/* Abstracted Soapy Bubbles */}
    <circle cx="25" cy="70" r="4" fill="hsl(var(--foreground))" opacity="0.4" />
    <circle cx="20" cy="55" r="6" fill="hsl(var(--foreground))" opacity="0.6" />
    <circle cx="80" cy="60" r="5" fill="hsl(var(--foreground))" opacity="0.5" />
  </svg>
);
