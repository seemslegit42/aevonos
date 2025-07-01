
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const PatricktIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Broken Heart Shape */}
      <path d="M50 35 C 30 10, 10 25, 25 50 L50 75 L75 50 C 90 25, 70 10, 50 35 Z" stroke="hsl(var(--destructive))" strokeWidth="4" fill="hsl(var(--destructive))" fillOpacity="0.2" />
      
      {/* The Crack */}
      <path d="M50 35 L50 75 L60 60" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
