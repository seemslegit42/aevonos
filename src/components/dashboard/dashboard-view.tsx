
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { type Agent as AgentData, type User, type Workspace, Transaction } from '@prisma/client';
import { MicroAppGrid } from '../micro-app-grid';
import { useAppStore } from '@/store/app-store';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import PulseNarrativeDisplay from './pulse-narrative-display';
import dynamic from 'next/dynamic';
import DashboardWidgets from './widgets/DashboardWidgets';
import { useToast } from '@/hooks/use-toast';

const SystemWeave = dynamic(() => import('./system-weave'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10" />,
});

interface DashboardViewProps {
  initialAgents: AgentData[];
  user: User | null;
  workspace: (Workspace & { membersCount: number }) | null;
  initialTransactions: (Transaction & { amount: number })[];
}

export default function DashboardView({ initialAgents, user, workspace, initialTransactions }: DashboardViewProps) {
  const apps = useAppStore((state) => state.apps);
  const handleDragEnd = useAppStore((state) => state.handleDragEnd);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const { toast } = useToast();

  const [agents, setAgents] = useState<AgentData[]>(initialAgents);
  const [transactions, setTransactions] = useState<(Transaction & { amount: number })[]>(initialTransactions);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const [agentsRes, txRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/billing/transactions'),
      ]);

      if (!agentsRes.ok) throw new Error('Failed to fetch agent status.');
      if (!txRes.ok) throw new Error('Failed to fetch transaction history.');
      
      const agentsData = await agentsRes.json();
      const txData = await txRes.json();

      setAgents(agentsData);
      setTransactions(txData);

    } catch (err: any) {
        setError(err.message);
        toast({ variant: 'destructive', title: 'Dashboard Refresh Failed', description: err.message });
    } finally {
        setIsLoadingData(false);
    }
  }, [toast]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(() => {
        fetchDashboardData();
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="relative h-full w-full">
      <SystemWeave initialAgents={agents} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <MicroAppGrid 
            apps={apps} 
            user={user} 
        >
           <DashboardWidgets 
                agents={agents} 
                workspace={workspace} 
                transactions={transactions}
                isLoading={isLoadingData}
                error={error}
                onRefresh={fetchDashboardData}
            />
        </MicroAppGrid>
      </DndContext>
      <PulseNarrativeDisplay />
    </div>
  );
}
