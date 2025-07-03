
import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';

export default async function Home() {
    const { user, workspace } = await getAuthenticatedUser().catch((err) => {
        console.error("Failed to get authenticated user on home page:", err.message);
        return { user: null, workspace: null };
    });

    // If auth fails, return null. The client-side redirect in MainLayout will handle it.
    // This prevents a server-side redirect from conflicting with the client-side auth flow.
    if (!user || !workspace) {
        return null;
    }
    
    // Fetch only the agents needed for the SystemWeave background.
    const agents = await prisma.agent.findMany({ where: { workspaceId: workspace.id } });
    
    return (
        <div className="h-full">
            <DashboardView initialAgents={agents} />
        </div>
    );
}
