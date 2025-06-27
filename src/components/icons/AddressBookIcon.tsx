
import React from 'react';

export const AddressBookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="address-book-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Book Cover */}
    <path d="M20 10 H80 Q 85 10, 85 15 V 85 Q 85 90, 80 90 H 20 Q 15 90, 15 85 V 15 Q 15 10, 20 10 Z" fill="url(#address-book-gradient)" opacity="0.3" />
    <path d="M20 10 H80 Q 85 10, 85 15 V 85 Q 85 90, 80 90 H 20 Q 15 90, 15 85 V 15 Q 15 10, 20 10 Z" stroke="url(#address-book-gradient)" strokeWidth="3" />
    
    {/* Binding */}
    <path d="M15 15 V 85" stroke="hsl(var(--foreground))" strokeWidth="4" opacity="0.6" />

    {/* Abstract contact lines */}
    <path d="M35 30 H 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M35 45 H 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M35 60 H 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
    <path d="M35 75 H 70" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.7" />
  </svg>
);
