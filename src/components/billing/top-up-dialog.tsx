
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestCreditTopUp } from '@/app/actions';

interface TopUpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
}

export default function TopUpDialog({ isOpen, onOpenChange, workspaceId }: TopUpDialogProps) {
  const { toast } = useToast();
  const email = 'credits@aevonos.com';
  const [isLoading, setIsLoading] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    setIsLoading(true);
    const result = await requestCreditTopUp(formData);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top-Up ΞCredits via Interac e-Transfer</DialogTitle>
          <DialogDescription>
            Send an e-Transfer with the details below, then log your request here to await confirmation.
          </DialogDescription>
        </DialogHeader>
        <form action={handleFormAction} id="top-up-form" className="space-y-4 py-2">
            <div className='space-y-1'>
                <Label htmlFor="payee-email">1. Recipient Email</Label>
                <div className="flex items-center gap-2">
                    <Input id="payee-email" value={email} readOnly className="font-mono bg-muted" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => {
                      navigator.clipboard.writeText(email);
                      toast({ title: 'Copied to Clipboard', description: `Email has been copied.` });
                    }}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className='space-y-1'>
                 <Label htmlFor="workspace-id">2. Message / Memo (Required)</Label>
                <div className="flex items-center gap-2">
                    <Input id="workspace-id" value={workspaceId} readOnly className="font-mono bg-muted" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(workspaceId);
                        toast({ title: 'Copied to Clipboard', description: `Workspace ID has been copied.` });
                    }}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                 <p className="text-xs text-destructive">You must include your Workspace ID in the e-Transfer message field.</p>
            </div>
            
            <div className='space-y-1'>
                <Label htmlFor="amount">3. Amount Sent (CAD)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="1" placeholder="100.00" required className="font-mono" />
            </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="top-up-form" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Log My e-Transfer Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
