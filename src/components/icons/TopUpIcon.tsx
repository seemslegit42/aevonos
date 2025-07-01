
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const TopUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Coin shape */}
      <circle cx="50" cy="50" r="35" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1"/>
      
      {/* Inner Ξ symbol (simplified) */}
      <path d="M35 40 L 65 40" stroke="hsl(var(--foreground))" strokeWidth="4" />
      <path d="M35 60 L 65 60" stroke="hsl(var(--foreground))" strokeWidth="4" />
      
      {/* Plus Symbol */}
      <g transform="translate(55, 55) scale(0.4)">
          <path d="M50 20 V 80" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round" />
          <path d="M20 50 H 80" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round" />
      </g>
    </g>
  </AppIconTemplate>
);
