
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const SisyphusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* The Boulder */}
      <circle cx="40" cy="40" r="15" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      {/* The Incline */}
      <path d="M10 90 L70 30" stroke="hsl(var(--foreground))" strokeWidth="5" />
    </g>
  </AppIconTemplate>
);
