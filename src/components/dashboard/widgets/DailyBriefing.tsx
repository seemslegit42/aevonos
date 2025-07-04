'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Coffee, AlertTriangle, ListChecks, CheckCircle } from 'lucide-react';
import { DailyBriefingOutput } from '@/ai/agents/briefing-schemas';
import { Button } from '@/components/ui/button';

const LoadingSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
    </div>
);

export default function DailyBriefing() {
    const [briefing, setBriefing] = useState<DailyBriefingOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBriefing = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/briefing');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch briefing.');
                }
                const data = await response.json();
                setBriefing(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBriefing();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton />;
        }
        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Briefing Unavailable</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }
        if (briefing) {
            return (
                <div className="space-y-4">
                    <p className="text-sm italic">{briefing.greeting}</p>
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                            <AlertTriangle /> Key Alerts
                        </h4>
                        <ul className="space-y-1 text-xs list-disc pl-5">
                            {briefing.key_alerts.map((alert, i) => <li key={i}>{alert}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                            <ListChecks /> Top Priorities
                        </h4>
                        <ul className="space-y-1 text-xs list-disc pl-5">
                            {briefing.top_priorities.map((priority, i) => <li key={i}>{priority}</li>)}
                        </ul>
                    </div>
                    <p className="text-sm italic text-muted-foreground">{briefing.closing_remark}</p>
                    <Button size="sm" variant="outline" className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" /> Acknowledge Briefing
                    </Button>
                </div>
            )
        }
        return null;
    }

    return (
        <Card className="bg-background/50 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" /> Morning Briefing
                </CardTitle>
                <CardDescription>Your daily summary from BEEP.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
