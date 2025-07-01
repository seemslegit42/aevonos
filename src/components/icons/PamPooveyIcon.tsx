
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const PamPooveyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* A fractured, chaotic crystalline glyph representing HR */}
      <path d="M50 10 L85 35 L75 85 L25 85 L15 35 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* The fracture */}
      <path d="M40 40 L60 60 L55 65 L70 80" stroke="hsl(var(--destructive))" strokeWidth="5" opacity="0.9" />

      {/* Internal facets */}
      <path d="M50 10 L50 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
      <path d="M15 35 L75 85" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.3" />
      <path d="M85 35 L25 85" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.3" />
    </g>
  </AppIconTemplate>
);
