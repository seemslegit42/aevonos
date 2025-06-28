'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const FlowerOfLifeIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const r = 50; // radius of a single circle

  // A robust, deterministic method to generate the 19 circles.
  // 1. Generate all potential positions for a larger pattern.
  const calculatedPositions = [
    [0, 0], // Center
    // Ring 1 (6 circles)
    ...Array.from({ length: 6 }, (_, i) => [r * Math.cos(i * Math.PI / 3), r * Math.sin(i * Math.PI / 3)]),
    // Ring 2 (6 circles, further out on same axes)
    ...Array.from({ length: 6 }, (_, i) => [r * 2 * Math.cos(i * Math.PI / 3), r * 2 * Math.sin(i * Math.PI / 3)]),
    // Ring 3 (6 circles, interleaved)
    ...Array.from({ length: 6 }, (_, i) => [r * Math.sqrt(3) * Math.cos(i * Math.PI / 3 + Math.PI / 6), r * Math.sqrt(3) * Math.sin(i * Math.PI / 3 + Math.PI / 6)])
  ];
  
  // 2. Use a Map to get unique positions (handles floating point rounding) and take the first 19.
  const positions = Array.from(
    new Map(calculatedPositions.map(p => [`${p[0].toFixed(2)},${p[1].toFixed(2)}`, p])).values()
  ).slice(0, 19);
  
  return (
    <motion.svg
      viewBox="-175 -175 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: 360,
      }}
      transition={{ 
        opacity: { duration: 2 },
        scale: { duration: 2 },
        rotate: { duration: 120, loop: Infinity, ease: 'linear' }
      }}
      {...props}
    >
      <defs>
        <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--iridescent-one))' }} />
            <stop offset="50%" style={{ stopColor: 'hsl(var(--iridescent-two))' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--iridescent-three))' }} />
        </linearGradient>
        <filter id="subtle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity="0.3" stroke="url(#aurora)" strokeWidth="1.5" filter="url(#subtle-glow)" className="animate-subtle-pulse">
        {positions.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </motion.svg>
  );
};
