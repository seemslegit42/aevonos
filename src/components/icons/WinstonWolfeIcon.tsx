
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const WinstonWolfeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Stylized 'W' glyph, representing a sharp, clean solution. */}
      <path d="M15 20 L35 80 L50 60 L65 80 L85 20 L70 20 L60 50 L50 20 L40 50 L30 20 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />

      {/* Internal facets for precision */}
      <path d="M50 20 L50 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.6" />
      <path d="M35 80 L65 80" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
    </g>
  </AppIconTemplate>
);
