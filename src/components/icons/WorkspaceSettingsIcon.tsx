
import React from 'react';

export const WorkspaceSettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="ws-settings-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    
    {/* Abstracted workspace/layout shape */}
    <rect x="20" y="20" width="60" height="40" rx="5" stroke="url(#ws-settings-gradient)" strokeWidth="3" fill="none" />
    <path d="M20 35 H 80" stroke="url(#ws-settings-gradient)" strokeWidth="1.5" opacity="0.7" />
    <path d="M45 35 V 60" stroke="url(#ws-settings-gradient)" strokeWidth="1.5" opacity="0.7" />

    {/* Gear shape overlay */}
    <g transform="translate(5, 5)">
        <circle cx="65" cy="65" r="12" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="hsl(var(--background))" fillOpacity="0.7" opacity="0.9" />
        <circle cx="65" cy="65" r="5" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" opacity="0.9" />
        <path d="M65 57 V 53 M65 77 V 73 M75 65 H 79 M55 65 H 51 M72.5 72.5 L 75.5 75.5 M57.5 57.5 L 54.5 54.5 M72.5 57.5 L 75.5 54.5 M57.5 72.5 L 54.5 75.5" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
    </g>
  </svg>
);
    
