

'use client';

import React, { useMemo } from 'react';
import type { Agent, User, Workspace, Transaction } from '@prisma/client';
import StatCard from './stat-card';
import QuickAccess from './quick-access';
import AgentStatusList from './agent-status-list';
import RecentActivityFeed from './recent-activity-feed';
import { CreditCard, Users, Bot } from 'lucide-react';
import DailyBriefing from './DailyBriefing';
import { type DailyBriefingOutput } from '@/ai/agents/briefing-schemas';

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
    agents, workspace, transactions, 
    briefing, isLoading, error, onRefresh 
}: DashboardWidgetsProps) {
  const activeAgentCount = useMemo(() => agents.filter(a => a.status === 'active').length, [agents]);
  const totalAgentCount = useMemo(() => agents.length, [agents]);
  const creditBalance = useMemo(() => workspace?.credits ? Number(workspace.credits).toFixed(2) : '0.00', [workspace]);
  const membersCount = useMemo(() => workspace?.membersCount ?? 1, [workspace]);

  return (
    <div className="p-4 w-full h-full max-w-7xl mx-auto flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 md:col-span-2">
                <DailyBriefing 
                    briefing={briefing}
                    isLoading={isLoading && !briefing}
                    error={error}
                />
            </div>
            <div className="space-y-4">
                <StatCard
                    icon={CreditCard}
                    title="Credit Balance"
                    value={`${creditBalance} Ξ`}
                    description="Available for Agent Actions"
                    loading={isLoading && !workspace}
                />
                 <StatCard
                    icon={Bot}
                    title="Active Agents"
                    value={activeAgentCount}
                    description={`${totalAgentCount} agents total`}
                    loading={isLoading && agents.length === 0}
                />
            </div>
             <div className="space-y-4">
                 <StatCard
                    icon={Users}
                    title="Team Members"
                    value={membersCount}
                    description="In this workspace"
                    loading={isLoading && !workspace}
                />
                <QuickAccess />
            </div>
        </div>

        <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 h-full">
                <AgentStatusList agents={agents} isLoading={isLoading && agents.length === 0} />
            </div>
            <div className="lg:col-span-2 h-full">
                <RecentActivityFeed 
                    transactions={transactions} 
                    isLoading={isLoading} 
                    error={error}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    </div>
  );
}
