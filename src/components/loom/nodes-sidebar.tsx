
'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot, PlayCircle, GitBranch, LucideProps, Gem } from 'lucide-react';
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
import { OrpheanOracleIcon } from '../icons/OrpheanOracleIcon';
import { RitualQuestsIcon } from '../icons/RitualQuestsIcon';
import { InfidelityRadarIcon } from '../icons/InfidelityRadarIcon';
import type { NodeType } from './types';
import { ScrollArea } from '../ui/scroll-area';


interface NodeInfo {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<LucideProps> | React.FC<React.SVGProps<SVGSVGElement>>;
}

const nodeTypes: NodeInfo[] = [
    // Core Logic
    { type: 'trigger', label: 'BEEP Trigger', description: 'Starts workflow from BEEP', icon: PlayCircle },
    { type: 'agent', label: 'BEEP Kernel', description: 'Central LangGraph orchestrator', icon: Bot },
    { type: 'logic', label: 'Conditional Logic', description: 'Branch your workflow', icon: GitBranch },
    { type: 'tool-final-answer', label: 'Final Answer', description: 'Outputs final response', icon: CrystalIcon },
    // Specialist Agents & Tools
    { type: 'tool-auditor', label: 'Auditor Generalissimo', description: 'Audits finances with prejudice', icon: AuditorGeneralissimoIcon },
    { type: 'tool-barbara', label: 'Agent Barbara', description: 'Processes documents', icon: BarbaraIcon },
    { type: 'tool-wingman', label: 'BEEP Wingman', description: 'Crafts social messages', icon: BeepWingmanIcon },
    { type: 'tool-burn_bridge_protocol', label: 'Burn Bridge Protocol', description: 'Full investigation agent', icon: InfidelityRadarIcon },
    { type: 'tool-crm_agent', label: 'CRM Agent', description: 'Manages contacts', icon: AddressBookIcon },
    { type: 'tool-dr_syntax', label: 'Dr. Syntax', description: 'Critiques content harshly', icon: DrSyntaxIcon },
    { type: 'tool-foremanator', label: 'Foremanator', description: 'Processes site logs', icon: ForemanatorIcon },
    { type: 'tool-inventory_daemon', label: 'Inventory Daemon', description: 'Manages stock & POs', icon: Bot },
    { type: 'tool-jroc', label: 'J-ROC Biz Kit', description: 'Generates business kits', icon: JrocIcon },
    { type: 'tool-kendra', label: 'KENDRA.exe', description: 'Generates marketing campaigns', icon: KendraIcon },
    { type: 'tool-kif_kroker', label: 'Kif Kroker', description: 'Analyzes team comms', icon: KifKrokerIcon },
    { type: 'tool-lahey_surveillance', label: 'Lahey Surveillance', description: 'Investigates logs', icon: LaheyIcon },
    { type: 'tool-lumbergh', label: 'Project Lumbergh', description: 'Analyzes meeting invites', icon: LumberghIcon },
    { type: 'tool-lucille_bluth', label: 'Lucille Bluth', description: 'Judges expenses', icon: LucilleBluthIcon },
    { type: 'tool-orphean_oracle', label: 'Orphean Oracle', description: 'Generates data narratives', icon: OrpheanOracleIcon },
    { type: 'tool-pam_poovey', label: 'Pam Poovey', description: 'Generates HR rants', icon: PamPooveyIcon },
    { type: 'tool-paper_trail', label: 'Paper Trail', description: 'Scans evidence', icon: PaperTrailIcon },
    { type: 'tool-patrickt_app', label: 'Patrickt App', description: 'Manages personal chaos', icon: PatricktIcon },
    { type: 'tool-reno_mode', label: 'Reno Mode', description: 'Analyzes car shame', icon: RenoModeIcon },
    { type: 'tool-ritual_quests', label: 'Ritual Quests', description: 'Generates user quests', icon: RitualQuestsIcon },
    { type: 'tool-rolodex', label: 'Rolodex', description: 'Analyzes candidates', icon: RolodexIcon },
    { type: 'tool-sterileish', label: 'STERILE-ish', description: 'Analyzes compliance logs', icon: SterileishIcon },
    { type: 'tool-stonks_bot', label: 'Stonks Bot', description: 'Gives "financial advice"', icon: StonksIcon },
    { type: 'tool-vandelay', label: 'Vandelay', description: 'Generates alibis', icon: VandelayIcon },
    { type: 'tool-vault_daemon', label: 'Vault Daemon', description: 'Answers financial questions', icon: Gem },
    { type: 'tool-vin_diesel', label: 'VIN Diesel', description: 'Validates VINs', icon: VinDieselIcon },
    { type: 'tool-winston_wolfe', label: 'Winston Wolfe', description: 'Solves reputation problems', icon: WinstonWolfeIcon },
];


function DraggableNode({ info }: { info: NodeInfo }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `draggable-${info.type}`,
        data: { type: info.type, label: info.label, isDraggableNode: true },
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes}>
            <Card className="bg-background/50 hover:bg-accent hover:text-accent-foreground cursor-grab transition-colors">
                <CardHeader className="p-2 flex-row items-center gap-3 space-y-0">
                    <info.icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm font-bold">{info.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                </CardContent>
            </Card>
        </div>
    );
}


export default function NodesSidebar() {
  return (
    <div className="w-full h-full bg-foreground/10 backdrop-blur-xl p-4 flex flex-col gap-4">
      <h2 className="font-headline text-lg text-foreground">Nodes</h2>
      <p className="text-xs text-muted-foreground -mt-3">Drag nodes onto the canvas to build.</p>
      <ScrollArea className="flex-grow -mr-4 pr-4">
        <div className="flex flex-col gap-3 mt-2">
            {nodeTypes.map(info => <DraggableNode key={info.type} info={info} />)}
        </div>
      </ScrollArea>
    </div>
  );
}
