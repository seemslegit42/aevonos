
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
    
    const handleSubscribe = () => {
        setIsLoading(true);
        setTimeout(() => {
            toast({
                title: 'Subscription Initiated!',
                description: `Welcome to the ${plan.name} tier. Your canvas is being upgraded.`,
            });
            router.push('/');
        }, 1500);
    }

    return (
        <div className="w-full min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/pricing">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Plans
                    </Link>
                </Button>
                <Card className="bg-background/80 backdrop-blur-md">
                    <div className="grid md:grid-cols-2">
                        <div className="p-6">
                            <CardHeader className="p-0">
                                <CardTitle className="text-2xl font-headline">Order Summary</CardTitle>
                                <CardDescription>You are subscribing to the {plan.name} plan.</CardDescription>
                            </CardHeader>
                            <Separator className="my-4"/>
                            <div className="space-y-4">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-accent" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Separator className="my-4"/>
                                <div className="flex justify-between font-semibold">
                                    <span>Total Due Today</span>
                                    <span>${plan.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/30 rounded-r-lg">
                             <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-xl font-headline">Payment Information</CardTitle>
                                <CardDescription>This is a mock payment form.</CardDescription>
                            </CardHeader>
                            <div className="space-y-4">
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
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
