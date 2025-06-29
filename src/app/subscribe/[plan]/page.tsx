
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';

const planDetails: { [key: string]: any } = {
    apprentice: {
        name: 'Apprentice',
        price: 0,
        priceDisplay: 'Free Forever',
        features: [
            "100 Agent Actions / month",
            "Core Micro-App Access",
            "Limited Loom Studio Features",
        ],
    },
    artisan: {
        name: 'Artisan',
        price: 20,
        priceDisplay: '$20 / user / month',
        features: [
            "2,000 Agent Actions / month",
            "Full Armory Marketplace Access",
            "Unlimited Loom Workflows",
        ],
    },
};

export default function SubscribePage({ params }: { params: { plan: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const plan = planDetails[params.plan];

    useEffect(() => {
        if (!plan) {
            router.push('/pricing');
        }
    }, [plan, router]);
    
    if (!plan) {
        return null; // Or a loading skeleton
    }
    
    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/workspaces/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planTier: plan.name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upgrade plan.');
            }

            toast({
                title: 'Subscription Upgraded!',
                description: `Welcome to the ${plan.name} tier. Your canvas has been upgraded.`,
            });
            router.push('/');
            router.refresh(); // Important to refresh server components to reflect new plan status
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Upgrade Failed',
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full min-h-screen p-4 sm:p-8 flex flex-col justify-center">
            <div className="w-full max-w-5xl mx-auto">
                 <Button variant="ghost" asChild className="mb-4 text-muted-foreground hover:text-foreground">
                    <Link href="/pricing">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Plans
                    </Link>
                </Button>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Summary Card */}
                    <Card className="flex flex-col">
                         <CardHeader>
                            <CardTitle className="text-3xl font-headline text-primary">Confirm Your Pact</CardTitle>
                            <CardDescription>You are choosing the path of the <span className="font-bold text-primary">{plan.name}</span>.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <Separator />
                            <ul className="space-y-3 text-sm">
                                {plan.features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="h-4 w-4 text-accent" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Separator />
                        </CardContent>
                        <CardFooter>
                            <div className="flex justify-between items-baseline font-semibold w-full">
                                <span className="text-lg">Total Due Today</span>
                                <span className="text-2xl font-mono">${plan.price.toFixed(2)}</span>
                            </div>
                        </CardFooter>
                    </Card>
                    
                    {/* Payment Info Card */}
                    <Card>
                         <CardHeader>
                            <CardTitle className="text-2xl font-headline">Offer Your Tribute</CardTitle>
                            <CardDescription>This is a mock payment form for demonstration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <Input id="card-number" placeholder="•••• •••• •••• 4242" disabled={isLoading} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="expiry">Expiration</Label>
                                    <Input id="expiry" placeholder="MM / YY" disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="•••" disabled={isLoading} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="name">Name on Card</Label>
                                <Input id="name" placeholder="Art Vandelay" disabled={isLoading} />
                            </div>
                            <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : `Subscribe to ${plan.name} Plan`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

