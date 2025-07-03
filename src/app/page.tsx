
import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';

export default async function Home() {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        
        if (!user || !workspace) {
            // User is authenticated with Firebase but doesn't have a DB record yet.
            // Returning null lets the client-side MainLayout handle the redirect to onboarding.
            return null;
        }
    
        // Fetch only the agents needed for the SystemWeave background.
        const agents = await prisma.agent.findMany({ where: { workspaceId: workspace.id } });
    
        return (
            <div className="h-full">
                <DashboardView initialAgents={agents} />
            </div>
        );

    } catch (error) {
        // This will catch the 'Unauthorized' error from getAuthenticatedUser if no session cookie exists.
        // Returning null allows the client-side MainLayout to handle redirecting to /login.
        return null;
    }
}
