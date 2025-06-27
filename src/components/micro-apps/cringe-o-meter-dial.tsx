
'use client';

import React from 'react';
import { motion, useSpring } from 'framer-motion';

interface CringeOMeterProps {
  score: number;
}

const CringeOMeterDial = ({ score }: CringeOMeterProps) => {
  const getCringeInfo = (s: number) => {
    if (s <= 20) return { label: "Cool As Hell", className: "text-accent" };
    if (s <= 40) return { label: "Mild Risk", className: "text-yellow-400" };
    if (s <= 70) return { label: "Social Turbulence", className: "text-orange-500" };
    if (s <= 90) return { label: "High Cringe Threat", className: "text-red-500" };
    return { label: "Nuclear Embarrassment", className: "text-red-600 animate-pulse" };
  };

  const scoreAngle = (score / 100) * 180 - 90;
  const { label, className } = getCringeInfo(score);
  
  const needleRotation = useSpring(scoreAngle, {
    stiffness: 100,
    damping: 15,
  });

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg border border-dashed border-border/50 mt-3">
      <svg viewBox="0 0 100 60" className="w-full max-w-xs overflow-visible">
        <defs>
          <linearGradient id="cringeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="20%" stopColor="hsl(var(--accent))" />
            <stop offset="40%" stopColor="#facc15" /> {/* yellow-400 */}
            <stop offset="70%" stopColor="#f97316" /> {/* orange-500 */}
            <stop offset="100%" stopColor="#ef4444" /> {/* red-500 */}
          </linearGradient>
        </defs>
        
        {/* Dial arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          stroke="url(#cringeGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Needle */}
        <motion.g
          style={{ transformOrigin: '50px 50px', rotate: needleRotation }}
        >
          <path d="M 50 50 L 50 15" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Pivot */}
        <circle cx="50" cy="50" r="4" fill="hsl(var(--muted))" />
        <circle cx="50" cy="50" r="2" fill="hsl(var(--foreground))" />

        {/* Labels */}
        <text x="10" y="58" textAnchor="middle" fontSize="5" fill="hsl(var(--muted-foreground))" className="font-mono">0</text>
        <text x="90" y="58" textAnchor="middle" fontSize="5" fill="hsl(var(--muted-foreground))" className="font-mono">100</text>
      </svg>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded">
        <p className={`text-sm font-bold font-headline text-center tracking-wider ${className}`}>{label}</p>
      </div>
    </div>
  );
};

export default CringeOMeterDial;
