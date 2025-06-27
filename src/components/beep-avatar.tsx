'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeepIcon } from './icons/BeepIcon';
import type { UserCommandOutput } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Bot, AlertTriangle } from 'lucide-react';

type AvatarState = 'idle' | 'listening' | 'speaking' | 'alert';

interface BeepAvatarProps {
    isLoading: boolean;
    beepOutput: UserCommandOutput | null;
}

export default function BeepAvatar({ isLoading, beepOutput }: BeepAvatarProps) {
    const [avatarState, setAvatarState] = useState<AvatarState>('idle');
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show the avatar after a short delay to avoid layout shift on load
        const timer = setTimeout(() => setShow(true), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) {
            setAvatarState('listening');
        } else if (beepOutput?.agentReports?.some(r => r.agent === 'aegis' && r.report.isAnomalous)) {
            setAvatarState('alert');
        } else if (beepOutput?.responseAudioUri) {
            setAvatarState('speaking');
        } else {
            setAvatarState('idle');
        }
    }, [isLoading, beepOutput]);

    useEffect(() => {
        if (avatarState === 'speaking' && beepOutput?.responseAudioUri && audioRef.current) {
            audioRef.current.src = beepOutput.responseAudioUri;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [avatarState, beepOutput]);

    const handleAudioEnd = () => {
        setAvatarState('idle');
    };

    const stateStyles = {
        idle: { scale: 1, filter: 'saturate(1)' },
        listening: { scale: 1.1, filter: 'saturate(1.5)', transition: { yoyo: Infinity, duration: 0.8 } },
        speaking: { scale: 1.1, filter: 'saturate(1.5)', transition: { yoyo: Infinity, duration: 0.4 } },
        alert: { scale: 1.2, filter: 'hue-rotate(120deg) saturate(2)', transition: { yoyo: Infinity, duration: 0.2 } },
    };

    if (!show) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <motion.div
                    animate={stateStyles[avatarState]}
                    className={cn('relative w-24 h-24 cursor-pointer', avatarState === 'alert' && '[&_#beep-core-glow_stop:first-child]:[stop-color:hsl(var(--destructive))]')}
                >
                    <BeepIcon />
                </motion.div>
                <AnimatePresence>
                    {(isHovered || avatarState !== 'idle') && (
                        <motion.div
                            className="absolute bottom-full mb-2 w-48 right-0 bg-background/70 backdrop-blur-md p-3 rounded-lg border border-border text-center shadow-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <div className="flex items-center justify-center gap-2 font-bold text-sm text-foreground">
                                {avatarState === 'alert' ? <AlertTriangle className="text-destructive" /> : <Bot />}
                                <span>BEEP: <span className="capitalize">{avatarState}</span></span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">The soul of ΛΞVON OS.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />
            </motion.div>
        </AnimatePresence>
    );
}
