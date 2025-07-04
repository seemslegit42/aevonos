
'use client';

import React from 'react';
import { type Agent as AgentData, type User, type Workspace, Transaction } from '@prisma/client';
import { MicroAppGrid } from '../micro-app-grid';
import { useAppStore } from '@/store/app-store';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import PulseNarrativeDisplay from './pulse-narrative-display';
import dynamic from 'next/dynamic';

const SystemWeave = dynamic(() => import('./system-weave'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10" />,
});


interface DashboardViewProps {
  initialAgents: AgentData[];
  user: User | null;
  workspace: (Workspace & { membersCount: number }) | null;
  recentTransactions: (Transaction & { amount: number })[];
}

export default function DashboardView({ initialAgents, user, workspace, recentTransactions }: DashboardViewProps) {
  const { apps, handleDragEnd } = useAppStore();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  return (
    <div className="relative h-full w-full">
      <SystemWeave initialAgents={initialAgents} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <MicroAppGrid 
            apps={apps} 
            user={user} 
            initialAgents={initialAgents} 
            workspace={workspace} 
            recentTransactions={recentTransactions} 
        />
      </DndContext>
      <PulseNarrativeDisplay />
    </div>
  );
}
