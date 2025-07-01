
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const VinDieselIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Main gauge/dial shape */}
      <path d="M20 80 A 40 40 0 1 1 80 80" stroke="hsl(var(--foreground))" strokeWidth="5" fill="none" />
      
      {/* Needle pointing to high RPM */}
      <path d="M50 78 L75 35" stroke="hsl(var(--destructive))" strokeWidth="5" />
      <circle cx="50" cy="78" r="5" fill="hsl(var(--foreground))" />

      {/* Abstracted markings on the dial */}
      <path d="M22 65 L28 60" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" />
      <path d="M30 45 L36 42" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" />
      <path d="M50 30 L50 36" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" />
      <path d="M70 45 L64 42" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" />
      <path d="M78 65 L72 60" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.7" />
    </g>
  </AppIconTemplate>
);
