
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, RefreshCw, AlertTriangle, CheckCircle, Clock, Loader2, Flame, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Transaction, TransactionStatus, TransactionType, User, UserRole, Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { Separator } from '../ui/separator';
import { chaosCardManifest } from '@/config/chaos-cards';
import { confirmPendingTransactionAction } from '@/app/admin/actions';
import { PLAN_LIMITS } from '@/config/billing';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'> | null;
type UsageMonitorProps = {
    workspace: Workspace | null;
    user: UserProp;
}

const chaosCardMap = new Map(chaosCardManifest.map(c => [c.key, c]));

const UsageSkeleton = () => (
    <>
        <Card className="bg-background/50 flex-shrink-0">
            <CardHeader className="p-3">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
                 <Skeleton className="h-4 w-full" />
                 <div className="flex justify-between items-baseline">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                 </div>
            </CardContent>
             <CardFooter className="p-3 pt-0 flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-28" />
            </CardFooter>
        </Card>
        <Card className="bg-background/50 flex-grow flex flex-col min-h-0">
            <CardHeader className="p-3 flex flex-row items-center justify-between">
                <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48 mt-1" />
                </div>
                <Skeleton className="h-10 w-10" />
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-grow min-h-0">
                <div className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    </>
)

export default function UsageMonitor({ workspace: initialWorkspace, user: initialUser }: UsageMonitorProps) {
    const { toast } = useToast();
    const { upsertApp } = useAppStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [workspace, setWorkspace] = useState<Workspace | null>(initialWorkspace);
    const [currentUser, setCurrentUser] = useState<UserProp>(initialUser);
    const [isLoading, setIsLoading] = useState(!initialWorkspace);
    
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const fetchAllData = useCallback(async () => {
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
        if (!initialWorkspace) {
            fetchAllData();
        }
    }, [fetchAllData, initialWorkspace]);

    const handleConfirm = async (transactionId: string) => {
        setConfirmingId(transactionId);
        const result = await confirmPendingTransactionAction(transactionId);

        if (result.success) {
            toast({ title: 'Transaction Confirmed', description: 'The workspace balance has been updated.' });
            await fetchAllData();
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
    
    if (isLoading) {
        return (
             <div className="p-2 h-full flex flex-col space-y-3">
                <UsageSkeleton />
            </div>
        )
    }

    const planTier = workspace?.planTier as keyof typeof PLAN_LIMITS | undefined;
    const planLimit = planTier ? PLAN_LIMITS[planTier] : 0;
    const totalActionsUsed = workspace?.agentActionsUsed ?? 0;
    const overageEnabled = workspace?.overageEnabled ?? false;
    
    if (!planTier && !isLoading) {
        return (
             <div className="p-4 text-center text-muted-foreground">
                <p>No usage data loaded.</p>
                <p className="text-xs">Ask BEEP: "What is my current usage?"</p>
            </div>
        )
    }

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
                        <CardTitle className="text-base">Ledger of the Lambda-Xi-VON Collective</CardTitle>
                        <CardDescription className="text-xs">An immutable record of all Tributes, Boons, and Debits.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchAllData} disabled={isLoading}><RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")}/></Button>
                 </CardHeader>
                 <CardContent className="p-3 pt-0 flex-grow min-h-0">
                    <ScrollArea className="h-full">
                        {transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm pt-4">No transactions found.</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map(tx => {
                                  const statusInfo = statusConfig[tx.status];
                                  const Icon = statusInfo.icon;
                                  
                                  if (tx.type === TransactionType.TRIBUTE) {
                                      const card = tx.instrumentId ? chaosCardMap.get(tx.instrumentId) : null;
                                      const boonAmount = Number(tx.boonAmount ?? 0);
                                      const netAmount = Number(tx.amount);
                                      const tributeAmount = boonAmount - netAmount;

                                      return (
                                          <div key={tx.id} className="text-xs p-2 rounded-md border border-purple-500/50 bg-purple-950/20">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-bold text-base text-purple-300">Xi-Event: Tribute to {card ? card.name : 'an Unknown Artifact'}</p>
                                                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 capitalize">{tx.outcome}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                                                    <div className="flex flex-col items-center p-1 rounded bg-destructive/10">
                                                        <span className="flex items-center gap-1 text-destructive font-semibold"><Flame className="h-3 w-3" />Tribute</span>
                                                        <span>-{tributeAmount.toFixed(2)} Ξ</span>
                                                    </div>
                                                    <div className="flex flex-col items-center p-1 rounded bg-accent/10">
                                                        <span className="flex items-center gap-1 text-accent font-semibold"><Gem className="h-3 w-3" />Boon</span>
                                                        <span>+{boonAmount.toFixed(2)} Ξ</span>
                                                    </div>
                                                </div>
                                                <Separator className="my-2 bg-purple-500/30" />
                                                <div className="flex justify-between items-center text-muted-foreground mt-1">
                                                    <span className="font-mono">{new Date(tx.createdAt).toLocaleString()}</span>
                                                    <span className={cn("font-bold font-mono text-lg whitespace-nowrap", netAmount >= 0 ? "text-accent" : "text-destructive")}>
                                                        Net: {netAmount >= 0 ? '+' : ''}{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                           </div>
                                      )
                                  }

                                  return (
                                    <div key={tx.id} className="text-xs p-2 rounded-md border border-border/50 bg-background/30">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium pr-2">{tx.description}</p>
                                            <p className={cn("font-bold font-mono text-lg whitespace-nowrap", tx.type === TransactionType.CREDIT ? "text-accent" : "text-destructive")}>
                                                {tx.type === TransactionType.CREDIT ? '+' : '-'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
