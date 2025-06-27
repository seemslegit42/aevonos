
'use client';

import React, { useState, useEffect } from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type SecurityAlert = {
  id: string;
  type: string;
  explanation: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  actionableOptions: string[];
};

const riskStyles: Record<string, { variant: 'secondary' | 'default' | 'destructive'; icon: React.ElementType; className: string }> = {
    low: { variant: 'secondary', icon: ShieldCheck, className: 'text-muted-foreground' },
    medium: { variant: 'default', icon: ShieldAlert, className: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' },
    high: { variant: 'default', icon: ShieldAlert, className: 'bg-orange-500/10 border-orange-500/50 text-orange-400' },
    critical: { variant: 'destructive', icon: ShieldAlert, className: 'bg-red-500/10' },
};

function AlertCard({ alert }: { alert: SecurityAlert }) {
    const risk = riskStyles[alert.riskLevel] || riskStyles.low;
    const Icon = risk.icon;

    return (
        <Alert className={cn('bg-background/80', risk.className)}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="flex justify-between items-center">
                <span>{alert.type}</span>
                <Badge variant={risk.variant} className="capitalize">{alert.riskLevel}</Badge>
            </AlertTitle>
            <AlertDescription className="text-foreground/80 mt-1">
                {alert.explanation}
                <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                </div>
            </AlertDescription>
        </Alert>
    );
}

export default function AegisThreatScope() {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/security/alerts');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch security alerts from the Aegis network.');
            }
            const data = await response.json();
            setAlerts(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (alerts.length === 0) {
            return (
                <div className="text-center py-10">
                    <ShieldCheck className="mx-auto h-12 w-12 text-accent" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">All Systems Nominal</h3>
                    <p className="mt-1 text-sm text-muted-foreground">No security threats detected.</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
            </div>
        );
    };

    return (
        <div className="p-2 h-full flex flex-col gap-3">
            <CardHeader className="p-0 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-base">Threat Feed</CardTitle>
                        <CardDescription className="text-xs">Real-time alerts from the Aegis subsystem.</CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" onClick={fetchAlerts} disabled={isLoading}>
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    </Button>
                </div>
            </CardHeader>
            <ScrollArea className="flex-grow pr-2 -mr-2">
                {renderContent()}
            </ScrollArea>
        </div>
    );
}
