
'use client';

import React, { useState, useEffect } from 'react';
import type { BillingUsage } from '@/ai/tools/billing-schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, RefreshCw, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Transaction, TransactionStatus, TransactionType, User, UserRole, Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'> | null;

export default function UsageMonitor(props: Partial<BillingUsage>) {
    const { toast } = useToast();
    const { upsertApp } = useAppStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProp>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const fetchAllData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [txResponse, wsResponse, userResponse] = await Promise.all([
                fetch('/api/billing/transactions'),
                fetch('/api/workspaces/me'),
                fetch('/api/users/me')
            ]);
            if (!txResponse.ok) throw new Error('Failed to fetch transaction history.');
            if (!wsResponse.ok) throw new Error('Failed to fetch workspace data.');
            if (!userResponse.ok) throw new Error('Failed to fetch user data.');
            
            const txData = await txResponse.json();
            const wsData = await wsResponse.json();
            const userData = await userResponse.json();

            setTransactions(txData);
            setWorkspace(wsData);
            setCurrentUser(userData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleConfirm = async (transactionId: string) => {
        setConfirmingId(transactionId);
        const { confirmEtransfer } = await import('@/app/actions'); // Lazy import for client component
        const result = await confirmEtransfer(transactionId);

        if (result.success) {
            toast({ title: 'Transaction Confirmed', description: 'The workspace balance has been updated.' });
            await fetchAllData(); // Re-fetch all data to ensure UI consistency
        } else {
            toast({ variant: 'destructive', title: 'Confirmation Failed', description: result.error });
        }
        setConfirmingId(null);
    };

    const handleManagePlan = () => {
        toast({
            title: "Redirecting...",
            description: "Opening the pricing page in a new tab.",
        });
        window.open('/pricing', '_blank');
    }
    
    const handleTopUp = () => {
        if (workspace) {
            upsertApp('top-up', { id: 'singleton-top-up', contentProps: { workspaceId: workspace.id }});
        }
    };
    
    const displayProps = workspace ? {
        totalActionsUsed: workspace.agentActionsUsed,
        planLimit: props.planLimit,
        planTier: workspace.planTier,
        overageEnabled: props.overageEnabled
    } : props;
    
    if (!displayProps.planTier && !isLoading) {
        return (
             <div className="p-4 text-center text-muted-foreground">
                <p>No usage data loaded.</p>
                <p className="text-xs">Ask BEEP: "What is my current usage?"</p>
            </div>
        )
    }

    const { totalActionsUsed = 0, planLimit = 0, planTier, overageEnabled } = displayProps;
    const percentage = planLimit > 0 ? Math.min((totalActionsUsed / planLimit) * 100, 100) : 0;

    const getIndicatorColor = (p: number) => {
        if (p < 50) return 'bg-accent';
        if (p < 85) return 'bg-yellow-400';
        return 'bg-destructive';
    };
    
    const statusConfig: Record<TransactionStatus, { icon: React.ElementType, color: string, text: string }> = {
      [TransactionStatus.PENDING]: { icon: Clock, color: 'text-yellow-400', text: 'Pending' },
      [TransactionStatus.COMPLETED]: { icon: CheckCircle, color: 'text-accent', text: 'Completed' },
      [TransactionStatus.FAILED]: { icon: AlertTriangle, color: 'text-destructive', text: 'Failed' },
    };

    return (
        <div className="p-2 h-full flex flex-col space-y-3">
            <Card className="bg-background/50 flex-shrink-0">
                <CardHeader className="p-3">
                    <CardTitle className="text-base text-primary">{planTier} Plan</CardTitle>
                    <CardDescription className="text-xs">Current Billing Period</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                     <Progress value={percentage} indicatorClassName={cn(getIndicatorColor(percentage))} />
                     <div className="flex justify-between items-baseline font-mono">
                        <p className="text-lg">{totalActionsUsed.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">/ {planLimit?.toLocaleString() ?? '...'} Actions</p>
                     </div>
                </CardContent>
                 <CardFooter className="p-3 pt-0 flex justify-between items-center">
                    <Badge variant={overageEnabled ? "default" : "secondary"}>
                        Overage: {overageEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleManagePlan}>
                        Manage Plan <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-background/50 flex-grow flex flex-col min-h-0">
                 <CardHeader className="p-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Transaction History</CardTitle>
                        <CardDescription className="text-xs">Recent credit and debit activity.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchAllData} disabled={isLoading}><RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")}/></Button>
                 </CardHeader>
                 <CardContent className="p-3 pt-0 flex-grow min-h-0">
                    <ScrollArea className="h-full">
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm pt-4">No transactions found.</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map(tx => {
                                  const statusInfo = statusConfig[tx.status];
                                  const Icon = statusInfo.icon;
                                  return (
                                    <div key={tx.id} className="text-xs p-2 rounded-md border border-border/50 bg-background/30">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium pr-2">{tx.description}</p>
                                            <p className={cn("font-bold font-mono text-lg whitespace-nowrap", tx.type === TransactionType.CREDIT || tx.type === TransactionType.TRIBUTE && (tx.amount as unknown as number) > 0 ? "text-accent" : "text-destructive")}>
                                                {(tx.type === TransactionType.CREDIT || ((tx.type === TransactionType.TRIBUTE) && (tx.amount as unknown as number) > 0)) ? '+' : ''}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center text-muted-foreground mt-1">
                                            <span className="font-mono">{new Date(tx.createdAt).toLocaleString()}</span>
                                            <span className={cn("flex items-center gap-1 font-semibold", statusInfo.color)}>
                                                <Icon className="h-3 w-3" /> {statusInfo.text}
                                            </span>
                                        </div>
                                        {tx.status === TransactionStatus.PENDING && tx.type === TransactionType.CREDIT && currentUser?.role === UserRole.ADMIN && (
                                            <div className="flex justify-end mt-2">
                                                <Button size="sm" variant="secondary" onClick={() => handleConfirm(tx.id)} disabled={confirmingId === tx.id}>
                                                    {confirmingId === tx.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                                    Approve Credit
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                  )
                                })}
                            </div>
                        )}
                    </ScrollArea>
                 </CardContent>
                 <CardFooter className="p-3 pt-0">
                     <Button className="w-full" onClick={handleTopUp} disabled={!workspace}>
                        Top-Up Credits
                    </Button>
                 </CardFooter>
            </Card>
        </div>
    );
}
