
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useAppStore } from '@/store/app-store';

const EXCHANGE_RATE = 10000;
const TRANSMUTATION_TITHE = 0.15;

interface ProxyAgentProps {
  id: string; // app instance id
  vendor?: string;
  amount?: number;
  currency?: string;
}

export default function ProxyAgent({ id, vendor = 'The Alchemist Bar', amount = 175, currency = 'CAD' }: ProxyAgentProps) {
  const { handleCommandSubmit, isLoading, closeApp } = useAppStore();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const baseCost = amount * EXCHANGE_RATE;
  const tithe = baseCost * TRANSMUTATION_TITHE;
  const totalDebit = baseCost + tithe;

  const handleAuthorize = async () => {
    const command = `transmute ${amount} ${currency} for ${vendor}`;
    await handleCommandSubmit(command);
    
    // The store doesn't easily return success/failure here.
    // We'll just assume success for the UI change for now.
    // A more robust solution would listen for the specific agent report.
    setIsAuthorized(true);
    toast({
        title: "Tribute Authorized",
        description: `Your tribute of ${amount.toFixed(2)} ${currency} to ${vendor} has been sent for fulfillment.`,
    });

    // Close the app after a delay to show the success state.
    setTimeout(() => {
        closeApp(id);
    }, 2000);
  };

  if (isAuthorized) {
      return (
          <div className="p-4 h-full flex flex-col items-center justify-center text-center">
              <Check className="w-16 h-16 text-accent mb-4" />
              <h3 className="text-xl font-headline">Tribute Complete</h3>
              <p className="text-muted-foreground text-sm">The mundane has been settled.</p>
          </div>
      )
  }

  return (
    <div className="p-2 h-full flex flex-col justify-center">
        <Card className="bg-background/50 border-primary/30">
            <CardHeader className="text-center p-4">
                <CardTitle className="font-headline text-lg tracking-widest text-primary">TRIBUTE REQUESTED</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm text-center">
                <div>
                    <p className="text-muted-foreground">Vendor</p>
                    <p className="text-lg font-semibold">{vendor}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">${amount.toFixed(2)} {currency}</p>
                </div>
                <Separator className="my-4" />
                 <div className="space-y-1 text-xs">
                     <div className="flex justify-between">
                         <span>Cost:</span>
                         <span className="font-mono">{baseCost.toLocaleString()} Ξ</span>
                     </div>
                      <div className="flex justify-between">
                         <span>Transmutation Tithe (15%):</span>
                         <span className="font-mono">{tithe.toLocaleString()} Ξ</span>
                     </div>
                      <div className="flex justify-between font-bold text-base border-t pt-1 mt-1">
                         <span>Total Sovereignty Cost:</span>
                         <span className="font-mono">{totalDebit.toLocaleString()} Ξ</span>
                     </div>
                </div>
                <Button size="lg" className="w-full mt-4" onClick={handleAuthorize} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Fingerprint className="mr-2" />}
                    AUTHORIZE WITH BIOMETRIC SIGNATURE
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
