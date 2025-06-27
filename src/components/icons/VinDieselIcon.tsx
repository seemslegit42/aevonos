import React from 'react';

export const VinDieselIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="vin-diesel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Main gauge/dial shape */}
    <path d="M20 80 A 40 40 0 1 1 80 80" fill="url(#vin-diesel-gradient)" stroke="url(#vin-diesel-gradient)" strokeWidth="3" opacity="0.3" />
    <path d="M20 80 A 40 40 0 1 1 80 80" stroke="url(#vin-diesel-gradient)" strokeWidth="4" fill="none" />
    
    {/* Needle pointing to high RPM */}
    <path d="M50 78 L75 35" stroke="hsl(var(--destructive))" strokeWidth="4" />
    <circle cx="50" cy="78" r="5" fill="hsl(var(--foreground))" />

    {/* Abstracted markings on the dial */}
    <path d="M22 65 L28 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M30 45 L36 42" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M50 30 L50 36" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M70 45 L64 42" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M78 65 L72 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
  </svg>
);
