
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const InfidelityRadarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Broken heart in the center */}
      <path d="M50 35 C 30 10, 10 25, 25 50 L50 75 L75 50 C 90 25, 70 10, 50 35 Z" stroke="hsl(var(--destructive))" strokeWidth="4" fill="hsl(var(--destructive))" fillOpacity="0.2" />
      <path d="M50 35 L50 65 L60 55" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.8" />
      
      {/* Radar rings */}
       <circle cx="50" cy="50" r="35" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.3" fill="none" strokeDasharray="4 4"/>
       <circle cx="50" cy="50" r="45" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.2" fill="none"/>
    </g>
  </AppIconTemplate>
);
