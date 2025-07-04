
'use client';

import React from 'react';
import type { Agent, User, Workspace, Transaction } from '@prisma/client';
import StatCard from './StatCard';
import QuickAccess from './QuickAccess';
import AgentStatusList from './AgentStatusList';
import RecentActivityFeed from './RecentActivityFeed';
import { CreditCard, Users, Bot } from 'lucide-react';

interface DashboardWidgetsProps {
  initialAgents: Agent[];
  workspace: (Workspace & { membersCount: number }) | null;
  initialTransactions: (Transaction & { amount: number })[];
}

export default function DashboardWidgets({ initialAgents, workspace, initialTransactions }: DashboardWidgetsProps) {
  return (
    <div className="p-4 w-full h-full max-w-7xl mx-auto overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={CreditCard}
          title="Credit Balance"
          value={`${workspace?.credits ? Number(workspace.credits).toFixed(2) : '0.00'} Ξ`}
          description="Available for Agent Actions"
        />
        <StatCard
          icon={Users}
          title="Team Members"
          value={workspace?.membersCount ?? 1}
          description="In this workspace"
        />
        <StatCard
          icon={Bot}
          title="Active Agents"
          value={initialAgents.filter(a => a.status === 'active').length}
          description={`${initialAgents.length} agents total`}
        />
        <QuickAccess />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100% - 120px)' }}>
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
