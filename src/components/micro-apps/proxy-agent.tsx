
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export default function ProxyAgent() {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    // Simulate API call
    setTimeout(() => {
        setIsAuthorizing(false);
        setIsAuthorized(true);
        toast({
            title: "Tribute Authorized",
            description: "$175.00 CAD sent to The Alchemist Bar.",
        });
    }, 1500);
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
                    <p className="text-lg font-semibold">The Alchemist Bar</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">$175.00 CAD</p>
                </div>
                <Separator className="my-4" />
                 <div className="space-y-1 text-xs">
                     <div className="flex justify-between">
                         <span>Cost:</span>
                         <span className="font-mono">1,750,000 Ξ</span>
                     </div>
                      <div className="flex justify-between">
                         <span>Transmutation Tithe:</span>
                         <span className="font-mono">262,500 Ξ</span>
                     </div>
                      <div className="flex justify-between font-bold text-base border-t pt-1 mt-1">
                         <span>Total Sovereignty Cost:</span>
                         <span className="font-mono">2,012,500 Ξ</span>
                     </div>
                </div>
                <Button size="lg" className="w-full mt-4" onClick={handleAuthorize} disabled={isAuthorizing}>
                    {isAuthorizing ? <Loader2 className="animate-spin" /> : <Fingerprint className="mr-2" />}
                    AUTHORIZE WITH BIOMETRIC SIGNATURE
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
