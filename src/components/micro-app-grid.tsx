
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
    return (
      <div className="h-full w-full">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {showWhisper && user && (
              <div className="flex justify-center items-center">
                <FirstWhisperCard user={user} onAction={onWhisperAction} />
              </div>
            )}
            {apps.map(app => {
              const Icon = getAppIcon(app.type);
              const ContentComponent = getAppContent(app.type);
              return (
                <Card key={app.id} className="flex flex-col w-full" style={{ height: app.size.height }}>
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
              );
            })}
             {apps.length === 0 && !showWhisper && (
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
