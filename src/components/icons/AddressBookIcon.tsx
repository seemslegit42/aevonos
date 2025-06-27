
import React from 'react';

export const AddressBookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="address-book-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Crystalline Shard/Book shape */}
    <path d="M50 5 L85 25 L90 75 L50 95 L10 75 L15 25 Z" fill="url(#address-book-gradient)" opacity="0.3" />
    <path d="M50 5 L85 25 L90 75 L50 95 L10 75 L15 25 Z" stroke="url(#address-book-gradient)" strokeWidth="3" />
    
    {/* Vertical Spine Facet */}
    <path d="M50 5 L50 95" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />

    {/* Abstracted 'Entry' Facets */}
    <path d="M50 35 L85 25" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M50 50 L88 45" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M50 65 L90 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M50 35 L15 25" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M50 50 L12 45" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
    <path d="M50 65 L10 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.6" />
  </svg>
);
