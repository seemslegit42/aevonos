
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const UsageMonitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted gauge/dial shape */}
      <path d="M20 80 A 40 40 0 1 1 80 80" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" opacity="0.7" />
      
      {/* Needle pointing somewhere in the middle */}
      <path d="M50 80 L 35 45" stroke="hsl(var(--foreground))" strokeWidth="4" />
      <circle cx="50" cy="80" r="4" fill="hsl(var(--foreground))" />

      {/* Facet lines suggesting markings */}
      <path d="M22 65 L28 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
      <path d="M50 40 L50 46" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
      <path d="M78 65 L72 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    </g>
  </AppIconTemplate>
);
