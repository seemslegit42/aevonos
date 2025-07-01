
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const IntegrationNexusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Central Node */}
      <circle cx="50" cy="50" r="12" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1"/>
      
      {/* Radiating connection lines */}
      <path d="M50 38 L50 15" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
      <path d="M50 62 L50 85" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
      <path d="M38 50 L15 50" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
      <path d="M62 50 L85 50" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />

      {/* Outer nodes */}
      <circle cx="50" cy="15" r="5" fill="hsl(var(--accent))" />
      <circle cx="50" cy="85" r="5" fill="hsl(var(--accent))" />
      <circle cx="15" cy="50" r="5" fill="hsl(var(--accent))" />
      <circle cx="85" cy="50" r="5" fill="hsl(var(--accent))" />
    </g>
  </AppIconTemplate>
);
