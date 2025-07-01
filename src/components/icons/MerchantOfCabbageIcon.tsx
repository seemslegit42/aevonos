
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const MerchantOfCabbageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Cabbage Leaves */}
      <path d="M50 80 Q 20 80, 25 50 T 50 20 T 75 50 Q 80 80, 50 80 Z" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(120, 60%, 70%)" fillOpacity="0.2" />
      <path d="M50 20 C 30 30, 25 50, 30 70" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      <path d="M50 20 C 70 30, 75 50, 70 70" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      
      {/* Roman Coin / Ξ Symbol */}
      <circle cx="50" cy="50" r="10" fill="hsl(var(--gilded-accent))" />
      <text x="50" y="55" textAnchor="middle" fontSize="12" fill="hsl(var(--background))" fontWeight="bold">Ξ</text>
    </g>
  </AppIconTemplate>
);
