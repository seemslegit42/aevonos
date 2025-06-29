
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestCreditTopUp } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

interface TopUpProps {
  workspaceId: string;
}

const creditPacks = [
  { amount: 25, label: "Scout Pack", price: "$25 CAD" },
  { amount: 50, label: "Artisan Pack", price: "$50 CAD" },
  { amount: 100, label: "Forge Pack", price: "$100 CAD" },
  { amount: 250, label: "Obelisk Pack", price: "$250 CAD" },
];

export default function TopUp({ workspaceId }: TopUpProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const handleTopUpRequest = async (amount: number) => {
    setSelectedPack(amount);
    setIsLoading(true);
    const result = await requestCreditTopUp(amount);
    if (result.success) {
      toast({
        title: 'Top-Up Request Logged',
        description: result.message,
      });
      // In a micro-app, we might not close it automatically,
      // letting the user see the result. For now, this is fine.
    } else {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: result.error,
      });
    }
    setIsLoading(false);
    setSelectedPack(null);
  };

  return (
    <div className="p-2 h-full flex flex-col">
        <Card className="bg-background/50 flex-grow">
            <CardHeader className="p-3">
                <CardTitle className="text-base">Top-Up ΞCredits</CardTitle>
                <CardDescription className="text-xs">
                    Send an e-Transfer to <strong className="text-primary">credits@aevonos.com</strong> with your Workspace ID in the memo: <strong className="text-primary font-mono">{workspaceId}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
                 <Label>Select the credit pack you sent payment for:</Label>
                 <div className="grid grid-cols-2 gap-3">
                    {creditPacks.map(pack => (
                        <Button 
                            key={pack.amount} 
                            variant="outline" 
                            className="h-auto flex flex-col p-3 text-left items-start space-y-1" 
                            onClick={() => handleTopUpRequest(pack.amount)} 
                            disabled={isLoading}
                        >
                             {isLoading && selectedPack === pack.amount ? (
                                <div className="w-full flex justify-center items-center h-12">
                                    <Loader2 className="animate-spin" />
                                </div>
                             ) : (
                                <>
                                    <span className="text-2xl font-bold">{pack.amount} Ξ</span>
                                    <span className="text-sm font-semibold">{pack.label}</span>
                                    <span className="text-xs text-muted-foreground">{pack.price}</span>
                                </>
                             )}
                        </Button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">Credits will be applied to your account by an administrator once payment is confirmed.</p>
            </CardContent>
        </Card>
    </div>
  );
}
