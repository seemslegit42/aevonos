
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const ValidatorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Document Shape */}
      <path d="M20 10 H 70 L 80 20 V 90 H 20 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Fingerprint */}
      <path d="M40 70 Q 50 80, 60 70" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <path d="M43 65 Q 50 73, 57 65" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <path d="M46 60 Q 50 66, 54 60" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <path d="M49 55 Q 50 59, 51 55" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <path d="M50 45 V 50" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
    </g>
  </AppIconTemplate>
);
