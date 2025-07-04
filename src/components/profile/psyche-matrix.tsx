'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type PulseProfile, UserPsyche } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PsycheMatrixProps {
  profile: PulseProfile;
  psyche: UserPsyche;
}

const psycheConfig = {
  [UserPsyche.ZEN_ARCHITECT]: {
    shape: <path d="M50 10 L90 50 L50 90 L10 50 Z" />, // Diamond
    label: 'Covenant of Silence',
  },
  [UserPsyche.SYNDICATE_ENFORCER]: {
    shape: <path d="M50 10 L90 90 L10 90 Z" />, // Triangle
    label: 'Covenant of Motion',
  },
  [UserPsyche.RISK_AVERSE_ARTISAN]: {
    shape: <circle cx="50" cy="50" r="40" />, // Circle
    label: 'Covenant of Worship',
  },
};

export default function PsycheMatrix({ profile, psyche }: PsycheMatrixProps) {
  const { frustration, flowState, riskAversion } = profile;
  const config = psycheConfig[psyche];

  // Map psychological states to visual properties
  const flowColor = `hsl(159, ${50 + flowState * 50}%, ${48 + flowState * 10}%)`; // Patina Green becomes more saturated and brighter
  const frustrationColor = `hsl(0, ${84 + frustration * 16}%, ${60 - frustration * 20}%)`; // Destructive red becomes more intense
  const riskColor = `hsl(275, ${86 - riskAversion * 30}%, ${42 + riskAversion * 20}%)`; // Imperial Purple shifts saturation and lightness

  const animationSpeed = 10 - (flowState * 8); // Faster animation with higher flow
  const blurAmount = frustration * 5; // More blur with higher frustration

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative w-full aspect-square">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <linearGradient id="psyche-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={riskColor} />
                                <stop offset="50%" stopColor={flowColor} />
                                <stop offset="100%" stopColor={frustrationColor} />
                            </linearGradient>
                            <filter id="psyche-blur" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} />
                            </filter>
                        </defs>
                        <g filter="url(#psyche-blur)">
                            <motion.g
                                animate={{ rotate: 360 }}
                                transition={{ duration: animationSpeed, ease: 'linear', repeat: Infinity }}
                                style={{ transformOrigin: '50% 50%' }}
                            >
                                {React.cloneElement(config.shape, {
                                    fill: "url(#psyche-gradient)",
                                    stroke: "hsl(var(--foreground))",
                                    strokeWidth: "1",
                                    opacity: 0.8,
                                })}
                            </motion.g>
                        </g>
                    </svg>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="font-bold">{config.label}</p>
                <p className="text-xs">Frustration: {(frustration * 100).toFixed(0)}%</p>
                <p className="text-xs">Flow State: {(flowState * 100).toFixed(0)}%</p>
                <p className="text-xs">Risk Aversion: {(riskAversion * 100).toFixed(0)}%</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
