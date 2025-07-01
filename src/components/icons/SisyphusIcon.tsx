
import React from 'react';

export const SisyphusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="sisyphus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* The Boulder */}
    <circle cx="40" cy="40" r="15" fill="url(#sisyphus-gradient)" opacity="0.4" />
    <circle cx="40" cy="40" r="15" stroke="url(#sisyphus-gradient)" strokeWidth="3" />
    
    {/* The Incline */}
    <path d="M10 90 L70 30" stroke="hsl(var(--foreground))" strokeWidth="4" />
  </svg>
);
