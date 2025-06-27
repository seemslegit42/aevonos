'use client';

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { BillingUsage } from '@/ai/tools/billing-schemas';

export default function UsageMonitor(data: BillingUsage) {
  const chartData = [
    {
      name: 'Usage',
      used: data.totalActionsUsed,
      limit: data.planLimit,
    },
  ];
  
  const percentageUsed = (data.totalActionsUsed / data.planLimit) * 100;

  return (
    <div className="p-2 space-y-4">
        <div className="text-center">
            <p className="text-4xl font-bold font-headline">{data.totalActionsUsed.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Agent Actions Used</p>
        </div>

        <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis type="number" hide domain={[0, data.planLimit]} />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                        cursor={{ fill: 'hsl(var(--secondary))' }} 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <p className="text-sm">{`Used: ${payload[0].value?.toLocaleString()}`}</p>
                                        <p className="text-sm text-muted-foreground">{`Limit: ${data.planLimit.toLocaleString()}`}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="limit" fill='hsl(var(--secondary))' radius={4} background={{ fill: 'hsl(var(--background))' }} />
                    <Bar dataKey="used" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
            </ResponsiveContainer>
        </div>
            <div className="text-center text-xs text-muted-foreground">
            <p>You have used {percentageUsed.toFixed(1)}% of your monthly limit for the <span className="font-bold text-foreground">{data.planTier}</span> plan.</p>
        </div>
    </div>
  );
}
