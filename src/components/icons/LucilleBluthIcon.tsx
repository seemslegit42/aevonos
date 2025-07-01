
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const LucilleBluthIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted Martini Glass with a Winking Olive */}
      <path d="M20 30 L80 30 L50 65 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" />
      <path d="M50 65 L50 85" stroke="hsl(var(--foreground))" strokeWidth="4" />
      <path d="M35 85 L65 85" stroke="hsl(var(--foreground))" strokeWidth="4" />
      
      {/* The Olive / Eye */}
      <circle cx="50" cy="45" r="8" fill="hsl(var(--destructive))" />
      
      {/* The Wink - a sharp crystalline facet */}
      <path d="M65 20 L85 40" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
