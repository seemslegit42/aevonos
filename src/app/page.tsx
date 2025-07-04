

import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent, type User, type Transaction, type Workspace } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import prisma from '@/lib/prisma';
import StatCard from '@/components/dashboard/widgets/StatCard';
import AgentStatusList from '@/components/dashboard/widgets/AgentStatusList';
import RecentActivityFeed from '@/components/dashboard/widgets/RecentActivityFeed';
import { CreditCard, Users, Bot } from 'lucide-react';

export default async function Home() {
    try {
        const { user, workspace } = await getAuthenticatedUser();
        
        if (!user || !workspace) {
            // User is authenticated with Firebase but doesn't have a DB record yet.
            // Returning a placeholder div allows the client-side MainLayout to handle the redirect.
            return <div className="h-full w-full" />;
        }
    
        const [agents, initialTransactions, membersCount] = await Promise.all([
            prisma.agent.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: 'asc' } }),
            prisma.transaction.findMany({ 
                where: { workspaceId: workspace.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.user.count({ where: { workspaces: { some: { id: workspace.id } } } })
        ]);
        
        // Convert Decimal to number for client-side serialization
        const initialTransactionsWithNumbers = initialTransactions.map(tx => ({
            ...tx,
            amount: tx.amount.toNumber(),
        }));

        const workspaceWithCount = { ...workspace, membersCount };

        return (
            <div className="h-full">
                <DashboardView 
                    initialAgents={agents} 
                    user={user} 
                    workspace={workspaceWithCount} 
                    initialTransactions={initialTransactionsWithNumbers}
                />
            </div>
        );

    } catch (error) {
        // This will catch the 'Unauthorized' error from getAuthenticatedUser if no session cookie exists.
        // Returning a placeholder div allows the client-side MainLayout to handle redirecting to /login.
        return <div className="h-full w-full" />;
    }
}
