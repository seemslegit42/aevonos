'use client';

import React from 'react';
import type { Agent, User, Workspace, Transaction } from '@prisma/client';
import StatCard from './StatCard';
import QuickAccess from './QuickAccess';
import AgentStatusList from './AgentStatusList';
import RecentActivityFeed from './RecentActivityFeed';
import { CreditCard, Users, Bot } from 'lucide-react';
import DailyBriefing from './DailyBriefing';

interface DashboardWidgetsProps {
  initialAgents: Agent[];
  workspace: (Workspace & { membersCount: number }) | null;
  initialTransactions: (Transaction & { amount: number })[];
}

export default function DashboardWidgets({ initialAgents, workspace, initialTransactions }: DashboardWidgetsProps) {
  return (
    <div className="p-4 w-full h-full max-w-7xl mx-auto flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 md:col-span-2">
                <DailyBriefing />
            </div>
            <div className="space-y-4">
                <StatCard
                    icon={CreditCard}
                    title="Credit Balance"
                    value={`${workspace?.credits ? Number(workspace.credits).toFixed(2) : '0.00'} Ξ`}
                    description="Available for Agent Actions"
                />
                 <StatCard
                    icon={Bot}
                    title="Active Agents"
                    value={initialAgents.filter(a => a.status === 'active').length}
                    description={`${initialAgents.length} agents total`}
                />
            </div>
             <div className="space-y-4">
                 <StatCard
                    icon={Users}
                    title="Team Members"
                    value={workspace?.membersCount ?? 1}
                    description="In this workspace"
                />
                <QuickAccess />
            </div>
        </div>

        <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 h-full">
                <AgentStatusList agents={initialAgents} />
            </div>
            <div className="lg:col-span-2 h-full">
                <RecentActivityFeed initialTransactions={initialTransactions} />
            </div>
        </div>
    </div>
  );
}
