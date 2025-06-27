
'use client';

import React from 'react';
import type { BillingUsage } from '@/ai/tools/billing-schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Gauge = ({ value, maxValue }: { value: number; maxValue: number }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const circumference = 2 * Math.PI * 45; // 2 * PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (p: number) => {
        if (p < 50) return 'hsl(var(--accent))';
        if (p < 85) return 'hsl(var(--ring))';
        return 'hsl(var(--destructive))';
    };

    const color = getColor(percentage);

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--muted) / 0.3)"
                    strokeWidth="8"
                />
                {/* Foreground progress */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-headline" style={{ color }}>
                    {Math.round(percentage)}%
                </span>
                <span className="text-xs text-muted-foreground">Used</span>
            </div>
        </div>
    );
};


export default function UsageMonitor({
    currentPeriod,
    totalActionsUsed,
    planLimit,
    planTier,
    overageEnabled
}: BillingUsage) {

    return (
        <div className="p-2 flex flex-col items-center text-center">
            <h3 className="font-bold text-lg text-primary">{planTier} Plan</h3>
            <p className="text-xs text-muted-foreground mb-4">Usage for current period</p>
            
            <Gauge value={totalActionsUsed} maxValue={planLimit} />
            
            <p className="font-mono text-lg mt-4">{totalActionsUsed.toLocaleString()} / {planLimit.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Agent Actions</p>

            <div className="mt-4 flex items-center justify-center gap-4">
                <Badge variant={overageEnabled ? "default" : "secondary"}>
                    Overage: {overageEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button variant="outline" size="sm">
                    Upgrade Plan <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
