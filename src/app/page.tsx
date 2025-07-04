

import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent, type User, type Transaction, type Workspace } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';
import { getWorkspaceTransactions, getEconomyStats } from '@/services/ledger-service';
import { generateDailyBriefing } from '@/ai/agents/briefing-agent';
import { DailyBriefingOutput } from '@/ai/agents/briefing-schemas';


export default async function Home() {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        
        if (!user || !workspace) {
            // User is authenticated with Firebase but doesn't have a DB record yet.
            // Returning a placeholder div allows the client-side MainLayout to handle the redirect.
            return <div className="h-full w-full" />;
        }
    
        const [agents, initialTransactions, membersCount, economyStats, initialBriefing] = await Promise.all([
            prisma.agent.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: 'asc' } }),
            getWorkspaceTransactions(workspace.id, 10),
            prisma.user.count({ where: { workspaces: { some: { id: workspace.id } } } }),
            getEconomyStats(workspace.id),
            generateDailyBriefing({ workspaceId: workspace.id, userId: user.id, userFirstName: user.firstName || 'Architect' }).catch(err => {
                console.error("Failed to fetch initial briefing:", err);
                return null;
            }) as Promise<DailyBriefingOutput | null>
        ]);
        
        const workspaceWithCount = { ...workspace, membersCount };

        return (
            <div className="h-full">
                <DashboardView 
                    initialAgents={agents} 
                    user={user} 
                    workspace={workspaceWithCount} 
                    initialTransactions={initialTransactions}
                    initialEconomyStats={economyStats}
                    initialBriefing={initialBriefing}
                />
            </div>
        );

    } catch (error) {
        // This will catch the 'Unauthorized' error from getAuthenticatedUser if no session cookie exists.
        // Returning a placeholder div allows the client-side MainLayout to handle redirecting to /login.
        return <div className="h-full w-full" />;
    }
}
