
import React from 'react';
import { getSession } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { type Agent as AgentData, AgentStatus } from '@prisma/client';


async function getAgents(workspaceId: string): Promise<AgentData[]> {
    try {
        // This function is now mocked to prevent database errors during UI development.
        return [
            { id: 'agent-1', name: 'Reputation Management', type: 'winston-wolfe', description: 'Solves online reputation problems.', status: AgentStatus.active, workspaceId: workspaceId, configuration: {}, createdAt: new Date(), updatedAt: new Date() },
            { id: 'agent-2', name: 'Morale Monitor', type: 'kif-kroker', description: 'Monitors team communications for morale.', status: AgentStatus.idle, workspaceId: workspaceId, configuration: {}, createdAt: new Date(), updatedAt: new Date() },
            { id: 'agent-3', name: 'Compliance Scanner', type: 'sterileish', description: 'Scans logs for compliance issues.', status: AgentStatus.processing, workspaceId: workspaceId, configuration: {}, createdAt: new Date(), updatedAt: new Date() },
            { id: 'agent-4', name: 'Recruiting Assistant', type: 'rolodex', description: 'Analyzes candidates and generates outreach.', status: AgentStatus.paused, workspaceId: workspaceId, configuration: {}, createdAt: new Date(), updatedAt: new Date() },
            { id: 'agent-5', name: 'Security Analyst', type: 'lahey-surveillance', description: 'Investigates suspicious activity.', status: AgentStatus.error, workspaceId: workspaceId, configuration: {}, createdAt: new Date(), updatedAt: new Date() },
        ];
    } catch (error) {
        console.error("Failed to fetch agents:", error);
        return [];
    }
}

export default async function Home() {
    const session = await getSession();
    // Fetch initial agents server-side.
    // If there's no session, we'll pass an empty array, and the client will show the empty state.
    const agents = session?.workspaceId ? await getAgents(session.workspaceId) : [];

    return (
        <div className="h-full">
            <DashboardClient initialAgents={agents} />
        </div>
    );
}
