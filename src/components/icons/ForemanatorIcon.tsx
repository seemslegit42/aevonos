
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const ForemanatorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted Hard Hat Shape */}
      <path d="M50 15 A 35 35 0 0 1 85 50 V 60 H 15 V 50 A 35 35 0 0 1 50 15 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <path d="M10 60 H 90 V 70 H 10 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Crystalline facets / megaphone lines */}
      <path d="M50 15 L 50 45" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
      <path d="M30 40 L 70 40" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
    </g>
  </AppIconTemplate>
);
