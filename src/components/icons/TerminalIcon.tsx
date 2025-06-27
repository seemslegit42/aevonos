
import React from 'react';

export const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="terminal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Crystalline container */}
    <path d="M10 20 L20 10 L80 10 L90 20 L90 80 L80 90 L20 90 L10 80 Z" fill="url(#terminal-gradient)" opacity="0.3" />
    <path d="M10 20 L20 10 L80 10 L90 20 L90 80 L80 90 L20 90 L10 80 Z" stroke="url(#terminal-gradient)" strokeWidth="3" />
    
    {/* Crystalline ">_" prompt */}
    <path d="M30 40 L45 50 L30 60" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.9" fill="none" />
    <path d="M50 60 L65 60" stroke="hsl(var(--foreground))" strokeWidth="3" opacity="0.9" fill="none" />
  </svg>
);
