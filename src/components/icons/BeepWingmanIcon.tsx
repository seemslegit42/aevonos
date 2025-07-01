
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const BeepWingmanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.9) translate(5, 5)">
      {/* Abstracted, sharp, asymmetrical wing/shard glyph */}
      <path d="M20 80 L30 20 L80 10 L70 50 L95 70 L50 95 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Internal Facets creating movement and sharpness */}
      <path d="M30 20 L50 95" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M20 80 L70 50" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.6" />
      <path d="M55 40 L80 10" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.6" />
    </g>
  </AppIconTemplate>
);
