
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

export default function Obelisk() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = t * 0.05; // Slow, majestic rotation

        // Subtle emissive pulse
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
            meshRef.current.material.emissiveIntensity = Math.sin(t * 0.5) * 0.1 + 0.15;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            <mesh ref={meshRef}>
                <boxGeometry args={[1.5, 14, 1.5]} />
                <meshStandardMaterial
                    color="hsl(247, 36%, 8%)" // Dark obsidian
                    metalness={0.6}
                    roughness={0.3}
                    emissive="hsl(275, 86%, 42%)" // Imperial Purple glow
                    emissiveIntensity={0.1}
                />
            </mesh>
            <Edges
                scale={1}
                threshold={15} // Sets the threshold for displaying edges
                color="hsl(var(--gilded-accent))"
            />
        </group>
    );
}
