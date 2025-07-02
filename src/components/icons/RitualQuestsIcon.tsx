
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const RitualQuestsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstract scroll shape */}
      <path d="M20 15 C 20 5, 80 5, 80 15 V 85 C 80 95, 20 95, 20 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <path d="M20 15 H 80" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
      <path d="M20 85 H 80" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />

      {/* Quest marker/star in the center */}
      <path d="M50 35 L55 48 L70 50 L55 52 L50 65 L45 52 L30 50 L45 48 Z" fill="hsl(var(--gilded-accent))" />
    </g>
  </AppIconTemplate>
);
