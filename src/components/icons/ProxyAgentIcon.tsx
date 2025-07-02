
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const ProxyAgentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Sigil Card shape */}
      <rect x="20" y="30" width="60" height="40" rx="5" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Ξ Symbol */}
      <text x="50" y="55" textAnchor="middle" fontSize="20" fill="hsl(var(--gilded-accent))" fontWeight="bold">Ξ</text>
      
      {/* Transmutation Arrow */}
      <path d="M50 25 V 10 M45 15 L 50 10 L 55 15" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" opacity="0.8" />
    </g>
  </AppIconTemplate>
);
