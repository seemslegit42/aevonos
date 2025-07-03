
import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function Home() {
    const { user, workspace } = await getAuthenticatedUser().catch((err) => {
        console.error("Failed to get authenticated user on home page:", err.message);
        return { user: null, workspace: null };
    });

    if (!user || !workspace) {
        redirect('/login');
    }
    
    // Fetch only the agents needed for the SystemWeave background.
    const agents = await prisma.agent.findMany({ where: { workspaceId: workspace.id } });
    
    return (
        <div className="h-full">
            <DashboardView initialAgents={agents} />
        </div>
    );
}
