
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const BeepIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
     {/* The core with a radial glow */}
    <circle cx="50" cy="50" r="20" fill="url(#aevon-icon-gradient)" opacity="0.4" />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2.5">
        <animate
            attributeName="r"
            values="12; 13; 12"
            dur="4s"
            repeatCount="indefinite" />
    </circle>
  </AppIconTemplate>
);
