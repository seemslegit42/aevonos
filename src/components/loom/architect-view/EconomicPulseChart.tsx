
'use client';

import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type DailyPulseData = {
    date: string;
    credits_burned: number;
    credits_gained: number;
}

const chartConfig = {
  credits_burned: {
    label: "Ξ Burned",
    color: "hsl(var(--destructive))",
  },
  credits_gained: {
    label: "Ξ Gained",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export default function EconomicPulseChart() {
    const [data, setData] = useState<DailyPulseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/economic-pulse');
                if (!response.ok) {
                    throw new Error('Failed to fetch economic data.');
                }
                const rawData = await response.json();
                setData(rawData);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Chart</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <defs>
                    <linearGradient id="fillBurned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-credits_burned)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-credits_burned)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillGained" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-credits_gained)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-credits_gained)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                 <Area
                    dataKey="credits_gained"
                    type="natural"
                    fill="url(#fillGained)"
                    stroke="var(--color-credits_gained)"
                    stackId="a"
                />
                <Area
                    dataKey="credits_burned"
                    type="natural"
                    fill="url(#fillBurned)"
                    stroke="var(--color-credits_burned)"
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer>
    );
}
