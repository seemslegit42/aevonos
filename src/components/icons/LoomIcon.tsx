
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const LoomIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
    <path d="M50 5 L5 27.5 L50 50 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M50 5 L95 27.5 L50 50 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M50 95 L5 72.5 L50 50 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M50 95 L95 72.5 L50 50 Z" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <circle cx="50" cy="50" r="10" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
  </AppIconTemplate>
);
