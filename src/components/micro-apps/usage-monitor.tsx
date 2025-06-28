
'use client';

import React, { useState, useEffect } from 'react';
import type { BillingUsage } from '@/ai/tools/billing-schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, RefreshCw, Shell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Transaction, TransactionType } from '@prisma/client';
import { useAppStore } from '@/store/app-store';

export default function UsageMonitor(props: Partial<BillingUsage>) {
    const { toast } = useToast();
    const { handleCommandSubmit } = useAppStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isTxLoading, setIsTxLoading] = useState(true);

    const fetchTransactions = async () => {
        setIsTxLoading(true);
        try {
            const response = await fetch('/api/billing/transactions');
            if (!response.ok) throw new Error('Failed to fetch transaction history.');
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsTxLoading(false);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleManagePlan = () => {
        toast({
            title: "Redirecting...",
            description: "Opening the pricing page in a new tab.",
        });
        window.open('/pricing', '_blank');
    }
    
    const openTopUpModal = () => {
        handleCommandSubmit("show my usage monitor");
    }

    if (!props.planTier) {
        return (
             <div className="p-4 text-center text-muted-foreground">
                <p>No usage data loaded.</p>
                <p className="text-xs">Ask BEEP: "What is my current usage?"</p>
            </div>
        )
    }

    const { totalActionsUsed = 0, planLimit = 0, planTier, overageEnabled } = props;
    const percentage = planLimit > 0 ? Math.min((totalActionsUsed / planLimit) * 100, 100) : 0;

    const getIndicatorColor = (p: number) => {
        if (p < 50) return 'bg-accent';
        if (p < 85) return 'bg-yellow-400';
        return 'bg-destructive';
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
                        <p className="text-sm text-muted-foreground">/ {planLimit.toLocaleString()} Actions</p>
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
                    <Button variant="ghost" size="icon" onClick={fetchTransactions} disabled={isTxLoading}><RefreshCw className={cn("h-4 w-4", isTxLoading && "animate-spin")}/></Button>
                 </CardHeader>
                 <CardContent className="p-3 pt-0 flex-grow min-h-0">
                    <ScrollArea className="h-full">
                        {isTxLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm pt-4">No transactions found.</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="text-xs p-2 rounded-md border border-border/50 bg-background/30 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{tx.description}</p>
                                            <p className="text-muted-foreground font-mono">{new Date(tx.createdAt).toLocaleString()}</p>
                                        </div>
                                        <p className={cn("font-bold font-mono text-lg", tx.type === TransactionType.CREDIT ? "text-accent" : "text-destructive")}>
                                            {tx.type === TransactionType.CREDIT ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                 </CardContent>
                 <CardFooter className="p-3 pt-0">
                     <Button className="w-full" onClick={() => openTopUpModal()}>
                        Top-Up Credits
                    </Button>
                 </CardFooter>
            </Card>
        </div>
    );
}
