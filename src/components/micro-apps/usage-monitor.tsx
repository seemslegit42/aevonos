
'use client';

import React, { useState } from 'react';
import type { BillingUsage } from '@/ai/tools/billing-schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, DatabaseZap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { purchaseCredits } from '@/app/actions';

export default function UsageMonitor(props: Partial<BillingUsage>) {
    const { toast } = useToast();
    const [isPurchasing, setIsPurchasing] = useState<number | null>(null);

    const creditPacks = [
        { amount: 1000, price: 10, description: "Good for basic automations and experiments." },
        { amount: 5000, price: 45, description: "Perfect for power users and small teams." },
        { amount: 20000, price: 150, description: "For heavy-duty agentic workflows." },
    ];

    const handlePurchase = async (amount: number) => {
        setIsPurchasing(amount);
        const result = await purchaseCredits(amount);
        if (result.success) {
            toast({
                title: 'Purchase Successful',
                description: result.message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Purchase Failed',
                description: result.error,
            });
        }
        setIsPurchasing(null);
    };


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
            <Separator className="my-4" />
            <div className="text-left w-full space-y-2">
                <h4 className="font-semibold text-foreground">Purchase CogniOps Credits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {creditPacks.map(pack => (
                        <Card key={pack.amount} className="bg-background/50 flex flex-col text-left">
                            <CardHeader className="p-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DatabaseZap className="w-5 h-5 text-primary" />
                                    {pack.amount.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 flex-grow">
                                <p className="text-xs text-muted-foreground">{pack.description}</p>
                            </CardContent>
                            <CardFooter className="p-3">
                                <Button 
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => handlePurchase(pack.amount)}
                                    disabled={isPurchasing !== null}
                                >
                                    {isPurchasing === pack.amount ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        `Purchase for $${pack.price}`
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
