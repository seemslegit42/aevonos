
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const AegisThreatScopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    {/* Central shield core */}
    <path d="M50 40 L60 45 V55 L50 60 L40 55 V45 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--foreground))" fillOpacity="0.1" />
    
    {/* Concentric radar circles */}
    <circle cx="50" cy="50" r="25" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.8" fill="none"/>
    <circle cx="50" cy="50" r="35" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" fill="none"/>

    {/* Radar sweep/glint */}
    <path d="M50 50 L85 25" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.9" />

     {/* Detected threat blips */}
    <circle cx="75" cy="40" r="3" fill="hsl(var(--destructive))" />
    <circle cx="30" cy="30" r="2" fill="hsl(var(--destructive))" opacity="0.7"/>
  </AppIconTemplate>
);
