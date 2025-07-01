'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const CovenantSphere = ({ color, radius, speed, label }: { color: string, radius: number, speed: number, label: string }) => {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * speed;
        ref.current.position.x = radius * Math.cos(t);
        ref.current.position.z = radius * Math.sin(t);
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            <Html distanceFactor={10}>
                <div className="text-center text-xs text-white bg-black/30 rounded px-1 py-0.5">
                    {label}
                </div>
            </Html>
        </mesh>
    );
};


const OrreryScene = () => {
    return (
        <>
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} color="#fff" intensity={3} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <CovenantSphere color="hsl(175, 100%, 45%)" radius={3} speed={0.5} label="Motion" />
            <CovenantSphere color="hsl(45, 100%, 60%)" radius={5} speed={0.3} label="Worship" />
            <CovenantSphere color="hsl(0, 0%, 90%)" radius={7} speed={0.2} label="Silence" />

            <Text
                position={[0,0,0]}
                fontSize={0.6}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                Pantheon
            </Text>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </>
    );
}


export default function CovenantOrrery() {
    return (
        <Card className="bg-background/50 border-primary/30 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-6 h-6"/> The Orrery</CardTitle>
                <CardDescription>A model of the Covenants and Syndicates, showing their relative power and influence.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow relative rounded-b-lg overflow-hidden">
                <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
                    <OrreryScene />
                </Canvas>
            </CardContent>
        </Card>
    );
}
