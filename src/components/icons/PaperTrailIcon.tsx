
import React from 'react';

export const PaperTrailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="paper-trail-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Abstracted file/document shape */}
    <path d="M25 10 L75 10 L75 90 L25 90 Z" fill="url(#paper-trail-gradient)" opacity="0.2" />
    <path d="M25 10 L75 10 L75 90 L25 90 Z" stroke="url(#paper-trail-gradient)" strokeWidth="2" fill="none" />
    
    {/* Crystalline magnifying glass */}
    <circle cx="50" cy="45" r="20" stroke="url(#paper-trail-gradient)" strokeWidth="3" fill="none" />
    <path d="M65 60 L80 75" stroke="url(#paper-trail-gradient)" strokeWidth="3" />

    {/* Facets inside the glass suggesting analysis */}
    <path d="M40 45 L60 45" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
    <path d="M50 35 L50 55" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
