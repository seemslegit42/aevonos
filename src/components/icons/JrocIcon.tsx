
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const JrocIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstract Boombox Body */}
      <path d="M15 30 L85 30 L90 40 V70 L85 80 H15 L10 70 V40 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Speakers (Crystals) */}
      <circle cx="35" cy="55" r="15" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <circle cx="65" cy="55" r="15" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      
      {/* Handle / "Bling" Chain */}
      <path d="M35 30 C 35 10, 65 10, 65 30" stroke="hsl(var(--foreground))" strokeWidth="5" fill="none"/>
    </g>
  </AppIconTemplate>
);
