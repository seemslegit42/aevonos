'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getNudges } from '@/app/actions';

export function NudgeHandler() {
  const { toast } = useToast();

  useEffect(() => {
    // Check for nudges shortly after the app loads, then periodically.
    const initialTimeout = setTimeout(() => {
        showNudges();
    }, 15 * 1000); // 15 seconds after mount

    const interval = setInterval(() => {
        showNudges();
    }, 2 * 60 * 1000); // every 2 minutes

    const showNudges = async () => {
        try {
            const nudges = await getNudges();
            if (nudges && nudges.length > 0) {
                nudges.forEach((nudge, index) => {
                    setTimeout(() => {
                        toast({
                            title: "BEEP whispers...",
                            description: nudge.message,
                            duration: 8000,
                        });
                    }, index * 2500); // Stagger the toasts
                });
            }
        } catch (error) {
            console.error("Failed to get nudges:", error);
            // Fail silently, this is a background task.
        }
    };

    return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
    };
  }, [toast]);

  return null;
}
