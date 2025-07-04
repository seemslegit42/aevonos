
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Transaction, TransactionType } from '@prisma/client';
import { Activity, ArrowDownLeft, ArrowUpRight, Gem, Flame, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const iconMap: Record<TransactionType, React.ElementType> = {
    [TransactionType.CREDIT]: ArrowUpRight,
    [TransactionType.DEBIT]: ArrowDownLeft,
    [TransactionType.TRIBUTE]: Flame,
};

const colorMap: Record<TransactionType, string> = {
    [TransactionType.CREDIT]: 'text-accent',
    [TransactionType.DEBIT]: 'text-destructive',
    [TransactionType.TRIBUTE]: 'text-primary',
};

interface RecentActivityFeedProps {
    transactions: (Transaction & { amount: number })[];
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

export default function RecentActivityFeed({ transactions, isLoading, error, onRefresh }: RecentActivityFeedProps) {

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            )
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
            <div className="space-y-3">
                {transactions.map(tx => {
                    const Icon = iconMap[tx.type] || Activity;
                    const color = colorMap[tx.type] || 'text-foreground';
                    const isTributeWin = tx.type === 'TRIBUTE' && tx.amount > 0;
                    return (
                    <div key={tx.id} className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full bg-background border ${color}`}>
                            <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="text-sm font-medium truncate">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</p>
                        </div>
                        <div className="flex-shrink-0 font-mono text-sm font-bold flex items-center gap-1">
                            {isTributeWin && <Gem className="h-3 w-3 text-gilded-accent"/>}
                            <span className={color}>
                                {tx.amount > 0 && tx.type !== 'DEBIT' ? '+' : ''}{tx.amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )})}
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
