
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
import { DailyBriefingOutput } from '@/ai/agents/briefing-schemas';

const SystemWeave = dynamic(() => import('./system-weave'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10" />,
});

interface DashboardViewProps {
  initialAgents: AgentData[];
  user: User | null;
  workspace: (Workspace & { membersCount: number }) | null;
  initialTransactions: (Transaction & { amount: number })[];
  initialEconomyStats: { totalCreditsBurned: number } | null;
  initialBriefing: DailyBriefingOutput | null;
}

export default function DashboardView({ 
    initialAgents, 
    user, 
    workspace, 
    initialTransactions,
    initialEconomyStats,
    initialBriefing
}: DashboardViewProps) {
  const apps = useAppStore((state) => state.apps);
  const handleDragEnd = useAppStore((state) => state.handleDragEnd);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const { toast } = useToast();

  const [agents, setAgents] = useState<AgentData[]>(initialAgents);
  const [transactions, setTransactions] = useState<(Transaction & { amount: number })[]>(initialTransactions);
  const [economyStats, setEconomyStats] = useState<{ totalCreditsBurned: number } | null>(initialEconomyStats);
  const [briefing, setBriefing] = useState<DailyBriefingOutput | null>(initialBriefing);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const [agentsRes, txRes, economyStatsRes, briefingRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/billing/transactions'),
        fetch('/api/workspaces/me/economy-stats'),
        fetch('/api/briefing')
      ]);

      if (!agentsRes.ok) throw new Error('Failed to fetch agent status.');
      if (!txRes.ok) throw new Error('Failed to fetch transaction history.');
      if (!economyStatsRes.ok) throw new Error('Failed to fetch economy stats.');
      if (!briefingRes.ok) throw new Error('Failed to fetch daily briefing.');
      
      const agentsData = await agentsRes.json();
      const txData = await txRes.json();
      const economyData = await economyStatsRes.json();
      const briefingData = await briefingRes.json();

      setAgents(agentsData);
      setTransactions(txData);
      setEconomyStats(economyData);
      setBriefing(briefingData);

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
      <SystemWeave 
        initialAgents={agents}
        totalCreditsBurned={economyStats?.totalCreditsBurned ?? 0}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <MicroAppGrid 
            apps={apps} 
            user={user} 
        >
           <DashboardWidgets 
                agents={agents} 
                workspace={workspace} 
                transactions={transactions}
                briefing={briefing}
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
