
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type User, UserPsyche } from '@prisma/client';

type UserData = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'lastLoginAt' | 'psyche' | 'agentAlias'>;

const psycheConfig = {
    [UserPsyche.ZEN_ARCHITECT]: { color: new THREE.Color('#89f7fe') }, // Light blue
    [UserPsyche.SYNDICATE_ENFORCER]: { color: new THREE.Color('#facc15') }, // Amber
    [UserPsyche.RISK_AVERSE_ARTISAN]: { color: new THREE.Color('#4ade80') }, // Green
};

interface UserStarProps {
    user: UserData;
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
}

export default function UserStar({ user, position, onClick, isSelected }: UserStarProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [isHovered, setIsHovered] = useState(false);
    const config = psycheConfig[user.psyche] || { color: new THREE.Color('white') };

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
            const scale = isSelected ? 1.5 : isHovered ? 1.2 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
            onPointerOut={() => setIsHovered(false)}
        >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial
                color={config.color}
                emissive={config.color}
                emissiveIntensity={isSelected ? 3 : isHovered ? 2 : 1}
                toneMapped={false}
            />
        </mesh>
    );
}
