
'use client';

import React from 'react';
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
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopUpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
}

export default function TopUpDialog({ isOpen, onOpenChange, workspaceId }: TopUpDialogProps) {
  const { toast } = useToast();
  const email = 'credits@aevonos.com';

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: `${fieldName} has been copied.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top-Up ΞCredits via Interac e-Transfer</DialogTitle>
          <DialogDescription>
            Follow these instructions to manually add credits to your workspace. Credits will be applied within 24 hours of receiving the transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
            <div className='space-y-1'>
                <Label htmlFor="payee-email">Recipient Email</Label>
                <div className="flex items-center gap-2">
                    <Input id="payee-email" value={email} readOnly className="font-mono bg-muted" />
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(email, "Email")}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className='space-y-1'>
                 <Label htmlFor="workspace-id">Message / Memo (Required)</Label>
                <div className="flex items-center gap-2">
                    <Input id="workspace-id" value={workspaceId} readOnly className="font-mono bg-muted" />
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(workspaceId, "Workspace ID")}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                 <p className="text-xs text-destructive">You must include your Workspace ID in the e-Transfer message field for the credits to be applied correctly.</p>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
