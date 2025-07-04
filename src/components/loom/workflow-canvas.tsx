
'use client';

import React, { useRef, useState, useMemo, forwardRef } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { Node, Edge } from './types';
import { Bot, PlayCircle, GitBranch, HardHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WinstonWolfeIcon } from '../icons/WinstonWolfeIcon';
import { KifKrokerIcon } from '../icons/KifKrokerIcon';
import { VandelayIcon } from '../icons/VandelayIcon';
import { DrSyntaxIcon } from '../icons/DrSyntaxIcon';
import { AddressBookIcon } from '../icons/AddressBookIcon';
import { RolodexIcon } from '../icons/RolodexIcon';
import { CrystalIcon } from '../icons/CrystalIcon';
import { JrocIcon } from '../icons/JrocIcon';
import { LaheyIcon } from '../icons/LaheyIcon';
import { ForemanatorIcon } from '../icons/ForemanatorIcon';
import { SterileishIcon } from '../icons/SterileishIcon';
import { PaperTrailIcon } from '../icons/PaperTrailIcon';
import { BarbaraIcon } from '../icons/BarbaraIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditorGeneralissimoIcon } from '../icons/AuditorGeneralissimoIcon';
import { BeepWingmanIcon } from '../icons/BeepWingmanIcon';
import { KendraIcon } from '../icons/KendraIcon';
import { LumberghIcon } from '../icons/LumberghIcon';
import { LucilleBluthIcon } from '../icons/LucilleBluthIcon';
import { PamPooveyIcon } from '../icons/PamPooveyIcon';
import { StonksIcon } from '../icons/StonksIcon';
import { RenoModeIcon } from '../icons/RenoModeIcon';
import { PatricktIcon } from '../icons/PatricktIcon';
import { VinDieselIcon } from '../icons/VinDieselIcon';

const nodeIcons: Record<string, React.ComponentType<any>> = {
    trigger: PlayCircle,
    agent: Bot,
    logic: GitBranch,
    'tool-winston-wolfe': WinstonWolfeIcon,
    'tool-kif-kroker': KifKrokerIcon,
    'tool-vandelay': VandelayIcon,
    'tool-rolodex': RolodexIcon,
    'tool-dr-syntax': DrSyntaxIcon,
    'tool-crm': AddressBookIcon,
    'tool-paper-trail': PaperTrailIcon,
    'tool-final-answer': CrystalIcon,
    'tool-jroc': JrocIcon,
    'tool-lahey': LaheyIcon,
    'tool-foremanator': ForemanatorIcon,
    'tool-sterileish': SterileishIcon,
    'tool-barbara': BarbaraIcon,
    'tool-auditor-generalissimo': AuditorGeneralissimoIcon,
    'tool-beep-wingman': BeepWingmanIcon,
    'tool-kendra': KendraIcon,
    'tool-lumbergh': LumberghIcon,
    'tool-lucille-bluth': LucilleBluthIcon,
    'tool-pam-poovey': PamPooveyIcon,
    'tool-stonks-bot': StonksIcon,
    'tool-reno-mode': RenoModeIcon,
    'tool-patrickt-app': PatricktIcon,
    'tool-vin-diesel': VinDieselIcon,
    'tool-inventory-daemon': HardHat,
};

