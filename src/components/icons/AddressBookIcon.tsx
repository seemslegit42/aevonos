
import React from 'react';

export const AddressBookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="address-book-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Crystalline Hexagon Shape */}
    <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" fill="url(#address-book-gradient)" opacity="0.3" />
    <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" stroke="url(#address-book-gradient)" strokeWidth="3" />
    
    {/* Internal Facets / "Entries" */}
    <path d="M35 40 H 65" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.8" />
    <path d="M35 50 H 65" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.8" />
    <path d="M35 60 H 65" stroke="hsl(var(--foreground))" strokeWidth="2.5" opacity="0.8" />

    {/* Vertical Facet Line */}
    <path d="M50 10 L50 90" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
  </svg>
);
