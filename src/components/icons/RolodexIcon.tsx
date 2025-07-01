
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const RolodexIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted Rolodex shape */}
      <path d="M20 30 C 20 10, 80 10, 80 30 L80 70 C 80 90, 20 90, 20 70 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Handle/knob facets */}
      <circle cx="15" cy="50" r="5" fill="hsl(var(--foreground))" opacity="0.6" />
      <circle cx="85" cy="50" r="5" fill="hsl(var(--foreground))" opacity="0.6" />

      {/* Crystalline card divider */}
      <path d="M50 20 V80" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M25 40 L75 40" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M25 60 L75 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
    </g>
  </AppIconTemplate>
);
