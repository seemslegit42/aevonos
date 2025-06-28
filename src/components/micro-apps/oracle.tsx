
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Html, Line, Icosahedron, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { type Agent as AgentData, AgentStatus } from '@prisma/client';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define colors for different agent statuses using HSL values from the theme
const statusConfig: Record<AgentStatus, { color: THREE.Color; emissiveIntensity: number }> = {
    [AgentStatus.active]: { color: new THREE.Color('hsl(320, 85%, 60%)'), emissiveIntensity: 0.8 }, // accent
    [AgentStatus.processing]: { color: new THREE.Color('hsl(195, 90%, 45%)'), emissiveIntensity: 1.2 }, // primary
    [AgentStatus.idle]: { color: new THREE.Color('hsl(215, 20.2%, 65.1%)'), emissiveIntensity: 0.2 }, // muted-foreground
    [AgentStatus.paused]: { color: new THREE.Color('hsl(45, 90%, 55%)'), emissiveIntensity: 0.6 }, // ring (yellow)
    [AgentStatus.error]: { color: new THREE.Color('hsl(0, 84.2%, 60.2%)'), emissiveIntensity: 1.0 }, // destructive
};

function AgentNode({ agent, position }: { agent: AgentData, position: THREE.Vector3 }) {
    const meshRef = useRef<THREE.Group>(null!);
    const [isHovered, setIsHovered] = useState(false);
    const config = statusConfig[agent.status] || statusConfig.idle;

    useFrame((state) => {
        const { clock } = state;
        const group = meshRef.current;
        if (!group) return;

        // Pulsating effect based on status
        const pulseSpeed = agent.status === AgentStatus.processing ? 4 : 1;
        const pulseIntensity = agent.status === AgentStatus.processing ? 0.25 : 0.1;
        group.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * pulseSpeed) * pulseIntensity);
    });

    return (
        <group position={position}>
            <group
                ref={meshRef}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            >
              <Icosahedron
                  args={[0.4, 1]}
              >
                  <meshStandardMaterial
                      color={config.color}
                      emissive={config.color}
                      emissiveIntensity={config.emissiveIntensity}
                      metalness={0.8}
                      roughness={0.1}
                  />
                   <Edges scale={1.001} threshold={15} color="white" />
              </Icosahedron>
            </group>
            <Html distanceFactor={10}>
                <div
                    className={cn(
                        'transition-opacity duration-300 pointer-events-none p-2 rounded-md text-xs bg-background/70 backdrop-blur-sm border border-border w-32 text-center',
                        isHovered ? 'opacity-100' : 'opacity-0'
                    )}
                >
                    <p className="font-bold truncate">{agent.name}</p>
                    <p className="capitalize font-medium" style={{ color: config.color.getStyle() }}>{agent.status}</p>
                </div>
            </Html>
        </group>
    );
}

function BeepCore() {
    const meshRef = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        const { clock } = state;
        meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
        meshRef.current.rotation.y += 0.005;
    });
     return (
        <Icosahedron ref={meshRef} args={[0.6, 1]}>
            <meshStandardMaterial
                color="hsl(var(--primary))"
                emissive="hsl(var(--primary))"
                emissiveIntensity={1.5}
                metalness={0.9}
                roughness={0.1}
            />
             <Edges scale={1.001} threshold={15} color="white" />
        </Icosahedron>
     );
}

function Scene({ agents }: { agents: AgentData[] }) {
    const nodePositions = useMemo(() => {
        return agents.map((agent, index) => {
            const angle = (index / agents.length) * Math.PI * 2;
            const radius = 2.5 + Math.floor(index / 8) * 1.5; // Spiral out
            const yPos = (Math.random() - 0.5) * 3;
            return new THREE.Vector3(Math.cos(angle) * radius, yPos, Math.sin(angle) * radius)
        });
    }, [agents]);

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} color="hsl(var(--primary))" intensity={15} distance={20} />
            
            <BeepCore />
            
            {agents.map((agent, index) => (
                <group key={agent.id}>
                    <AgentNode agent={agent} position={nodePositions[index]} />
                    <Line
                        points={[[0,0,0], nodePositions[index]]}
                        color="hsl(var(--muted-foreground))"
                        lineWidth={0.5}
                        opacity={0.3}
                        transparent
                    />
                </group>
            ))}
            
            <Sparkles count={150} scale={12} size={2} speed={0.3} color="hsl(var(--accent))" />
        </>
    );
}


export default function Oracle() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/agents');
            if (!response.ok) {
                throw new Error('Failed to fetch agent data from the network.');
            }
            const data: AgentData[] = await response.json();
            setAgents(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000); // Poll for updates

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (isLoading && agents.length === 0) {
        return <Skeleton className="w-full h-full bg-foreground/10" />;
    }

    if (error) {
        return (
            <Alert variant="destructive" className="m-auto max-w-sm">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Network Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Canvas camera={{ position: [0, 6, 12], fov: 60 }}>
            <Scene agents={agents} />
            <OrbitControls autoRotate autoRotateSpeed={0.3} enableZoom={true} enablePan={true} />
        </Canvas>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-0">
        {renderContent()}
    </div>
  );
}
