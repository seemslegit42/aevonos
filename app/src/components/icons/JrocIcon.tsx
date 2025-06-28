
import React from 'react';

export const JrocIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="jroc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
       <linearGradient id="jroc-bling" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--ring))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--foreground))' }} />
      </linearGradient>
    </defs>
    {/* Abstract Boombox Body */}
    <path d="M15 30 L85 30 L90 40 V70 L85 80 H15 L10 70 V40 Z" fill="url(#jroc-gradient)" opacity="0.3" />
    <path d="M15 30 L85 30 L90 40 V70 L85 80 H15 L10 70 V40 Z" stroke="url(#jroc-gradient)" strokeWidth="3" />
    
    {/* Speakers (Crystals) */}
    <circle cx="35" cy="55" r="15" stroke="url(#jroc-bling)" strokeWidth="2" fill="none" />
    <circle cx="65" cy="55" r="15" stroke="url(#jroc-bling)" strokeWidth="2" fill="none" />
    
    {/* Handle / "Bling" Chain */}
    <path d="M35 30 C 35 10, 65 10, 65 30" stroke="url(#jroc-bling)" strokeWidth="4" fill="none"/>
  </svg>
);
