
import DashboardView from '@/components/dashboard/dashboard-view';
import { type User, type Workspace, type Agent, type Transaction } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export default async function Home() {
    const { user, workspace } = await getAuthenticatedUser().catch((err) => {
        console.error("Failed to get authenticated user on home page:", err.message);
        return { user: null, workspace: null };
    });

    if (!user || !workspace) {
        redirect('/login');
    }
    
    // Fetch agents and transactions directly on the server.
    const [agents, transactions] = await Promise.all([
        prisma.agent.findMany({ where: { workspaceId: workspace.id } }),
        prisma.transaction.findMany({ 
            where: { workspaceId: workspace.id }, 
            orderBy: { createdAt: 'desc' }, 
            take: 20 
        })
    ]);

    const serializedTransactions = transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        tributeAmount: tx.tributeAmount ? Number(tx.tributeAmount) : null,
        boonAmount: tx.boonAmount ? Number(tx.boonAmount) : null,
    }));
    
    const initialData = {
        user: user,
        workspace: { ...workspace, credits: Number(workspace.credits) },
        agents,
        transactions: serializedTransactions,
    };
    
    return (
        <div className="h-full">
            <DashboardView initialData={initialData} />
        </div>
    );
}
