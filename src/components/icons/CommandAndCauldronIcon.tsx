
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const CommandAndCauldronIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Cauldron shape */}
      <path d="M20 60 C 20 85, 80 85, 80 60 L 75 40 H 25 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <path d="M20 60 H 80" stroke="hsl(var(--foreground))" strokeWidth="3" />
      
      {/* Magical bubbles/steam */}
      <circle cx="40" cy="35" r="4" fill="hsl(var(--accent))" opacity="0.9" />
      <circle cx="50" cy="30" r="6" fill="hsl(var(--accent))" opacity="0.7" />
      <circle cx="60" cy="35" r="3" fill="hsl(var(--accent))" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
