
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const KendraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Glitched Heel Shape */}
      <path d="M60 80 L40 70 L70 30 L80 40 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Star Glint */}
      <path d="M35 35 l 2 -5 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z" fill="hsl(var(--kendra-fuchsia))" />
    </g>
  </AppIconTemplate>
);
