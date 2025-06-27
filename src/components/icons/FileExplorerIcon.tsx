import React from 'react';

export const FileExplorerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="file-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    <path d="M10 25 H40 L50 15 H90 V85 H10 Z" fill="url(#file-gradient)" opacity="0.3" />
    <path d="M10 25 H40 L50 15 H90 V85 H10 Z" stroke="url(#file-gradient)" strokeWidth="3" />
    <path d="M20 40 L80 40 M20 55 L80 55 M20 70 L60 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
  </svg>
);
