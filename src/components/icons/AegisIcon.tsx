
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const AegisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    {/* Central crystalline core with glow */}
    <g transform="scale(0.9) translate(5, 5)">
      <path d="M50 35 L65 42.5 V57.5 L50 65 L35 57.5 V42.5 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1"/>
    
      {/* Radiating shield facets */}
      <path d="M50 5 L95 25 V50 L65 57.5 M50 5 L5 25 V50 L35 57.5 M50 95 L5 75 V50 M50 95 L95 75 V50" stroke="hsl(var(--foreground))" strokeWidth="4" opacity="0.7" fill="none"/>
    
      {/* Connecting inner lines */}
      <path d="M50 35 L50 5 M50 65 L50 95 M35 42.5 L5 25 M65 42.5 L95 25 M35 57.5 L5 75 M65 57.5 L95 75" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
    </g>
  </AppIconTemplate>
);
