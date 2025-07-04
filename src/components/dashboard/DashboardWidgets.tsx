
'use client';

import React from 'react';
import AgentStatusWidget from './AgentStatusWidget';
import DailyBriefingWidget from './DailyBriefingWidget';
import EconomyStatsWidget from './EconomyStatsWidget';
import RecentActivityFeed from './RecentActivityFeed';
import { type Agent, type Transaction, type Workspace } from '@prisma/client';
import type { DailyBriefingOutput } from '@/ai/agents/briefing-schemas';

interface DashboardWidgetsProps {
  agents: Agent[];
  workspace: (Workspace & { membersCount: number }) | null;
  transactions: (Transaction & { amount: number })[];
  briefing: DailyBriefingOutput | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function DashboardWidgets({
  agents,
  workspace,
  transactions,
  briefing,
  isLoading,
  error,
  onRefresh,
}: DashboardWidgetsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 h-full">
      <div className="lg:col-span-2 xl:col-span-3">
        <DailyBriefingWidget briefing={briefing} isLoading={isLoading} error={error} onRefresh={onRefresh} />
      </div>
      <div className="lg:col-span-2 xl:col-span-1">
        <EconomyStatsWidget stats={{
            agents: agents.length,
            members: workspace?.membersCount || 0,
            credits: workspace?.credits ? Number(workspace.credits) : 0
        }} isLoading={isLoading} />
      </div>
       <div className="lg:col-span-2">
         <AgentStatusWidget agents={agents} isLoading={isLoading} />
       </div>
       <div className="lg:col-span-2">
        <RecentActivityFeed transactions={transactions} isLoading={isLoading} />
       </div>
    </div>
  );
}
