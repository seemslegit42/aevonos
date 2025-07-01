
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const OracleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Central floating eye/crystal */}
      <path d="M30 50 C 40 35, 60 35, 70 50 C 60 65, 40 65, 30 50 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <circle cx="50" cy="50" r="5" fill="hsl(var(--accent))" />
    
      {/* Orbiting shards/data points */}
      <path d="M50 10 L55 15 L50 20 L45 15 Z" fill="hsl(var(--foreground))" opacity="0.8" />
      <path d="M90 50 L85 55 L80 50 L85 45 Z" fill="hsl(var(--foreground))" opacity="0.8" />
      <path d="M50 90 L45 85 L50 80 L55 85 Z" fill="hsl(var(--foreground))" opacity="0.8" />
      <path d="M10 50 L15 45 L20 50 L15 55 Z" fill="hsl(var(--foreground))" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
