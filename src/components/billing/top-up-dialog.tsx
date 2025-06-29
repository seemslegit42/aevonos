
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestCreditTopUp } from '@/app/actions';

interface TopUpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
}

const creditPacks = [
  { amount: 25, label: "Scout Pack", price: "$25 CAD" },
  { amount: 50, label: "Artisan Pack", price: "$50 CAD" },
  { amount: 100, label: "Forge Pack", price: "$100 CAD" },
  { amount: 250, label: "Obelisk Pack", price: "$250 CAD" },
];

export default function TopUpDialog({ isOpen, onOpenChange, workspaceId }: TopUpDialogProps) {
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
      onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top-Up ΞCredits via Interac e-Transfer</DialogTitle>
          <DialogDescription>
            1. Send an e-Transfer to <strong className="text-primary">credits@aevonos.com</strong> with your Workspace ID in the message/memo: <strong className="text-primary font-mono">{workspaceId}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
            <Label>2. Select the credit pack you sent payment for</Label>
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
        </div>
        <DialogFooter>
             <p className="text-xs text-muted-foreground text-left pr-6">Credits will be applied to your account by an administrator once payment is confirmed.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
