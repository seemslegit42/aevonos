
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const FileExplorerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Central scroll/document */}
      <path d="M30 15 C 30 5, 70 5, 70 15 V 85 C 70 95, 30 95, 30 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Floating Data Crystals */}
      <path d="M15 30 L25 25 L35 30 L25 35 Z" fill="hsl(var(--accent))" opacity="0.8" />
      <path d="M75 20 L85 15 L95 20 L85 25 Z" fill="hsl(var(--primary))" opacity="0.7" />
      <path d="M80 75 L90 70 L90 80 Z" fill="hsl(var(--roman-aqua))" opacity="0.9" />
      <path d="M10 70 L20 65 L20 75 Z" fill="hsl(var(--gilded-accent))" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
