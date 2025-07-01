
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const VandelayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstract architectural blueprint / data flow glyph */}
      <path d="M20 80 L20 20 L50 5 L80 20 L80 80 L50 95 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Import/Export arrows */}
      <path d="M40 40 L60 60 M60 40 L40 60" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" />
      
      {/* Architectural lines */}
      <path d="M20 20 L80 20" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M20 80 L80 80" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M50 5 L50 30" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
      <path d="M50 95 L50 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" />
    </g>
  </AppIconTemplate>
);
