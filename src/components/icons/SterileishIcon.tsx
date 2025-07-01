
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const SterileishIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted biohazard/petri dish shape */}
      <path d="M50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Internal biohazard-esque facets */}
      <path d="M50 50 m -20, 0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" fill="none" />
      <path d="M50 30 A 25 25 0 0 0 25 50" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
      <path d="M50 70 A 25 25 0 0 0 75 50" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
      <path d="M32 32 A 25 25 0 0 0 50 20" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
      <path d="M68 68 A 25 25 0 0 0 50 80" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
    </g>
  </AppIconTemplate>
);
