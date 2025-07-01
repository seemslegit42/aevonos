
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const WorkspaceSettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Abstracted workspace/layout shape */}
      <rect x="20" y="20" width="60" height="40" rx="5" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      <path d="M20 35 H 80" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
      <path d="M45 35 V 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />

      {/* Gear shape overlay */}
      <g transform="translate(5, 5)">
          <circle cx="65" cy="65" r="12" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--background))" fillOpacity="0.7" opacity="0.9" />
          <circle cx="65" cy="65" r="5" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" opacity="0.9" />
          <path d="M65 57 V 53 M65 77 V 73 M75 65 H 79 M55 65 H 51 M72.5 72.5 L 75.5 75.5 M57.5 57.5 L 54.5 54.5 M72.5 57.5 L 75.5 54.5 M57.5 72.5 L 54.5 75.5" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
      </g>
    </g>
  </AppIconTemplate>
);
