'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Line, Icosahedron, Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import { type Agent as AgentData, AgentStatus } from '@prisma/client';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { MicroAppType } from '@/store/app-store';

const statusConfig: Record<AgentStatus, { color: THREE.Color; emissiveIntensity: number }> = {
    [AgentStatus.active]: { color: new THREE.Color('hsl(var(--accent))'), emissiveIntensity: 0.8 },
    [AgentStatus.processing]: { color: new THREE.Color('hsl(var(--primary))'), emissiveIntensity: 1.2 },
    [AgentStatus.idle]: { color: new THREE.Color('hsl(215, 20.2%, 65.1%)'), emissiveIntensity: 0.2 },
    [AgentStatus.paused]: { color: new THREE.Color('hsl(var(--ring))'), emissiveIntensity: 0.6 },
    [AgentStatus.error]: { color: new THREE.Color('hsl(var(--destructive))'), emissiveIntensity: 1.0 },
};

function AgentNode({ agent, position }: { agent: AgentData, position: THREE.Vector3 }) {
    const { upsertApp } = useAppStore();
    const groupRef = useRef<THREE.Group>(null!);
    const [isHovered, setIsHovered] = useState(false);
    const config = statusConfig[agent.status] || statusConfig.idle;

    useFrame((state) => {
        const { clock } = state;
        const group = groupRef.current;
        if (!group) return;
        const pulseSpeed = agent.status === AgentStatus.processing ? 4 : 1;
        const pulseIntensity = agent.status === AgentStatus.processing ? 0.25 : 0.1;
        group.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * pulseSpeed) * pulseIntensity);
    });
    
    const handleNodeClick = (e: any) => {
        e.stopPropagation();
        try {
            const appType = agent.type as MicroAppType;
            // The app ID should be consistent for agent-specific apps to act as singletons
            const appId = `agent-app-${agent.type}`; 
            upsertApp(appType, { id: appId });
        } catch (e) {
            console.error(`Error launching app for agent type: ${agent.type}`, e);
        }
    };

    return (
        <group 
            position={position}
            onPointerDown={handleNodeClick}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            className="cursor-pointer"
        >
            <group ref={groupRef}>
              <Icosahedron args={[0.4, 1]}>
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
        meshRef.current.rotation.x += 0.002;
    });
     return (
        <Icosahedron ref={meshRef} args={[0.8, 2]}>
            <meshStandardMaterial
                color="hsl(var(--primary))"
                emissive="hsl(var(--primary))"
                emissiveIntensity={1.5}
                metalness={0.9}
                roughness={0.1}
            />
             <Edges scale={1.001} threshold={15} color="hsl(var(--primary-foreground))" />
        </Icosahedron>
     );
}

function Scene({ agents }: { agents: AgentData[] }) {
    const nodePositions = useMemo(() => {
        return agents.map((agent, index) => {
            const angle = (index / agents.length) * Math.PI * 2;
            const radius = 3 + Math.floor(index / 8) * 1.5;
            const yPos = (Math.random() - 0.5) * 4;
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
                    <Line points={[[0,0,0], nodePositions[index]]} color="hsl(var(--muted-foreground))" lineWidth={0.5} opacity={0.3} transparent />
                </group>
            ))}
            <Sparkles count={200} scale={15} size={2} speed={0.3} color="hsl(var(--accent))" />
        </>
    );
}


export default function OracleBackground({ initialAgents }: { initialAgents: AgentData[] }) {
  const [agents, setAgents] = useState<AgentData[]>(initialAgents);

  useEffect(() => {
    const fetchAgents = async () => {
        try {
            const response = await fetch('/api/agents');
            if (!response.ok) return; // Don't crash if API is down, just don't update
            const data: AgentData[] = await response.json();
            setAgents(data);
        } catch (err) {
            console.error("Oracle background sync failed:", err);
        }
    };
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 8, 14], fov: 60 }}>
            <Scene agents={agents} />
            <OrbitControls autoRotate autoRotateSpeed={0.2} enableZoom={true} enablePan={false} />
        </Canvas>
      </div>
  );
}
