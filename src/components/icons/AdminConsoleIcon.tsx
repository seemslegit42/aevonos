
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const AdminConsoleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.9) translate(5, 5)">
      {/* Authoritative Laurel Wreath */}
      <path d="M 30 20 C 10 40, 10 60, 30 80" stroke="hsl(var(--foreground))" strokeWidth="5" fill="none" />
      <path d="M 70 20 C 90 40, 90 60, 70 80" stroke="hsl(var(--foreground))" strokeWidth="5" fill="none" />
      
      {/* Central Gear/Cog for 'Settings' */}
      <circle cx="50" cy="50" r="12" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none"/>
      <path d="M50 38 V 30 M50 62 V 70 M60.4 44 L 67 39 M39.6 56 L 33 61 M60.4 56 L 67 61 M39.6 44 L 33 39" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round"/>
    </g>
  </AppIconTemplate>
);
