
import React from 'react';

export const UsageMonitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="usage-monitor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted gauge/dial shape */}
    <path d="M20 80 A 40 40 0 1 1 80 80" stroke="url(#usage-monitor-gradient)" strokeWidth="3" fill="none" opacity="0.5" />
    <path d="M20 80 A 40 40 0 1 1 80 80 L 50 80 Z" fill="url(#usage-monitor-gradient)" opacity="0.2" />
    
    {/* Needle pointing somewhere in the middle */}
    <path d="M50 80 L 35 45" stroke="hsl(var(--foreground))" strokeWidth="3" />
    <circle cx="50" cy="80" r="4" fill="hsl(var(--foreground))" />

    {/* Facet lines suggesting markings */}
    <path d="M22 65 L28 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
    <path d="M50 40 L50 46" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
    <path d="M78 65 L72 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
  </svg>
);
