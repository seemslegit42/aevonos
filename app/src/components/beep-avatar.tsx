
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

import type { UserCommandOutput } from '@/store/app-store';
import { Bot, AlertTriangle } from 'lucide-react';

type AvatarState = 'idle' | 'listening' | 'speaking' | 'alert';

interface BeepAvatarProps {
    isLoading: boolean;
    beepOutput: UserCommandOutput | null;
}

const AnimatedIcosahedron = ({ avatarState }: { avatarState: AvatarState }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

    const targetState = useRef({
        scale: 1,
        color: new THREE.Color('hsl(195, 90%, 45%)'), // primary
        emissiveIntensity: 0.2,
        rotationSpeed: 0.2,
    });
    
    useEffect(() => {
        const colors = {
            primary: new THREE.Color('hsl(195, 90%, 45%)'), // New Primary
            accent: new THREE.Color('hsl(320, 85%, 60%)'), // New Accent
            destructive: new THREE.Color('hsl(0, 84.2%, 60.2%)'),
        };

        switch (avatarState) {
            case 'listening':
                targetState.current = { scale: 1.1, color: colors.accent, emissiveIntensity: 0.8, rotationSpeed: 1.5 };
                break;
            case 'speaking':
                targetState.current = { scale: 1.1, color: colors.accent, emissiveIntensity: 0.6, rotationSpeed: 0.8 };
                break;
            case 'alert':
                targetState.current = { scale: 1.2, color: colors.destructive, emissiveIntensity: 1.0, rotationSpeed: 5 };
                break;
            default: // idle
                targetState.current = { scale: 1, color: colors.primary, emissiveIntensity: 0.2, rotationSpeed: 0.2 };
                break;
        }
    }, [avatarState]);

    useFrame((state, delta) => {
        const { clock } = state;
        const group = groupRef.current;
        const material = materialRef.current;
        if (!group || !material) return;
        
        group.scale.lerp(new THREE.Vector3(1,1,1).multiplyScalar(targetState.current.scale), 0.1);
        material.color.lerp(targetState.current.color, 0.1);
        material.emissive.lerp(targetState.current.color, 0.1);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetState.current.emissiveIntensity, 0.1);
        
        group.rotation.y += targetState.current.rotationSpeed * delta * 0.5;

        if(avatarState !== 'idle') {
            group.rotation.x = Math.sin(clock.getElapsedTime() * targetState.current.rotationSpeed * 0.5) * 0.1;
            group.rotation.z = Math.cos(clock.getElapsedTime() * targetState.current.rotationSpeed * 0.5) * 0.1;
        } else {
             group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0, 0.1);
             group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            <Icosahedron args={[1.5, 1]}>
                <meshStandardMaterial
                    ref={materialRef}
                    roughness={0.1}
                    metalness={0.9}
                    emissive={new THREE.Color('hsl(195, 90%, 45%)')}
                />
                 <Edges scale={1.001} threshold={15} color="white" />
            </Icosahedron>
        </group>
    );
};

export default function BeepAvatar({ isLoading, beepOutput }: BeepAvatarProps) {
    const [avatarState, setAvatarState] = useState<AvatarState>('idle');
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
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
    }, [avatarState, beepOutput?.responseAudioUri]);

    const handleAudioEnd = () => {
        setAvatarState('idle');
    };
    
    const getStatusText = () => {
        if (beepOutput?.agentReports?.some(r => r.agent === 'aegis' && r.report.isAnomalous)) {
            return "Aegis Alert!";
        }
        return `BEEP: ${avatarState.charAt(0).toUpperCase() + avatarState.slice(1)}`;
    };

    if (!show) {
        return null;
    }
    
    return (
        <AnimatePresence>
            <motion.div
                className="fixed bottom-6 right-6 z-50 w-28 h-28 cursor-pointer"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={2} color="hsl(var(--primary))" />
                    <pointLight position={[-10, -10, 5]} intensity={1} color="hsl(var(--accent))" />
                    <AnimatedIcosahedron avatarState={avatarState} />
                </Canvas>
                <AnimatePresence>
                    {(isHovered || avatarState !== 'idle') && (
                        <motion.div
                            className="absolute bottom-full mb-2 w-48 right-0 bg-background/70 backdrop-blur-xl p-3 rounded-lg border border-border text-center shadow-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <div className="flex items-center justify-center gap-2 font-bold text-sm text-foreground">
                                {avatarState === 'alert' ? <AlertTriangle className="text-destructive" /> : <Bot />}
                                <span>{getStatusText()}</span>
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
