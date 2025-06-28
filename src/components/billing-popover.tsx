
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';


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
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);

  if (!workspace) {
    return <div className="p-4 text-sm text-muted-foreground">No workspace data.</div>;
  }
  
  const planTier = workspace.planTier as keyof typeof PLAN_LIMITS;
  const planLimit = PLAN_LIMITS[planTier] || 0;
  const percentage = planLimit > 0 ? Math.min((workspace.agentActionsUsed / planLimit) * 100, 100) : 0;

  const creditPacks = [
    { amount: 1000, price: 10, description: "Good for basic automations." },
    { amount: 5000, price: 45, description: "Perfect for power users." },
    { amount: 20000, price: 150, description: "For heavy-duty workflows." },
  ];

  const handlePurchase = async (amount: number) => {
    setIsPurchasing(amount);
    const result = await purchaseCredits(amount);
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
    setIsPurchasing(null);
  };
  
  const getIndicatorColor = (p: number) => {
    if (p < 50) return 'bg-accent';
    if (p < 85) return 'bg-yellow-400';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-semibold text-sm">Monthly Agent Actions</h4>
          <span className="text-xs font-mono">{workspace.agentActionsUsed.toLocaleString()} / {planLimit.toLocaleString()}</span>
        </div>
        <Progress value={percentage} indicatorClassName={cn(getIndicatorColor(percentage))} />
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Top-Up CogniOps Credits</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {creditPacks.map(pack => (
                <Card key={pack.amount} className="bg-background/50 flex flex-col text-left">
                    <CardHeader className="p-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <DatabaseZap className="w-4 h-4 text-primary" />
                            {pack.amount.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 flex-grow">
                        <p className="text-xs text-muted-foreground">{pack.description}</p>
                    </CardContent>
                    <CardFooter className="p-2">
                        <Button 
                            className="w-full"
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePurchase(pack.amount)}
                            disabled={isPurchasing !== null}
                        >
                            {isPurchasing === pack.amount ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                `Buy for $${pack.price}`
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
      
      <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/pricing')}>
        Manage Subscription <ArrowUpRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
