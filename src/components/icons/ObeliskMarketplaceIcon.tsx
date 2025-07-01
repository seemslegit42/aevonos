
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const ObeliskMarketplaceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Obelisk Shape */}
      <path d="M45 10 L55 10 L65 90 L35 90 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      {/* Transmutation Star */}
      <path d="M50 30 l 5 10 l -10 0 l 5 -10 z" fill="hsl(var(--gilded-accent))" />
      <path d="M50 50 l 5 -10 l -10 0 l 5 10 z" fill="hsl(var(--gilded-accent))" />
      
      {/* Orbiting element to suggest a marketplace/galaxy */}
      <ellipse cx="50" cy="50" rx="35" ry="15" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" opacity="0.5" transform="rotate(-20 50 50)" />
    </g>
  </AppIconTemplate>
);
