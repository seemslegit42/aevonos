import React from 'react';

export const EchoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="echo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
      </linearGradient>
    </defs>
    <path d="M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0" stroke="url(#echo-gradient)" strokeWidth="3" opacity="0.3" />
    <path d="M50 50 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0" stroke="url(#echo-gradient)" strokeWidth="3" opacity="0.6" />
    <path d="M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0" stroke="url(#echo-gradient)" strokeWidth="3" opacity="0.9" />
    <circle cx="50" cy="50" r="10" fill="url(#echo-gradient)" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
  </svg>
);
