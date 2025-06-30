
import React from 'react';

export const BeepIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <radialGradient id="beep-core-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.8 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0 }} />
      </radialGradient>
      <linearGradient id="beep-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
       <filter id="beep-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
      </filter>
    </defs>
    
    <g filter="url(#beep-glow-filter)">
        {/* Outer ring */}
        <ellipse cx="50" cy="50" rx="45" ry="10" stroke="url(#beep-ring-gradient)" strokeWidth="1" opacity="0.6" transform="rotate(20 50 50)">
             <animateTransform
                attributeName="transform"
                type="rotate"
                from="20 50 50"
                to="380 50 50"
                dur="25s"
                repeatCount="indefinite"
            />
        </ellipse>
        {/* Middle ring */}
        <ellipse cx="50" cy="50" rx="35" ry="15" stroke="url(#beep-ring-gradient)" strokeWidth="1.5" transform="rotate(-30 50 50)">
             <animateTransform
                attributeName="transform"
                type="rotate"
                from="-30 50 50"
                to="-390 50 50"
                dur="20s"
                repeatCount="indefinite"
            />
        </ellipse>
         {/* Inner ring */}
        <ellipse cx="50" cy="50" rx="25" ry="25" stroke="url(#beep-ring-gradient)" strokeWidth="1" opacity="0.4">
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="30s"
                repeatCount="indefinite"
            />
        </ellipse>
    </g>

    {/* The core with a radial glow */}
    <circle cx="50" cy="50" r="20" fill="url(#beep-core-glow)" />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="1.5">
        <animate
            attributeName="r"
            values="12; 13; 12"
            dur="4s"
            repeatCount="indefinite" />
        <animate
            attributeName="stroke-width"
            values="1.5; 2; 1.5"
            dur="4s"
            repeatCount="indefinite" />
    </circle>
  </svg>
);
