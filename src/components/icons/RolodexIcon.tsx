import React from 'react';

export const RolodexIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="rolodex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted Rolodex shape */}
    <path d="M20 30 C20 10, 80 10, 80 30 L80 70 C80 90, 20 90, 20 70 Z" fill="url(#rolodex-gradient)" opacity="0.3" />
    <path d="M20 30 C20 10, 80 10, 80 30 L80 70 C80 90, 20 90, 20 70 Z" stroke="url(#rolodex-gradient)" strokeWidth="3" fill="none" />
    
    {/* Handle/knob facets */}
    <circle cx="15" cy="50" r="5" fill="hsl(var(--foreground))" opacity="0.6" />
    <circle cx="85" cy="50" r="5" fill="hsl(var(--foreground))" opacity="0.6" />

    {/* Crystalline card divider */}
    <path d="M50 20 V80" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M25 40 L75 40" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M25 60 L75 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
  </svg>
);
