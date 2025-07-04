
'use client';

import React, { useState, useEffect } from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import FirstWhisperCard from '@/components/layout/FirstWhisperCard';
import type { Agent, User, Workspace, Transaction } from '@prisma/client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getAppIcon, getAppContent } from './micro-app-registry';
import { ScrollArea } from './ui/scroll-area';
import DashboardWidgets from './dashboard/widgets/DashboardWidgets';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface MicroAppGridProps {
  apps: MicroApp[];
  user: User | null;
  initialAgents: Agent[];
  workspace: (Workspace & { membersCount: number }) | null;
  recentTransactions: (Transaction & { amount: number })[];
}

export function MicroAppGrid({ apps, user, initialAgents, workspace, recentTransactions }: MicroAppGridProps) {
  const [showWhisper, setShowWhisper] = useState(false);
  const isMobile = useIsMobile();
  const closeApp = useAppStore(state => state.closeApp);

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
      return (
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {apps.map(app => {
              const Icon = getAppIcon(app.type);
              const ContentComponent = getAppContent(app.type);
              return (
                <CarouselItem key={app.id} className="h-full">
                  <div className="p-2 md:p-4 h-full">
                    <Card className="flex flex-col w-full h-full">
                      <CardHeader className="flex flex-row items-center justify-between space-x-4 p-4 flex-shrink-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex-shrink-0 items-center justify-center">
                            <Icon className="w-full h-full text-primary" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <CardTitle className="font-headline text-lg text-foreground truncate">{app.title}</CardTitle>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => closeApp(app.id)}>
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
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
           {apps.length > 1 && <CarouselPrevious className="left-0" />}
           {apps.length > 1 && <CarouselNext className="right-0" />}
        </Carousel>
      );
    }

    // Show dashboard or whisper if no apps are open on mobile
    return (
        <div className="h-full w-full">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    {showWhisper && user ? (
                        <div className="flex justify-center items-center">
                            <FirstWhisperCard user={user} onAction={onWhisperAction} />
                        </div>
                    ) : (
                         <DashboardWidgets
                            initialAgents={initialAgents}
                            workspace={workspace}
                            recentTransactions={recentTransactions}
                        />
                    )}
                </div>
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
          <DashboardWidgets 
            initialAgents={initialAgents}
            workspace={workspace}
            recentTransactions={recentTransactions}
          />
      ) : null}
    </div>
  );
}
