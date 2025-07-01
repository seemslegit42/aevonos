
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const RenoModeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Spray Bottle Body */}
      <path d="M35 85 V 45 C 35 35, 40 30, 50 30 C 60 30, 65 35, 65 45 V 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Nozzle and Trigger - forming a heart */}
      <path d="M50 30 C 40 20, 30 30, 50 45 C 70 30, 60 20, 50 30 Z" fill="hsl(var(--destructive))" />
      
      {/* Abstracted Soapy Bubbles */}
      <circle cx="25" cy="70" r="4" fill="hsl(var(--foreground))" opacity="0.4" />
      <circle cx="20" cy="55" r="6" fill="hsl(var(--foreground))" opacity="0.6" />
      <circle cx="80" cy="60" r="5" fill="hsl(var(--foreground))" opacity="0.5" />
    </g>
  </AppIconTemplate>
);
