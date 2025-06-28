
import React from 'react';

export const AuditorGeneralissimoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="auditor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(82, 20%, 40%)' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(82, 20%, 20%)' }} />
      </linearGradient>
    </defs>
    {/* Dossier File */}
    <path d="M20 10 H 80 V 90 H 20 Z" fill="hsl(var(--ledger-cream))" opacity="0.8" />
    <path d="M20 10 H 80 V 90 H 20 Z" stroke="hsl(var(--military-green))" strokeWidth="3" />
    
    {/* Stamp */}
    <circle cx="50" cy="50" r="25" fill="hsl(var(--destructive))" opacity="0.8" />
    <path d="M40 35 L60 65 M60 35 L40 65" stroke="hsl(var(--ledger-cream))" strokeWidth="5" />
    
    {/* Binder rings */}
    <rect x="15" y="20" width="5" height="10" fill="hsl(var(--military-green))" />
    <rect x="15" y="45" width="5" height="10" fill="hsl(var(--military-green))" />
    <rect x="15" y="70" width="5" height="10" fill="hsl(var(--military-green))" />
  </svg>
);
