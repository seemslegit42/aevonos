import React from 'react';

export const SterileishIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="sterile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--pale-green))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted biohazard/petri dish shape */}
    <path d="M50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10 Z" fill="url(#sterile-gradient)" opacity="0.2" />
    <path d="M50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10 Z" stroke="url(#sterile-gradient)" strokeWidth="3" fill="none" />
    
    {/* Internal biohazard-esque facets */}
    <path d="M50 50 m -20, 0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0" stroke="url(#sterile-gradient)" strokeWidth="2" opacity="0.8" fill="none" />
    <path d="M50 30 A 25 25 0 0 0 25 50" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M50 70 A 25 25 0 0 0 75 50" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M32 32 A 25 25 0 0 0 50 20" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
     <path d="M68 68 A 25 25 0 0 0 50 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
