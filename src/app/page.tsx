import React from 'react';
import prisma from '@/lib/prisma';
import { getServerActionSession } from '@/lib/auth';
import DashboardClient from '@/components/dashboard/dashboard-client';

async function getAgents(workspaceId: string) {
    try {
        const agents = await prisma.agent.findMany({
            where: { workspaceId }
        });
        return agents;
    } catch (error) {
        console.error("Failed to fetch agents:", error);
        return [];
    }
}

export default async function Home() {
    const session = await getServerActionSession();
    // Fetch initial agents server-side.
    // If there's no session, we'll pass an empty array, and the client will show the empty state.
    const agents = session?.workspaceId ? await getAgents(session.workspaceId) : [];

    return (
        <div className="h-full">
            <DashboardClient initialAgents={agents} />
        </div>
    );
}
