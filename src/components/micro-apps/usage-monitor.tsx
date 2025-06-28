
'use client';

import React from 'react';
import type { BillingUsage } from '@/ai/tools/billing-schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function UsageMonitor(props: Partial<BillingUsage>) {
    const { toast } = useToast();

    const handleManagePlan = () => {
        toast({
            title: "Redirecting...",
            description: "Opening the pricing page in a new tab.",
        });
        window.open('/pricing', '_blank');
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
        <div className="p-4 flex flex-col items-center text-center space-y-4">
            <div className="w-full">
                <h3 className="font-bold text-lg text-primary">{planTier} Plan</h3>
                <p className="text-xs text-muted-foreground">Current Billing Period</p>
            </div>
            
            <div className="w-full px-4 space-y-2">
                 <Progress value={percentage} indicatorClassName={cn(getIndicatorColor(percentage))} />
                 <div className="flex justify-between items-baseline font-mono">
                    <p className="text-lg">{totalActionsUsed.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">/ {planLimit.toLocaleString()} Actions</p>
                 </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
                <Badge variant={overageEnabled ? "default" : "secondary"}>
                    Overage: {overageEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleManagePlan}>
                    Manage Plan <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