function WorkflowNodeItem({ node, onClick, isSelected, onConnectStart, onConnectEnd }: { 
    node: Node, 
    onClick: (node: Node) => void, 
    isSelected: boolean,
    onConnectStart: (nodeId: string) => void,
    onConnectEnd: (nodeId: string) => void,
}) {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: node.id });
    const style = { position: 'absolute' as 'absolute', left: node.position.x, top: node.position.y, zIndex: isSelected ? 10 : 1 };
    const Icon = nodeIcons[node.type] || CrystalIcon;

    const nodeTypeColor = node.type === 'trigger' ? 'border-accent' : node.type === 'logic' ? 'border-yellow-400' : 'border-primary';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(node)}>
            <div className={cn(
                "w-48 rounded-lg shadow-lg bg-background/50 backdrop-blur-xl border hover:border-primary transition-all duration-300 flex flex-col group cursor-grab",
                isSelected ? "border-primary ring-2 ring-primary" : "border-border/20",
                nodeTypeColor
            )}>
                <div className="flex items-center gap-2 p-2 border-b border-border/20">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    <p className="text-xs font-bold text-foreground truncate">{node.data.label}</p>
                </div>
                <div className="p-2 text-xs text-muted-foreground">
                    <p>Type: {node.type}</p>
                </div>
                <div 
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border-2 border-border cursor-crosshair transition-all group-hover:scale-125 group-hover:border-primary" 
                    title="Input"
                    onPointerUp={(e) => { e.stopPropagation(); onConnectEnd(node.id); }}
                />
                <div 
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border-2 border-border cursor-crosshair transition-all group-hover:scale-125 group-hover:border-primary" 
                    title="Output"
                    onPointerDown={(e) => { e.stopPropagation(); onConnectStart(node.id); }}
                />
            </div>
        </div>
    );
}

const getEdgePath = (sourceNode: Node, targetNode: Node | {position: {x:number, y:number}} ) => {
    if (!sourceNode || !targetNode) return { path: '', midX: 0, midY: 0 };
    const nodeWidth = 192; // w-48
    const nodeHeight = 68; // approximate height

    const sourceX = sourceNode.position.x + nodeWidth; 
    const sourceY = sourceNode.position.y + nodeHeight / 2;
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + ('id' in targetNode ? nodeHeight / 2 : 0);

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const dx = targetX - sourceX;
    const curve = Math.abs(dx) * 0.5;

    const path = `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;
    return { path, midX, midY };
}


interface WorkflowCanvasProps {
    nodes: Node[];
    edges: Edge[];
    onNodeClick: (node: Node) => void;
    selectedNodeId: string | undefined | null;
    onConnectStart: (sourceId: string) => void;
    onConnectEnd: (targetId: string | null) => void;
    connectionSourceId: string | null | undefined;
}

const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(({ 
    nodes, edges, onNodeClick, selectedNodeId,
    onConnectStart, onConnectEnd, connectionSourceId 
}, ref) => {
    const { setNodeRef } = useDroppable({ id: 'canvas' });
    const [pointerPos, setPointerPos] = useState<{ x: number, y: number } | null>(null);
    
    const nodeMap = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);
    const sourceNode = connectionSourceId ? nodeMap.get(connectionSourceId) : null;

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!sourceNode || !e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    
    const combinedRef = (el: HTMLDivElement | null) => {
        if (el) {
            setNodeRef(el);
            if (typeof ref === 'function') {
                ref(el);
            } else if (ref) {
                ref.current = el;
            }
        }
    };

    return (
        <div 
            ref={combinedRef} 
            className="flex-grow bg-foreground/5 backdrop-blur-sm border border-dashed border-foreground/20 rounded-lg relative overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerUp={() => onConnectEnd(null)}
        >
             <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.5" fill="hsl(var(--muted-foreground) / 0.3)" />
                    </pattern>
                    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <g>
                    {edges.map(edge => {
                        const source = nodeMap.get(edge.source);
                        const target = nodeMap.get(edge.target);
                        if (!source || !target) return null;
                        const { path, midX, midY } = getEdgePath(source, target);
                        return (
                            <g key={edge.id}>
                                <motion.path 
                                    d={path} 
                                    stroke="url(#edge-gradient)"
                                    strokeWidth="2" 
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                                {edge.condition && (
                                    <text x={midX} y={midY - 5} fill="hsl(var(--foreground))" fontSize="10" textAnchor="middle" className="font-mono">
                                        {edge.condition === 'true' ? 'T' : 'F'}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    {sourceNode && pointerPos && (
                        <path d={getEdgePath(sourceNode, {position: pointerPos}).path} stroke="hsl(var(--primary) / 0.8)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                    )}
                </g>
            </svg>
            <AnimatePresence>
            {nodes.map(node => 
                 <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <WorkflowNodeItem 
                        node={node} 
                        onClick={onNodeClick} 
                        isSelected={selectedNodeId === node.id}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                    />
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
});
WorkflowCanvas.displayName = 'WorkflowCanvas';
export default WorkflowCanvas;
