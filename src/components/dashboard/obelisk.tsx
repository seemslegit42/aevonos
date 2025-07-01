
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

export default function Obelisk({ totalCreditsBurned }: { totalCreditsBurned: number }) {
    const groupRef = useRef<THREE.Group>(null!);

    // Map the burned credits to visual properties.
    // Use a gentle logarithmic scale so it doesn't get ridiculously tall too quickly.
    const targetScaleY = 1 + Math.log10(Math.max(1, totalCreditsBurned)) / 4;
    const targetGlow = 0.1 + Math.log10(Math.max(1, totalCreditsBurned)) * 0.15;

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = t * 0.05;

        // Animate the group's scale for uniform growth
        groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScaleY, delta * 0.5);

        // Animate the material properties of the child mesh
        const mesh = groupRef.current.children[0] as THREE.Mesh;
        if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
            const baseIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, targetGlow, delta * 0.5);
            mesh.material.emissiveIntensity = baseIntensity + Math.sin(t * 0.5) * 0.05;
        }
    });

    return (
        // The group is positioned down by half the mesh height, and the mesh is positioned up by the same amount.
        // This makes the group scale vertically from y=0 upwards.
        <group ref={groupRef} position={[0, -7, 0]}>
            <mesh position={[0, 7, 0]}>
                <boxGeometry args={[1.5, 14, 1.5]} />
                <meshStandardMaterial
                    color="hsl(247, 30%, 90%)"
                    metalness={0.1}
                    roughness={0.2}
                    transparent={true}
                    opacity={0.6}
                    emissive="hsl(275, 86%, 42%)"
                    emissiveIntensity={0.15}
                    ior={1.5}
                    envMapIntensity={1}
                />
                 <Edges
                    scale={1}
                    threshold={15}
                    color="hsl(var(--gilded-accent))"
                />
            </mesh>
        </group>
    );
}
