
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const UserSettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* User shape */}
      <circle cx="50" cy="35" r="15" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <path d="M25 85 C 25 65, 75 65, 75 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Gear shape overlay */}
      <g transform="translate(5, 5)">
        <circle cx="50" cy="65" r="8" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M50 54 V 49 M50 76 V 71 M59.5 65 H 64.5 M40.5 65 H 35.5 M57.5 72.5 L 61 76 M42.5 57.5 L 39 54 M57.5 57.5 L 61 54 M42.5 72.5 L 39 76" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
      </g>
    </g>
  </AppIconTemplate>
);
