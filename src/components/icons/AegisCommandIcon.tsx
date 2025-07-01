
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const AegisCommandIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Shield background */}
      <path d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      {/* Gear Icon */}
      <path d="M50 40 a 10 10 0 1 0 0.001 0" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none"/>
      <path d="M50 35 V 28 M50 65 V 72 M62 40 H 69 M38 40 H 31 M60 60 L 65 65 M40 40 L 35 35 M60 40 L 65 35 M40 60 L 35 65" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round"/>
    </g>
  </AppIconTemplate>
);
