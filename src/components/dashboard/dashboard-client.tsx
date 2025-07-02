'use client';

import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import MicroAppGrid from '@/components/micro-app-grid';
import { useAppStore } from '@/store/app-store';
import SystemWeave from '@/components/dashboard/system-weave';
import { type Agent as AgentData } from '@prisma/client';

interface DashboardClientProps {
    initialAgents: AgentData[];
}

export default function DashboardClient({ initialAgents }: DashboardClientProps) {
    const { apps, handleDragEnd } = useAppStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    return (
        <div className="relative h-full">
            <SystemWeave initialAgents={initialAgents} />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <MicroAppGrid apps={apps} />
            </DndContext>
        </div>
    );
}
