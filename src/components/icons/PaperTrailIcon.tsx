
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const PaperTrailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted file/document shape */}
      <path d="M25 10 L75 10 L75 90 L25 90 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Crystalline magnifying glass */}
      <circle cx="50" cy="45" r="20" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" />
      <path d="M65 60 L80 75" stroke="hsl(var(--foreground))" strokeWidth="4" />

      {/* Facets inside the glass suggesting analysis */}
      <path d="M40 45 L60 45" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
      <path d="M50 35 L50 55" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
    </g>
  </AppIconTemplate>
);
