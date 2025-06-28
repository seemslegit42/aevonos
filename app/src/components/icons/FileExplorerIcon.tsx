
import React from 'react';

export const FileExplorerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="file-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted, faceted data shard/folder glyph */}
    <path d="M15 20 L45 20 L55 10 L85 10 L85 80 L15 80 Z" fill="url(#file-gradient)" opacity="0.3" />
    <path d="M15 20 L45 20 L55 10 L85 10 L85 80 L15 80 Z" stroke="url(#file-gradient)" strokeWidth="3" />

    {/* Internal Facet suggesting stacked files/data */}
    <path d="M25 30 L75 30" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M25 45 L75 45" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
    <path d="M25 60 L75 60" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.3" />

    <path d="M50 20 L25 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.2" />
  </svg>
);
