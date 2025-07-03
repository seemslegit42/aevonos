
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PulsePhase } from '@prisma/client';
import { cn } from '@/lib/utils';

interface PulseState {
    narrative: string | null;
    phase: PulsePhase | null;
    value: number | null;
}

export default function PulseNarrativeDisplay() {
    const [pulseState, setPulseState] = useState<PulseState>({ narrative: null, phase: null, value: null });

    useEffect(() => {
        const fetchNarrative = async () => {
            try {
                const res = await fetch('/api/user/pulse');
                if (res.ok) {
                    const data = await res.json();
                    setPulseState(data);
                }
            } catch (error) {
                // Silently fail, this is a non-critical feature
                console.error("Failed to fetch pulse narrative:", error);
            }
        };

        // Fetch immediately and then set an interval to refresh
        fetchNarrative();
        const interval = setInterval(fetchNarrative, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const phaseConfig = {
        [PulsePhase.CREST]: {
            className: 'bg-gilded-accent',
            scale: 1.1,
            duration: 1.5
        },
        [PulsePhase.TROUGH]: {
            className: 'bg-destructive/50',
            scale: 1,
            duration: 4
        },
        [PulsePhase.EQUILIBRIUM]: {
            className: 'bg-muted-foreground/50',
            scale: 1,
            duration: 3
        }
    };
    
    const currentConfig = pulseState.phase ? phaseConfig[pulseState.phase] : phaseConfig.EQUILIBRIUM;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-none z-10 text-center px-4 md:bottom-12 space-y-2">
            <AnimatePresence>
                {pulseState.narrative && (
                    <motion.p
                        key={pulseState.narrative} // Animate on text change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.7 }}
                        className="text-sm font-medium text-muted-foreground italic"
                        style={{textShadow: '0 0 8px hsl(var(--background))'}}
                    >
                        "{pulseState.narrative}"
                    </motion.p>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {pulseState.phase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.0 }}
                        className="h-1 flex items-center justify-center"
                    >
                         <motion.div
                            className={cn("h-0.5 w-1/3 mx-auto rounded-full", currentConfig.className)}
                            animate={{ scaleX: [1, currentConfig.scale, 1] }}
                            transition={{ duration: currentConfig.duration, repeat: Infinity, ease: 'easeInOut' }}
                         />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

    