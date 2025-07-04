'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type MicroApp } from '@/store/app-store';
import { getAppIcon, getAppContent } from '@/components/micro-app-registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileAppStackProps {
  apps: MicroApp[];
  activeAppId: string | null;
  bringToFront: (id: string) => void;
  closeApp: (id: string) => void;
}

export function MobileAppStack({ apps, activeAppId, bringToFront, closeApp }: MobileAppStackProps) {
  const sortedApps = [...apps].sort((a, b) => a.zIndex - b.zIndex);
  const activeIndex = sortedApps.findIndex(app => app.id === activeAppId);

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
              initial={{ y: '100vh', opacity: 0 }}
              animate={{
                y: isActive ? 0 : `${depth * 10}px`,
                scale: isActive ? 1 : Math.max(0.9, 1 - depth * 0.04),
                opacity: isActive ? 1 : (index === activeIndex - 1 ? 1 : 0),
                zIndex: app.zIndex,
              }}
              exit={{ y: '100vh', opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="absolute inset-x-2 top-2 bottom-2 shadow-2xl rounded-2xl cursor-pointer"
              onClick={() => !isActive && bringToFront(app.id)}
            >
              <Card className="flex flex-col w-full h-full shadow-lg border-primary/20 bg-background/80 backdrop-blur-xl pointer-events-auto overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-x-4 p-4 flex-shrink-0">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 flex-shrink-0 items-center justify-center">
                      <Icon className="w-full h-full text-primary" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <CardTitle className="font-headline text-lg text-foreground truncate">{app.title}</CardTitle>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="z-10 flex-shrink-0" onClick={(e) => { e.stopPropagation(); closeApp(app.id); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                {ContentComponent && (
                  <CardContent className="flex-grow p-0 overflow-hidden min-h-0">
                    <ScrollArea className="h-full">
                        <ContentComponent id={app.id} {...app.contentProps} />
                    </ScrollArea>
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
