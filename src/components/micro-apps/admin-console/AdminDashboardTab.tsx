
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Bot, CircleDollarSign, BarChart } from 'lucide-react';

interface OverviewStats {
    userCount: number;
    agentCount: number;
    activeAgentCount: number;
    creditBalance: number;
    planTier: string;
}

export default function AdminDashboardTab() {
    const [stats, setStats] = useState<Partial<OverviewStats>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOverview() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/overview');
                if (!response.ok) {
                    throw new Error('Failed to fetch overview data.');
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchOverview();
    }, []);

    const StatCard = ({ icon, title, value, description, loading }: { icon: React.ElementType, title: string, value: React.ReactNode, description?: string, loading: boolean }) => {
        const Icon = icon;
        return (
            <Card className="bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-8 w-1/2" />
                    ) : (
                        <div className="text-2xl font-bold">{value}</div>
                    )}
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return <p className="text-destructive text-center p-4">{error}</p>
    }

    return (
        <div className="p-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} title="Total Users" value={stats.userCount} description="In this workspace" loading={isLoading} />
                <StatCard icon={Bot} title="Deployed Agents" value={`${stats.activeAgentCount ?? '...'} / ${stats.agentCount ?? '...'}`} description="Active / Total" loading={isLoading} />
                <StatCard icon={CircleDollarSign} title="Credit Balance" value={`${stats.creditBalance?.toLocaleString() ?? '...'} Ξ`} description="Workspace Balance" loading={isLoading} />
                <StatCard icon={BarChart} title="Plan Tier" value={stats.planTier} description="Current Subscription" loading={isLoading} />
            </div>
        </div>
    );
}
