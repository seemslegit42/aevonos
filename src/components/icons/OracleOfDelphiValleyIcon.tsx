
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const OracleOfDelphiValleyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted Temple Shape */}
      <path d="M20 85 L20 40 L50 20 L80 40 L80 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" opacity="0.7" />
      <path d="M15 85 H 85" stroke="hsl(var(--foreground))" strokeWidth="4" />
      
      {/* Vapor/Cloud */}
      <path d="M30 75 Q 40 65, 50 75 T 70 75" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" opacity="0.5" />

      {/* Floating Unicorn Glyph (Simplified) */}
      <path d="M45 50 C 40 40, 50 35, 55 40 L 60 60" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" opacity="0.9" />
      <path d="M53 40 L57 38" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" opacity="0.9" />
    </g>
  </AppIconTemplate>
);
