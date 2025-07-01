
import React from 'react';
import { AppIconTemplate } from './AppIconTemplate';

export const FileExplorerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <AppIconTemplate {...props}>
    <g transform="scale(0.8) translate(12, 12)">
      {/* Central scroll/document */}
      <path d="M30 15 C 30 5, 70 5, 70 15 V 85 C 70 95, 30 95, 30 85 Z" stroke="hsl(var(--foreground))" strokeWidth="4" fill="hsl(var(--foreground))" fillOpacity="0.1" />
      
      {/* Abstracted Quill Pen */}
      <g transform="rotate(30 70 70)">
        <path d="M60 20 Q 80 50, 60 80 L 55 75" stroke="hsl(var(--foreground))" strokeWidth="4" fill="none"/>
        <path d="M60 20 L58 25 L63 27" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" />
      </g>
      
      {/* Floating Data Crystal */}
      <path d="M20 70 L30 65 L40 70 L30 75 Z" fill="hsl(var(--accent))" opacity="0.9" />
    </g>
  </AppIconTemplate>
);
