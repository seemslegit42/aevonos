
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { clearFirstWhisper } from '@/app/actions';
import type { User, UserPsyche } from '@prisma/client';
import { Button } from '../ui/button';
import { useAppStore } from '@/store/app-store';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias' | 'psyche' | 'firstWhisper'> | null;

export function FirstWhisperHandler({ user }: { user: UserProp }) {
  const { toast } = useToast();
  const { handleCommandSubmit } = useAppStore();

  useEffect(() => {
    if (user?.firstWhisper) {
      const { dismiss } = toast({
        title: "BEEP whispers...",
        description: user.firstWhisper,
        duration: Infinity, // Keep it open until user interacts
        action: (
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => {
              handleCommandSubmit("launch loom studio with a blank template");
              dismiss();
              clearFirstWhisper();
            }}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              dismiss();
              clearFirstWhisper();
            }}>
              Decline
            </Button>
          </div>
        ),
      });

      // Also clear it if they just navigate away without interacting
      return () => {
        clearFirstWhisper();
      };
    }
  }, [user, toast, handleCommandSubmit]);

  return null; // This component doesn't render anything itself
}
