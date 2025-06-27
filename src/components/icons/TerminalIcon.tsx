
import React from 'react';

export const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="terminal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Crystalline container/screen */}
    <path d="M10 15 L20 5 L80 5 L90 15 V85 L80 95 L20 95 L10 85 Z" fill="url(#terminal-gradient)" opacity="0.3" />
    <path d="M10 15 L20 5 L80 5 L90 15 V85 L80 95 L20 95 L10 85 Z" stroke="url(#terminal-gradient)" strokeWidth="3" />
    
    {/* Crystalline ">" prompt character */}
    <path d="M25 45 L40 55 L25 65" stroke="hsl(var(--foreground))" strokeWidth="4" opacity="0.9" fill="none" />
    {/* Crystalline "_" cursor character */}
    <path d="M45 65 L65 65" stroke="hsl(var(--foreground))" strokeWidth="4" opacity="0.9" fill="none" />

    {/* Subtle internal facets for screen glare effect */}
    <path d="M10 85 L90 15" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.15" />
  </svg>
);
