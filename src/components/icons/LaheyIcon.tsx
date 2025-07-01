
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const LaheyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted surveillance camera / liquor bottle */}
      <path d="M50 15 C 40 15, 35 20, 35 30 V 85 H 65 V 30 C 65 20, 60 15, 50 15 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* The Lens / "Eye" */}
      <circle cx="50" cy="55" r="15" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <circle cx="50" cy="55" r="5" fill="hsl(var(--destructive))" />

      {/* Bottle cap / top of camera */}
      <rect x="45" y="10" width="10" height="5" fill="hsl(var(--foreground))" />
    </g>
  </AppIconTemplate>
);
