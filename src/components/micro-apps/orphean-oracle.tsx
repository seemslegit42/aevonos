
'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';
import { type OrpheanOracleOutput } from '@/ai/agents/orphean-oracle-schemas';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Bot, Lightbulb } from 'lucide-react';

const Node = ({ position, size, color, pulseSpeed, label }: { position: [number, number, number], size: number, color: string, pulseSpeed: number, label: string }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const matRef = useRef<THREE.MeshStandardMaterial>(null!);

    useFrame((state) => {
        const { clock } = state;
        const pulse = 1 + Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.2;
        meshRef.current.scale.set(pulse, pulse, pulse);
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                ref={matRef}
                color={new THREE.Color(color)}
                emissive={new THREE.Color(color)}
                emissiveIntensity={1.5}
                metalness={0.2}
                roughness={0.8}
            />
        </mesh>
    );
};


function Scene({ visualizationData }: { visualizationData: OrpheanOracleOutput['visualizationData'] }) {
    const nodesById = useMemo(() => new Map(visualizationData.nodes.map(node => [node.id, node])), [visualizationData.nodes]);
    
    // Simple spherical layout logic
    const positions = useMemo(() => {
        const posMap = new Map<string, [number, number, number]>();
        visualizationData.nodes.forEach((node, i) => {
            const phi = Math.acos(-1 + (2 * i) / (visualizationData.nodes.length -1));
            const theta = Math.sqrt((visualizationData.nodes.length -1) * Math.PI) * phi;
            const radius = 5;
            posMap.set(node.id, [
                radius * Math.cos(theta) * Math.sin(phi),
                radius * Math.sin(theta) * Math.sin(phi),
                radius * Math.cos(phi)
            ]);
        });
        return posMap;
    }, [visualizationData.nodes]);

    return (
        <>
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} color="hsl(var(--primary))" intensity={2} distance={20} />
            
            {visualizationData.nodes.map(node => (
                <Node key={node.id} position={positions.get(node.id)!} {...node} />
            ))}

            {visualizationData.connections.map((conn, i) => {
                const sourcePos = positions.get(conn.source);
                const targetPos = positions.get(conn.target);
                if (!sourcePos || !targetPos) return null;

                return (
                    <Line
                        key={i}
                        points={[sourcePos, targetPos]}
                        color="hsl(var(--foreground))"
                        lineWidth={1}
                        dashed={false}
                        opacity={conn.strength}
                        transparent
                    />
                );
            })}
            
            <Sparkles count={200} scale={15} size={1} speed={0.3} color="hsl(var(--muted-foreground))" />
        </>
    );
}

export default function OrpheanOracle(props: OrpheanOracleOutput) {
  const { summary, keyInsights, visualizationData } = props;

  return (
    <div className="w-full h-[450px] flex flex-col p-2 space-y-2">
      <div className="relative h-2/3 w-full bg-background/30 rounded-lg border border-dashed border-primary/50 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
            <Scene visualizationData={visualizationData} />
            <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} enablePan={false} />
        </Canvas>
      </div>
      <div className="h-1/3 w-full space-y-2">
        <Alert className="bg-background/50 h-full flex flex-col">
            <Bot className="h-4 w-4" />
            <AlertTitle>Oracle's Summary</AlertTitle>
            <AlertDescription className="italic text-xs text-foreground/80 flex-grow">
                {summary}
            </AlertDescription>
             <ul className="text-xs list-disc pl-4 mt-2">
                {keyInsights.map((insight, i) => <li key={i}>{insight}</li>)}
            </ul>
        </Alert>
      </div>
    </div>
  );
}
