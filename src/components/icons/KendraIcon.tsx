
import React from 'react';

export const KendraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="kendra-fuchsia-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF00FF' }} /> {/* Fuchsia */}
        <stop offset="100%" style={{ stopColor: '#8A2BE2' }} /> {/* BlueViolet */}
      </linearGradient>
      <filter id="kendra-glitch" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="turbulence" />
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    
    {/* Y2K Window Frame */}
    <rect x="10" y="15" width="80" height="70" rx="5" fill="#111" stroke="#FF00FF" strokeWidth="1" />
    <rect x="10" y="15" width="80" height="10" fill="#333" rx="5" ry="5" />
    <circle cx="16" cy="20" r="2" fill="#FF605C" />
    <circle cx="24" cy="20" r="2" fill="#FFBD44" />
    <circle cx="32" cy="20" r="2" fill="#00CA4E" />

    {/* Glitched Heel Shape */}
    <g style={{ filter: 'url(#kendra-glitch)' }} opacity="0.7">
      <path d="M60 80 L40 70 L70 30 L80 40 Z" fill="url(#kendra-fuchsia-gradient)" />
    </g>
    
    {/* Clean Heel Shape on top */}
    <path d="M60 80 L40 70 L70 30 L80 40 Z" stroke="#FFFFFF" strokeWidth="1.5" />
    
    {/* Star Glint */}
    <path d="M35 35 l 2 -5 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z" fill="#FFFFFF" />

    {/* Brutalist Text Element - "KENDRA" */}
    <text x="50" y="90" fontFamily="monospace" fontSize="8" fill="#FF00FF" textAnchor="middle" fontWeight="bold">
      KENDRA.EXE
    </text>
  </svg>
);
