'use client';

import React from 'react';
import type { Workspace } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shell } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS } from '@/config/billing';


interface BillingPopoverContentProps {
  workspace: Workspace | null;
}

export default function BillingPopoverContent({ workspace }: BillingPopoverContentProps) {
  const { upsertApp } = useAppStore();

  if (!workspace) {
    return <div className="p-4 text-sm text-muted-foreground">No workspace data.</div>;
  }
  
  const planTier = workspace.planTier as keyof typeof PLAN_LIMITS;
  const planLimit = PLAN_LIMITS[planTier] || 0;
  const percentage = planLimit > 0 ? Math.min((workspace.agentActionsUsed / planLimit) * 100, 100) : 0;

  const getIndicatorColor = (p: number) => {
    if (p < 50) return 'bg-accent';
    if (p < 85) return 'bg-yellow-400';
    return 'bg-destructive';
  };
  
  const openUsageMonitor = () => {
      // Directly launch or update the app
      upsertApp('usage-monitor', { id: 'singleton-usage-monitor', contentProps: {
          totalActionsUsed: workspace.agentActionsUsed,
          planLimit,
          planTier: workspace.planTier,
          overageEnabled: workspace.overageEnabled
      }});
  }

  return (
    <div className="space-y-4 p-4 w-64">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-semibold text-sm">Monthly Agent Actions</h4>
          <span className="text-xs font-mono">{workspace.agentActionsUsed.toLocaleString()} / {planLimit.toLocaleString()}</span>
        </div>
        <Progress value={percentage} indicatorClassName={cn(getIndicatorColor(percentage))} />
      </div>
      
      <Button variant="outline" size="sm" className="w-full" onClick={openUsageMonitor}>
        Open Usage Monitor <Shell className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
