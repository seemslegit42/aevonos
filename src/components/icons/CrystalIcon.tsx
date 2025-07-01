
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const CrystalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
        <path d="M50 10 L70 30 L60 50 L80 70 L50 90 L20 70 L40 50 L30 30 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1"/>
        <path d="M50 10 L50 90 M20 70 L80 70 M30 30 L70 30 M40 50 L60 50" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
    </g>
  </AppIconTemplate>
);
