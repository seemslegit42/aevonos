'use client';

import React, { useState, useEffect } from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import FirstWhisperCard from '@/components/layout/FirstWhisperCard';
import type { User } from '@prisma/client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { MobileAppStack } from './mobile-app-stack';
import { ScrollArea } from './ui/scroll-area';

interface MicroAppGridProps {
  apps: MicroApp[];
  user: User | null;
  children: React.ReactNode;
}

export function MicroAppGrid({ apps, user, children }: MicroAppGridProps) {
  const [showWhisper, setShowWhisper] = useState(false);
  const isMobile = useIsMobile();
  const { closeApp, bringToFront, activeAppId } = useAppStore((state) => ({
    closeApp: state.closeApp,
    bringToFront: state.bringToFront,
    activeAppId: state.activeAppId,
  }));

  useEffect(() => {
    if (apps.length === 0 && user?.firstWhisper) {
      setShowWhisper(true);
    } else {
      setShowWhisper(false);
    }
  }, [apps.length, user]);

  const onWhisperAction = () => {
    setShowWhisper(false); // Hide immediately on action
  };

  if (isMobile) {
    if (apps.length > 0) {
      // Use the new component for mobile view
      return <MobileAppStack apps={apps} activeAppId={activeAppId} bringToFront={bringToFront} closeApp={closeApp} />;
    }
    
    // Show dashboard or whisper if no apps are open on mobile
    return (
        <div className="h-full w-full">
            <ScrollArea className="h-full">
                {showWhisper && user ? (
                    <div className="p-4 flex justify-center items-center">
                        <FirstWhisperCard user={user} onAction={onWhisperAction} />
                    </div>
                ) : (
                    <>{children}</>
                )}
            </ScrollArea>
        </div>
    );
  }

  // Desktop layout
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {apps.map((app) => (
        <MicroAppCard key={app.id} app={app} />
      ))}
      
      {showWhisper && user ? (
          <FirstWhisperCard user={user} onAction={onWhisperAction} />
      ) : apps.length === 0 ? (
          <>{children}</>
      ) : null}
    </div>
  );
}
