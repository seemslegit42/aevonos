
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const StonksIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Diamond */}
      <path d="M50 10 L80 40 L50 90 L20 40 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <path d="M20 40 L80 40" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <path d="M50 10 L35 40 L50 90 L65 40 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.6" />

      {/* Rocket Exhaust */}
      <path d="M40 85 C 45 100, 55 100, 60 85" stroke="hsl(var(--destructive))" strokeWidth="5" fill="none" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
