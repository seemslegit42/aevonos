
import React from 'react';

export const AdminConsoleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="admin-console-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
      </linearGradient>
    </defs>
    {/* Authoritative Laurel Wreath */}
    <path d="M 30 20 C 10 40, 10 60, 30 80" stroke="url(#admin-console-gradient)" strokeWidth="4" fill="none" />
    <path d="M 70 20 C 90 40, 90 60, 70 80" stroke="url(#admin-console-gradient)" strokeWidth="4" fill="none" />
    
    {/* Central Gear/Cog for 'Settings' */}
    <circle cx="50" cy="50" r="12" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none"/>
    <path d="M50 38 V 30 M50 62 V 70 M60.4 44 L 67 39 M39.6 56 L 33 61 M60.4 56 L 67 61 M39.6 44 L 33 39" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
