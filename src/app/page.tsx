
import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent, type User } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';

export default async function Home() {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        
        if (!user || !workspace) {
            // User is authenticated with Firebase but doesn't have a DB record yet.
            // Returning a placeholder div allows the client-side MainLayout to handle the redirect.
            return <div className="h-full w-full" />;
        }
    
        // Fetch only the agents needed for the SystemWeave background.
        const agents = await prisma.agent.findMany({ where: { workspaceId: workspace.id } });
    
        return (
            <div className="h-full">
                <DashboardView initialAgents={agents} user={user} />
            </div>
        );

    } catch (error) {
        // This will catch the 'Unauthorized' error from getAuthenticatedUser if no session cookie exists.
        // Returning a placeholder div allows the client-side MainLayout to handle redirecting to /login.
        return <div className="h-full w-full" />;
    }
}
