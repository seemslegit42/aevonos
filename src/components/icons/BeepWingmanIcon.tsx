import React from 'react';

export const BeepWingmanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="wingman-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Heart */}
    <path d="M50 35C40 20 20 25 20 45C20 65 50 85 50 85C50 85 80 65 80 45C80 25 60 20 50 35Z" fill="url(#wingman-gradient)" opacity="0.4" />
    <path d="M50 35C40 20 20 25 20 45C20 65 50 85 50 85C50 85 80 65 80 45C80 25 60 20 50 35Z" stroke="url(#wingman-gradient)" strokeWidth="3" />
    
    {/* Wings */}
    <path d="M20 45 C 5 40, 5 55, 20 60 L 25 52 Z" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--foreground) / 0.3)" />
    <path d="M80 45 C 95 40, 95 55, 80 60 L 75 52 Z" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--foreground) / 0.3)" />
  </svg>
);
