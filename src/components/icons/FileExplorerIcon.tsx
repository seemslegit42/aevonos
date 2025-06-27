
import React from 'react';

export const FileExplorerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="file-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* A crystalline, faceted folder shape */}
    <path d="M10 25 L40 25 L50 15 L90 15 L90 80 L10 80 Z" fill="url(#file-gradient)" opacity="0.3" />
    <path d="M10 25 L40 25 L50 15 L90 15 L90 80 L10 80 Z" stroke="url(#file-gradient)" strokeWidth="3" />

    {/* Internal Facet Lines */}
    <path d="M10 80 L40 25" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
    <path d="M50 15 L90 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.2" />
  </svg>
);
