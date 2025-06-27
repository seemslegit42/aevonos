
'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Bot, PlayCircle, GitBranch, Hammer, LucideProps } from 'lucide-react';

export type NodeType = 'trigger' | 'agent' | 'logic' | 'tool';

interface NodeInfo {
    type: NodeType;
    label: string;
    description: string;
    icon: React.FC<LucideProps>;
}

const nodeTypes: NodeInfo[] = [
    { type: 'trigger', label: 'Trigger', description: 'Starts a workflow', icon: PlayCircle },
    { type: 'agent', label: 'Agent Action', description: 'Perform an AI task', icon: Bot },
    { type: 'logic', label: 'Logic', description: 'Branch your workflow', icon: GitBranch },
    { type: 'tool', label: 'Tool', description: 'Use a system tool', icon: Hammer },
];

function DraggableNode({ info }: { info: NodeInfo }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `draggable-${info.type}`,
        data: { type: info.type, label: info.label, isDraggableNode: true },
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes}>
            <Card className="bg-background/50 hover:bg-accent hover:text-accent-foreground cursor-grab transition-colors p-3">
                <div className="flex items-center gap-3">
                    <info.icon className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-bold">{info.label}</p>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}


export default function NodesSidebar() {
  return (
    <div className="w-64 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 flex-col gap-4 hidden md:flex">
      <h2 className="font-headline text-lg text-foreground">Nodes</h2>
      <p className="text-xs text-muted-foreground -mt-3">Drag nodes onto the canvas to build.</p>
      <div className="flex flex-col gap-3 mt-2">
        {nodeTypes.map(info => <DraggableNode key={info.type} info={info} />)}
      </div>
    </div>
  );
}
