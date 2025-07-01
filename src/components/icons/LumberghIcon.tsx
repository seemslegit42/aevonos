
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const LumberghIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted Red Stapler shape */}
      <path d="M20 70 L30 40 L70 40 L80 70 L20 70 Z" stroke="hsl(var(--destructive))" strokeWidth="4" fill="hsl(var(--destructive))" fillOpacity="0.2" />
      <path d="M30 40 L20 20 L80 20 L70 40" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" />
      <path d="M50 40 L50 20" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M20 70 L80 70" fill="hsl(var(--foreground))" fillOpacity="0.2" />
      <path d="M20 70 L30 85 L70 85 L80 70" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" fill="none" />
    </g>
  </AppIconTemplate>
);
