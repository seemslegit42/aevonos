
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const KifKrokerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* A drooping, sighing, asymmetric crystalline glyph */}
      <path d="M50 10 C 30 20, 20 40, 25 60 S 40 95, 50 90 C 60 95, 75 80, 75 60 S 70 20, 50 10 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Internal facets suggesting weariness */}
      <path d="M50 10 L50 90" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.3" />
      <path d="M35 30 C 40 40, 60 40, 65 30" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" fill="none" />
      <path d="M30 70 C 40 60, 60 60, 70 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.4" fill="none" />
    </g>
  </AppIconTemplate>
);
