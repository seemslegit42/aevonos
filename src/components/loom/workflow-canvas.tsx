
'use client';

import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { Node, Edge } from '@/app/loom/page';
import { Bot, PlayCircle, GitBranch, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WinstonWolfeIcon } from '../icons/WinstonWolfeIcon';
import { KifKrokerIcon } from '../icons/KifKrokerIcon';
import { VandelayIcon } from '../icons/VandelayIcon';
import { DrSyntaxIcon } from '../icons/DrSyntaxIcon';
import { AddressBookIcon } from '../icons/AddressBookIcon';
import { CrystalIcon } from '../icons/CrystalIcon';

const nodeIcons: Record<string, React.ComponentType<any>> = {
    trigger: PlayCircle,
    agent: Bot,
    logic: GitBranch,
    'tool-winston-wolfe': WinstonWolfeIcon,
    'tool-kif-kroker': KifKrokerIcon,
    'tool-vandelay': VandelayIcon,
    'tool-dr-syntax': DrSyntaxIcon,
    'tool-crm': AddressBookIcon,
    'tool-final-answer': CrystalIcon,
};

function WorkflowNodeItem({ node, onClick, isSelected }: { node: Node, onClick: (node: Node) => void, isSelected: boolean }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: node.id,
    });

    const style = {
        position: 'absolute' as 'absolute',
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 10 : 1,
    };

    const Icon = nodeIcons[node.type] || CrystalIcon;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={() => onClick(node)}>
            <div className={cn(
                "w-48 rounded-lg shadow-lg bg-foreground/15 backdrop-blur-[20px] border border-foreground/30 hover:border-primary transition-all duration-300 flex flex-col group cursor-grab",
                isSelected && "border-primary ring-2 ring-primary"
            )}>
                <div className="flex items-center gap-2 p-2 border-b border-foreground/20">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    <p className="text-xs font-bold text-foreground truncate">{node.data.label}</p>
                </div>
                <div className="p-2 text-xs text-muted-foreground">
                    <p>Type: {node.type}</p>
                </div>
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent border-2 border-background ring-1 ring-inset ring-background" title="Input"/>
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent border-2 border-background ring-1 ring-inset ring-background" title="Output"/>
            </div>
        </div>
    );
}

const getEdgePath = (sourceNode: Node, targetNode: Node) => {
    if (!sourceNode || !targetNode) return '';
    const sourceHandleWidth = 12;
    const nodeWidth = 192; // w-48
    const nodeHeight = 60; // approximate height

    const sourceX = sourceNode.position.x + nodeWidth + (sourceHandleWidth/2) - 4; 
    const sourceY = sourceNode.position.y + nodeHeight / 2;
    const targetX = targetNode.position.x - (sourceHandleWidth/2) + 4;
    const targetY = targetNode.position.y + nodeHeight / 2;

    const dx = targetX - sourceX;
    const curve = Math.abs(dx) * 0.5;

    return `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;
}

export default function WorkflowCanvas({ nodes, edges, onNodeClick, selectedNodeId }: { nodes: Node[], edges: Edge[], onNodeClick: (node: Node) => void, selectedNodeId: string | undefined | null }) {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    const nodeMap = React.useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);

    return (
        <div ref={setNodeRef} className="flex-grow bg-foreground/5 backdrop-blur-sm border border-dashed border-foreground/20 rounded-lg relative overflow-hidden">
             <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="hsl(var(--muted-foreground) / 0.3)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <g>
                    {edges.map(edge => {
                        const sourceNode = nodeMap.get(edge.source);
                        const targetNode = nodeMap.get(edge.target);
                        if (!sourceNode || !targetNode) return null;

                        const path = getEdgePath(sourceNode, targetNode);
                        return <path key={edge.id} d={path} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" fill="none" />;
                    })}
                </g>
            </svg>
            {nodes.map(node => <WorkflowNodeItem key={node.id} node={node} onClick={onNodeClick} isSelected={selectedNodeId === node.id} />)}
        </div>
    );
}
