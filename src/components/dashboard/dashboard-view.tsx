
'use client';

import React from 'react';
import { type User, type Workspace, type Agent, type Transaction } from '@prisma/client';
import { MicroAppGrid } from '../micro-app-grid';
import { useAppStore } from '@/store/app-store';
import StatCard from './widgets/stat-card';
import { User as UserIcon, Bot, CircleDollarSign, Activity, HardHat } from 'lucide-react';
import AgentStatusList from './widgets/agent-status-list';
import QuickAccess from './widgets/quick-access';
import RecentActivityFeed from './widgets/recent-activity-feed';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

interface DashboardViewProps {
  initialData: {
    user: User | null;
    workspace: (Workspace & { credits: number }) | null;
    agents: Agent[];
    transactions: (Transaction & { amount: number, tributeAmount: number | null, boonAmount: number | null })[];
  };
}

export default function DashboardView({ initialData }: DashboardViewProps) {
  const { apps, handleDragEnd } = useAppStore();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  return (
    <div className="relative h-full w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* The grid for widgets and the main canvas */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-4">
          <div className="col-span-12 row-span-6 lg:col-span-3 lg:row-span-6 z-10 pointer-events-auto">
            <div className="h-full w-full grid grid-rows-3 gap-4">
              <StatCard
                icon={UserIcon}
                title={initialData.user?.firstName || 'Operator'}
                value={initialData.user?.role || 'OPERATOR'}
                description="Current User & Role"
              />
              <StatCard
                icon={HardHat}
                title={initialData.workspace?.name || 'Primary Canvas'}
                value={`${Number(initialData.workspace?.credits ?? 0).toFixed(2)} Ξ`}
                description="Workspace & Credit Balance"
              />
              <AgentStatusList agents={initialData.agents} />
            </div>
          </div>

          {/* Main MicroApp Grid in the center */}
          <div className="col-span-12 row-span-6 lg:col-span-6 lg:row-span-6 relative -m-4">
              <MicroAppGrid apps={apps} />
          </div>

          <div className="col-span-12 row-span-6 lg:col-span-3 lg:row-span-6 z-10 pointer-events-auto">
             <div className="h-full w-full grid grid-rows-3 gap-4">
                <QuickAccess />
                <div className="row-span-2">
                    <RecentActivityFeed transactions={initialData.transactions} />
                </div>
             </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
