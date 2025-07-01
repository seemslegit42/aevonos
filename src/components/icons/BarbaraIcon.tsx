
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const BarbaraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Sharp, clean file folder */}
      <path d="M20 15 L45 15 L50 20 L80 20 L80 85 L20 85 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* A single, judgmental, glowing red-tape line */}
      <path d="M15 50 L85 50" stroke="hsl(var(--destructive))" strokeWidth="4" />

      {/* The 'halo' of compliance */}
      <circle cx="50" cy="12" r="8" stroke="hsl(var(--faded-cream))" strokeWidth="2.5" fill="none" />
    </g>
  </AppIconTemplate>
);
