
import React from 'react';

export const AddressBookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="address-book-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    {/* Book Shape */}
    <path d="M75 10 H 25 C 20 10, 15 15, 15 20 V 80 C 15 85, 20 90, 25 90 H 75 C 80 90, 85 85, 85 80 V 20 C 85 15, 80 10, 75 10 Z" fill="url(#address-book-gradient)" opacity="0.2" />
    <path d="M75 10 H 25 C 20 10, 15 15, 15 20 V 80 C 15 85, 20 90, 25 90 H 75 C 80 90, 85 85, 85 80 V 20 C 85 15, 80 10, 75 10 Z" stroke="url(#address-book-gradient)" strokeWidth="3" />
    
    {/* Spine */}
    <path d="M25 10 V 90" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.6" />

    {/* Abstracted Address Lines */}
    <path d="M40 30 L 70 30" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
    <path d="M40 45 L 70 45" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
    <path d="M40 60 L 70 60" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.7" />
  </svg>
);
