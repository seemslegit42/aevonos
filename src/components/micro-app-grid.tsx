
'use client';

import React, { useState, useEffect } from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import FirstWhisperCard from '@/components/layout/FirstWhisperCard';
import type { User } from '@prisma/client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getAppIcon, getAppContent } from './micro-app-registry';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

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
      const sortedApps = [...apps].sort((a, b) => a.zIndex - b.zIndex);
      
      return (
        <div className="relative h-full w-full p-4 pt-0">
          <AnimatePresence>
            {sortedApps.map((app, index) => {
              const isActive = app.id === activeAppId;
              const depth = sortedApps.length - 1 - index;

              const Icon = getAppIcon(app.type);
              const ContentComponent = getAppContent(app.type);

              return (
                <motion.div
                  key={app.id}
                  layoutId={app.id}
                  initial={{ opacity: 0, y: 300 }}
                  animate={{
                    y: isActive ? 0 : -depth * 20,
                    scale: isActive ? 1 : Math.max(0, 1 - depth * 0.05),
                    opacity: isActive ? 1 : 1 - depth * 0.2,
                    zIndex: app.zIndex,
                  }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-x-2 top-2 bottom-2 cursor-pointer"
                  onClick={() => !isActive && bringToFront(app.id)}
                >
                  <Card className="flex flex-col w-full h-full shadow-lg border-primary/20 pointer-events-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-x-4 p-4 flex-shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex-shrink-0 items-center justify-center">
                          <Icon className="w-full h-full text-primary" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <CardTitle className="font-headline text-lg text-foreground truncate">{app.title}</CardTitle>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); closeApp(app.id); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    {ContentComponent && (
                      <CardContent className="flex-grow p-0 overflow-hidden min-h-0">
                        <div className="w-full h-full overflow-y-auto">
                          <ContentComponent id={app.id} {...app.contentProps} />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      );
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
