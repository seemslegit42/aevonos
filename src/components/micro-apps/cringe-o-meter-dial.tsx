
'use client';

import React from 'react';

const CringeOMeterDial = ({ score }: { score: number }) => {
  const getCringeLabel = () => {
    if (score < 10) return "Suave";
    if (score < 30) return "Acceptable";
    if (score < 50) return "Bold";
    if (score < 70) return "Cheesy";
    if (score < 90) return "MAXIMUM";
    return "CRINGE-ULARITY";
  };

  const scoreAngle = (score / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg border border-dashed border-border/50 mt-3">
      <svg viewBox="0 0 100 60" className="w-full max-w-xs">
        {/* The dial arc */}
        <defs>
          <linearGradient id="cringeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" />
          </linearGradient>
        </defs>
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          stroke="url(#cringeGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        {/* Tick marks */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="1">
            <path d="M10 50 L12 45" />
            <path d="M22 28 L24 32" />
            <path d="M50 10 L50 15" />
            <path d="M78 28 L76 32" />
            <path d="M90 50 L88 45" />
        </g>
        
        {/* Labels */}
        <text x="10" y="58" textAnchor="middle" fontSize="6" fill="hsl(var(--foreground))" className="font-mono">SUAVE</text>
        <text x="90" y="58" textAnchor="middle" fontSize="6" fill="hsl(var(--foreground))" className="font-mono">CRINGE</text>

        {/* Needle */}
        <g style={{ transform: `rotate(${scoreAngle}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.5s ease-out' }}>
          <path d="M 50 50 L 50 15" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Pivot */}
        <circle cx="50" cy="50" r="4" fill="hsl(var(--muted))" />
        <circle cx="50" cy="50" r="2" fill="hsl(var(--foreground))" />
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded">
        <p className="text-sm font-bold text-primary font-mono text-center tracking-widest">{getCringeLabel()}</p>
      </div>
    </div>
  );
};

export default CringeOMeterDial;
