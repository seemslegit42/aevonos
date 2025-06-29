
import React from 'react';

export const UserSettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="user-settings-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    
    {/* User shape */}
    <circle cx="50" cy="35" r="15" stroke="url(#user-settings-gradient)" strokeWidth="3" fill="none" />
    <path d="M25 85 C 25 65, 75 65, 75 85 Z" stroke="url(#user-settings-gradient)" strokeWidth="3" fill="none" />
    
    {/* Gear shape overlay */}
    <g transform="translate(5, 5)">
      <circle cx="50" cy="65" r="8" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" opacity="0.8" />
      <path d="M50 54 V 49 M50 76 V 71 M59.5 65 H 64.5 M40.5 65 H 35.5 M57.5 72.5 L 61 76 M42.5 57.5 L 39 54 M57.5 57.5 L 61 54 M42.5 72.5 L 39 76" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    </g>
  </svg>
);
