
'use client';

import React, { useEffect, useState } from 'react';
import DashboardView from '@/components/dashboard/dashboard-view';
import { type User, type Workspace, type Agent, type Transaction, Prisma } from '@prisma/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

type InitialData = {
    user: User | null;
    workspace: (Workspace & { credits: number }) | null;
    agents: Agent[];
    transactions: (Transaction & { amount: number, tributeAmount: number | null, boonAmount: number | null })[];
};

export default function Home() {
    const { user, loading: authLoading } = useAuth();
    const [initialData, setInitialData] = useState<InitialData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        if (!user) {
            // This case should be handled by MainLayout redirecting, but as a fallback:
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [workspaceRes, agentsRes, transactionsRes, userRes] = await Promise.all([
                    fetch('/api/workspaces/me'),
                    fetch('/api/agents'),
                    fetch('/api/billing/transactions'),
                    fetch('/api/users/me')
                ]);

                if (!workspaceRes.ok || !agentsRes.ok || !transactionsRes.ok || !userRes.ok) {
                    throw new Error("Failed to load initial workspace data.");
                }

                const workspace: Workspace = await workspaceRes.json();
                const agents: Agent[] = await agentsRes.json();
                const transactions: Transaction[] = await transactionsRes.json();
                const fullUser: User = await userRes.json();

                const serializedWorkspace = { ...workspace, credits: Number(workspace.credits) };
                const serializedTransactions = transactions.map(tx => ({
                    ...tx,
                    amount: Number(tx.amount),
                    tributeAmount: tx.tributeAmount ? Number(tx.tributeAmount) : null,
                    boonAmount: tx.boonAmount ? Number(tx.boonAmount) : null,
                }));
                
                setInitialData({
                    user: fullUser,
                    workspace: serializedWorkspace,
                    agents,
                    transactions: serializedTransactions,
                });

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading]);

    if (isLoading || authLoading) {
        return (
             <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-4">
              <div className="col-span-12 row-span-6 lg:col-span-3 lg:row-span-6 z-10">
                <div className="h-full w-full grid grid-rows-3 gap-4">
                  <Skeleton className="h-full w-full" />
                  <Skeleton className="h-full w-full" />
                  <Skeleton className="h-full w-full" />
                </div>
              </div>
              <div className="col-span-12 row-span-6 lg:col-span-6 lg:row-span-6" />
              <div className="col-span-12 row-span-6 lg:col-span-3 lg:row-span-6 z-10">
                 <div className="h-full w-full grid grid-rows-3 gap-4">
                    <Skeleton className="h-full w-full" />
                    <div className="row-span-2"><Skeleton className="h-full w-full" /></div>
                 </div>
              </div>
            </div>
        )
    }

    if (error) {
        return <div className="flex h-full items-center justify-center text-destructive">{error}</div>;
    }
    
    if (!initialData) {
        // This can happen if the user is not logged in and the redirect from MainLayout hasn't fired yet
        return null; 
    }

    return (
        <div className="h-full">
            <DashboardView initialData={initialData} />
        </div>
    );
}
