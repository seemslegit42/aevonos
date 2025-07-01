
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const OrpheanOracleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstract Lyre Shape */}
      <path d="M30 15 C 10 40, 10 60, 30 85" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" />
      <path d="M70 15 C 90 40, 90 60, 70 85" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" />
      <path d="M30 15 H 70" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <path d="M30 85 H 70" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />

      {/* Data Strings */}
      <path d="M50 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.8" />
      <path d="M40 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
      <path d="M60 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    </g>
  </AppIconTemplate>
);
