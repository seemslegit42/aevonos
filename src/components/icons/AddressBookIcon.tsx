
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const AddressBookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.7) translate(21, 21)">
      {/* Book Shape */}
      <path d="M75 10 H 25 C 20 10, 15 15, 15 20 V 80 C 15 85, 20 90, 25 90 H 75 C 80 90, 85 85, 85 80 V 20 C 85 15, 80 10, 75 10 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      {/* Spine */}
      <path d="M25 10 V 90" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.6" />
      {/* Abstracted Address Lines */}
      <path d="M40 30 L 70 30" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.7" />
      <path d="M40 45 L 70 45" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.7" />
      <path d="M40 60 L 70 60" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.7" />
    </g>
  </AppIconTemplate>
);
