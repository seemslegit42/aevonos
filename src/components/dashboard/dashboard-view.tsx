
'use client';

import React from 'react';
import { type Agent as AgentData, type User } from '@prisma/client';
import { MicroAppGrid } from '../micro-app-grid';
import { useAppStore } from '@/store/app-store';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import SystemWeave from './system-weave';
import PulseNarrativeDisplay from './pulse-narrative-display';

interface DashboardViewProps {
  initialAgents: AgentData[];
  user: User | null;
}

export default function DashboardView({ initialAgents, user }: DashboardViewProps) {
  const { apps, handleDragEnd } = useAppStore();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  return (
    <div className="relative h-full w-full">
      <SystemWeave initialAgents={initialAgents} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <MicroAppGrid apps={apps} user={user} />
      </DndContext>
      <PulseNarrativeDisplay />
    </div>
  );
}
