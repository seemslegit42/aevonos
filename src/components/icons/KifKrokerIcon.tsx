
import React from 'react';

export const KifKrokerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="kif-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.7 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.7 }} />
      </linearGradient>
    </defs>
    {/* A drooping, sighing, asymmetric crystalline glyph */}
    <path d="M50 10 C 30 20, 20 40, 25 60 S 40 95, 50 90 C 60 95, 75 80, 75 60 S 70 20, 50 10 Z" fill="url(#kif-gradient)" opacity="0.3" />
    <path d="M50 10 C 30 20, 20 40, 25 60 S 40 95, 50 90 C 60 95, 75 80, 75 60 S 70 20, 50 10 Z" stroke="url(#kif-gradient)" strokeWidth="3" fill="none" />
    
    {/* Internal facets suggesting weariness */}
    <path d="M50 10 L50 90" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.3" />
    <path d="M35 30 C 40 40, 60 40, 65 30" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" fill="none" />
    <path d="M30 70 C 40 60, 60 60, 70 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" fill="none" />
  </svg>
);
