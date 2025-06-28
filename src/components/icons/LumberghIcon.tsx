
import React from 'react';

export const LumberghIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="lumbergh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--destructive))', stopOpacity: 0.8 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--destructive))', stopOpacity: 0.5 }} />
      </linearGradient>
    </defs>
    {/* Abstracted Red Stapler shape */}
    <path d="M20 70 L30 40 L70 40 L80 70 L20 70 Z" fill="url(#lumbergh-gradient)" opacity="0.3" />
    <path d="M20 70 L30 40 L70 40 L80 70" stroke="hsl(var(--destructive))" strokeWidth="3" fill="none" />
    <path d="M30 40 L20 20 L80 20 L70 40" stroke="hsl(var(--destructive))" strokeWidth="3" fill="none" />
    <path d="M50 40 L50 20" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M20 70 L80 70" fill="hsl(var(--foreground))" opacity="0.2" />
    <path d="M20 70 L30 85 L70 85 L80 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" fill="none" />
  </svg>
);
