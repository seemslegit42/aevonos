
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const AuditorGeneralissimoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Dossier File */}
      <path d="M20 10 H 80 V 90 H 20 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1"/>
      
      {/* Stamp */}
      <circle cx="50" cy="50" r="25" fill="hsl(var(--destructive))" opacity="0.8" />
      <path d="M40 35 L60 65 M60 35 L40 65" stroke="hsl(var(--ledger-cream))" strokeWidth="6" />
      
      {/* Binder rings */}
      <rect x="15" y="20" width="5" height="10" fill="hsl(var(--foreground))" opacity="0.7"/>
      <rect x="15" y="45" width="5" height="10" fill="hsl(var(--foreground))" opacity="0.7"/>
      <rect x="15" y="70" width="5" height="10" fill="hsl(var(--foreground))" opacity="0.7"/>
    </g>
  </AppIconTemplate>
);
