import React from 'react';

export const ValidatorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="validator-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Document Shape */}
    <path d="M20 10 H 70 L 80 20 V 90 H 20 Z" fill="url(#validator-gradient)" opacity="0.2" />
    <path d="M20 10 H 70 V 20 H 80 M20 10 V 90 H 80 V 20" stroke="url(#validator-gradient)" strokeWidth="3" fill="none" />
    
    {/* Fingerprint */}
    <path d="M40 70 Q 50 80, 60 70" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" />
    <path d="M43 65 Q 50 73, 57 65" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" />
    <path d="M46 60 Q 50 66, 54 60" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" />
    <path d="M49 55 Q 50 59, 51 55" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" />
    <path d="M50 45 V 50" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" />
  </svg>
);
