
import React from 'react';

export const MerchantOfCabbageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="cabbage-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(120, 60%, 70%)' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
      </linearGradient>
    </defs>
    {/* Cabbage Leaves */}
    <path d="M50 80 Q 20 80, 25 50 T 50 20 T 75 50 Q 80 80, 50 80 Z" fill="url(#cabbage-gradient)" opacity="0.4" />
    <path d="M50 20 C 30 30, 25 50, 30 70" stroke="url(#cabbage-gradient)" strokeWidth="3" fill="none" />
    <path d="M50 20 C 70 30, 75 50, 70 70" stroke="url(#cabbage-gradient)" strokeWidth="3" fill="none" />
    <path d="M40 75 C 45 60, 55 60, 60 75" stroke="url(#cabbage-gradient)" strokeWidth="2.5" fill="none" />

    {/* Roman Coin / Ξ Symbol */}
    <circle cx="50" cy="50" r="10" fill="hsl(var(--gilded-accent))" />
    <text x="50" y="55" textAnchor="middle" fontSize="12" fill="hsl(var(--background))" fontWeight="bold">Ξ</text>
  </svg>
);
