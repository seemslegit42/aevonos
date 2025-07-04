
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import { Activity, ArrowDownLeft, ArrowUpRight, Gem, Flame, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { artifactManifests } from '@/config/artifacts';
import { Separator } from '@/components/ui/separator';

const chaosCardMap = new Map(artifactManifests.filter(a => a.type === 'CHAOS_CARD').map(c => [c.id, c]));

interface RecentActivityFeedProps {
    transactions: (Transaction & { amount: number })[];
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const statusConfig: Record<TransactionStatus, { icon: React.ElementType, color: string, text: string }> = {
  [TransactionStatus.PENDING]: { icon: Clock, color: 'text-yellow-400', text: 'Pending' },
  [TransactionStatus.COMPLETED]: { icon: CheckCircle, color: 'text-accent', text: 'Completed' },
  [TransactionStatus.FAILED]: { icon: AlertTriangle, color: 'text-destructive', text: 'Failed' },
};

export default function RecentActivityFeed({ transactions, isLoading, error, onRefresh }: RecentActivityFeedProps) {
    const renderContent = () => {
        if (isLoading && transactions.length === 0) {
             return (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            );
        }
        
        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Failed to Load Feed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (transactions.length === 0) {
            return (
                <div className="text-center text-xs text-muted-foreground pt-8">No recent activity.</div>
            );
        }

        return (
            <div className="space-y-2">
                {transactions.map(tx => {
                    const statusInfo = statusConfig[tx.status];
                    const Icon = statusInfo.icon;
                
                    if (tx.type === TransactionType.TRIBUTE) {
                        const card = tx.instrumentId ? chaosCardMap.get(tx.instrumentId) : null;
                        const boonAmount = Number(tx.boonAmount ?? 0);
                        const tributeAmount = Number(tx.tributeAmount ?? 0);
                        const netAmount = Number(tx.amount);
    
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

                    const isCredit = tx.type === TransactionType.CREDIT;
                    const TxIcon = isCredit ? ArrowUpRight : ArrowDownLeft;
                    const colorClass = isCredit ? 'text-accent' : 'text-destructive';

                    return (
                        <div key={tx.id} className="flex items-center gap-3 p-2 border border-border/50 rounded-md bg-background/30">
                            <div className={`p-1.5 rounded-full bg-background border ${colorClass}`}>
                                <TxIcon className="h-3 w-3" />
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="text-sm font-medium truncate">{tx.description}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</p>
                            </div>
                            <div className={cn("flex-shrink-0 font-mono text-sm font-bold flex items-center gap-1", colorClass)}>
                                <span>{isCredit ? '+' : '-'}{tx.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )
    }

    return (
        <Card className="bg-background/50 h-full flex flex-col">
            <CardHeader className="p-3 pb-2 flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-grow min-h-0">
                <ScrollArea className="h-full">
                     {renderContent()}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
