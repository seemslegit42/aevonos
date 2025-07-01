
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Crystalline container/screen */}
      <path d="M10 15 L20 5 L80 5 L90 15 V85 L80 95 L20 95 L10 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Crystalline ">" prompt character */}
      <path d="M25 45 L40 55 L25 65" stroke="hsl(var(--foreground))" strokeWidth="5" opacity="0.9" fill="none" />
      {/* Crystalline "_" cursor character */}
      <path d="M45 65 L65 65" stroke="hsl(var(--foreground))" strokeWidth="5" opacity="0.9" fill="none" />
    </g>
  </AppIconTemplate>
);
