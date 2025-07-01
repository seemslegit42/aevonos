
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeepIcon } from '@/components/icons/BeepIcon';

// A single "daemon" particle in the weave
const DaemonParticle = ({ i }: { i: number }) => {
    const xStart = Math.random() * 80 + 10;
    const yStart = Math.random() * 80 + 10;
    const xEnd = Math.random() * 80 + 10;
    const yEnd = Math.random() * 80 + 10;
    
    return (
        <motion.circle
            cx={xStart}
            cy={yStart}
            r="0.75"
            className="text-accent"
            fill="currentColor"
            filter="url(#particle-glow)"
            animate={{
                cx: [xStart, xEnd, xStart],
                cy: [yStart, yEnd, yStart],
            }}
            transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                repeatType: 'loop',
                ease: "linear",
                delay: i * 0.1
            }}
        />
    )
}

// Lines connecting particles to simulate the "weave"
const WeaveLine = ({ i }: { i: number }) => {
     const variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: i * 0.2, type: "spring", duration: 2.5, bounce: 0 },
                opacity: { delay: i * 0.2, duration: 0.1 }
            }
        }
    };
    
    return (
        <motion.line
            x1={Math.random() * 80 + 10}
            y1={Math.random() * 80 + 10}
            x2={Math.random() * 80 + 10}
            y2={Math.random() * 80 + 10}
            stroke="hsl(var(--primary) / 0.2)"
            strokeWidth="0.2"
            variants={variants}
        />
    )
}

export default function GroqSwarmWeave() {
    const numParticles = 75;
    const numLines = 40;

    return (
        <Card className="bg-background/50 border-primary/30 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BeepIcon className="w-6 h-6"/> The Weave</CardTitle>
                <CardDescription>A living visualization of the Groq Swarm dispatching agentic daemons.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow relative overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
                    <defs>
                        <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                        </filter>
                    </defs>
                    <motion.g initial="hidden" animate="visible">
                        {Array.from({ length: numLines }).map((_, i) => <WeaveLine key={`line-${i}`} i={i} />)}
                    </motion.g>
                    {Array.from({ length: numParticles }).map((_, i) => <DaemonParticle key={`particle-${i}`} i={i} />)}
                </svg>
            </CardContent>
        </Card>
    );
}
