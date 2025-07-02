
import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import DashboardView from '@/components/dashboard/dashboard-view';
import { type Agent, type Transaction, Prisma } from '@prisma/client';

export default async function Home() {
    const session = await getSession();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const [workspace, agents, transactions] = await Promise.all([
        prisma.workspace.findUnique({
            where: { id: session.user.workspaceId },
        }),
        prisma.agent.findMany({
            where: { workspaceId: session.user.workspaceId },
            orderBy: { name: 'asc' },
        }),
        prisma.transaction.findMany({
            where: { workspaceId: session.user.workspaceId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        })
    ]);

    if (!workspace) {
        // This case should ideally not happen if user has a session
        redirect('/login');
    }

    // We need to serialize Prisma Decimal types for the client component
    const serializedWorkspace = workspace ? { ...workspace, credits: Number(workspace.credits) } : null;
    const serializedTransactions = transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        tributeAmount: tx.tributeAmount ? Number(tx.tributeAmount) : null,
        boonAmount: tx.boonAmount ? Number(tx.boonAmount) : null,
    }));

    return (
        <div className="h-full">
            <DashboardView initialData={{ user: session.user, workspace: serializedWorkspace, agents, transactions: serializedTransactions }} />
        </div>
    );
}
