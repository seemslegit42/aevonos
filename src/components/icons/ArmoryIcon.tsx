
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const ArmoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Shield Background */}
      <path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      {/* Crossed crystalline tools/swords */}
      <path d="M30 30 L70 70" stroke="hsl(var(--foreground))" strokeWidth="5" strokeLinecap="round" />
      <path d="M70 30 L30 70" stroke="hsl(var(--foreground))" strokeWidth="5" strokeLinecap="round" />
    </g>
  </AppIconTemplate>
);
