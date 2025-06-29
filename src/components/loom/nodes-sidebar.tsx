
'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Bot, PlayCircle, GitBranch, LucideProps } from 'lucide-react';
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
import type { NodeType } from './types';


interface NodeInfo {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<LucideProps> | React.FC<React.SVGProps<SVGSVGElement>>;
}

const nodeTypes: NodeInfo[] = [
    { type: 'trigger', label: 'BEEP Trigger', description: 'Starts workflow from BEEP', icon: PlayCircle },
    { type: 'agent', label: 'BEEP Kernel', description: 'Central LangGraph orchestrator', icon: Bot },
    { type: 'logic', label: 'Conditional Logic', description: 'Branch your workflow', icon: GitBranch },
    { type: 'tool-winston-wolfe', label: 'Winston Wolfe', description: 'Solves reputation problems', icon: WinstonWolfeIcon },
    { type: 'tool-kif-kroker', label: 'Kif Kroker', description: 'Analyzes team comms', icon: KifKrokerIcon },
    { type: 'tool-vandelay', label: 'Vandelay', description: 'Generates alibis', icon: VandelayIcon },
    { type: 'tool-rolodex', label: 'Rolodex', description: 'Analyzes candidates', icon: RolodexIcon },
    { type: 'tool-dr-syntax', label: 'Dr. Syntax', description: 'Critiques content harshly', icon: DrSyntaxIcon },
    { type: 'tool-jroc', label: 'J-ROC', description: 'Generates business kits', icon: JrocIcon },
    { type: 'tool-lahey', label: 'Lahey', description: 'Investigates logs', icon: LaheyIcon },
    { type: 'tool-foremanator', label: 'Foremanator', description: 'Processes site logs', icon: ForemanatorIcon },
    { type: 'tool-sterileish', label: 'STERILE-ish', description: 'Analyzes compliance logs', icon: SterileishIcon },
    { type: 'tool-barbara', label: 'Agent Barbara', description: 'Processes documents', icon: BarbaraIcon },
    { type: 'tool-crm', label: 'CRM Tool', description: 'Manages contacts', icon: AddressBookIcon },
    { type: 'tool-paper-trail', label: 'Paper Trail', description: 'Scans evidence', icon: PaperTrailIcon },
    { type: 'tool-final-answer', label: 'Final Answer', description: 'Outputs final response', icon: CrystalIcon },
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
                    <info.icon className="h-6 w-6 text-primary flex-shrink-0" />
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
    <div className="w-72 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border border-foreground/20 rounded-lg p-4 flex-col gap-4 hidden md:flex">
      <h2 className="font-headline text-lg text-foreground">Nodes</h2>
      <p className="text-xs text-muted-foreground -mt-3">Drag nodes onto the canvas to build.</p>
      <div className="flex flex-col gap-3 mt-2 overflow-y-auto">
        {nodeTypes.map(info => <DraggableNode key={info.type} info={info} />)}
      </div>
    </div>
  );
}
