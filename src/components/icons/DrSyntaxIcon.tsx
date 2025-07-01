
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const DrSyntaxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* A sharper, more aggressive crystalline scalpel/pen glyph */}
      <path d="M85 5 L95 15 L25 85 L15 75 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* A harsh redacting slash, more integrated */}
      <path d="M5 60 L75 95" stroke="hsl(var(--destructive))" strokeWidth="6" opacity="0.8" />

      {/* Multiple facet lines on the blade for a sharper glint */}
      <path d="M90 10 L20 80" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.6" />
    </g>
  </AppIconTemplate>
);
