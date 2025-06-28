
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Workspace } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DatabaseZap, Loader2, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { purchaseCredits } from '@/app/actions';
import { Separator } from './ui/separator';

interface BillingPopoverContentProps {
  workspace: Workspace | null;
}

const PLAN_LIMITS = {
  'Apprentice': 100,
  'Artisan': 2000,
  'Priesthood': 100000,
} as const;

export default function BillingPopoverContent({ workspace }: BillingPopoverContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  if (!workspace) {
    return <div className="p-4 text-sm text-muted-foreground">No workspace data.</div>;
  }
  
  const planTier = workspace.planTier as keyof typeof PLAN_LIMITS;
  const planLimit = PLAN_LIMITS[planTier] || 0;
  const percentage = planLimit > 0 ? Math.min((workspace.agentActionsUsed / planLimit) * 100, 100) : 0;

  const handlePurchase = async () => {
    setIsPurchasing(true);
    const result = await purchaseCredits(5000); // Default purchase of 5000 credits
    if (result.success) {
      toast({
        title: 'Credits Added',
        description: result.message,
      });
      router.refresh(); // Refresh to update the credit count in the top bar
    } else {
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: result.error,
      });
    }
    setIsPurchasing(false);
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-semibold text-sm">Monthly Agent Actions</h4>
          <span className="text-xs font-mono">{workspace.agentActionsUsed.toLocaleString()} / {planLimit.toLocaleString()}</span>
        </div>
        <Progress value={percentage} />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm">CogniOps Credits</h4>
          <span className="font-bold font-mono text-primary">{workspace.credits.toLocaleString()}</span>
        </div>
        <Button className="w-full" size="sm" variant="secondary" onClick={handlePurchase} disabled={isPurchasing}>
          {isPurchasing ? <Loader2 className="animate-spin" /> : <><DatabaseZap className="mr-2 h-4 w-4" /> Add 5,000 Credits</>}
        </Button>
      </div>

      <Separator />
      
      <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/pricing')}>
        Manage Subscription <ArrowUpRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
