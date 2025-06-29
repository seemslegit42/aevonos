
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';
import { chaosCardManifest, ChaosCardManifest } from '@/config/chaos-cards';
import { ChaosCardListingCard } from '@/components/armory/chaos-card-listing-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Workspace, ChaosCard as PrismaChaosCard } from '@prisma/client';
import type { User } from '@prisma/client';

interface FullUser extends User {
    ownedChaosCards: PrismaChaosCard[];
}

export default function Armory() {
  const [apps, setApps] = useState<any[]>([]);
  const [cards, setCards] = useState<ChaosCardManifest[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArmoryData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [appsResponse, workspaceResponse, userResponse] = await Promise.all([
            fetch('/api/microapps'),
            fetch('/api/workspaces/me'),
            fetch('/api/users/me')
        ]);
        
        if (!appsResponse.ok) throw new Error('Failed to fetch micro-apps');
        if (!workspaceResponse.ok) throw new Error('Failed to fetch workspace data');
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        
        const appsData = await appsResponse.json();
        const workspaceData = await workspaceResponse.json();
        const userData = await userResponse.json();

        setApps(appsData);
        setCards(chaosCardManifest);
        setWorkspace(workspaceData);
        setUser(userData);

      } catch (error) {
        console.error("Error fetching Armory data:", error);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchArmoryData();
  }, [fetchArmoryData]);

  const unlockedAppIds = workspace?.unlockedAppIds || [];
  const ownedCardKeys = user?.ownedChaosCards.map(c => c.key) || [];

  return (
    <div className="h-full p-2">
      <Tabs defaultValue="micro-apps" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="micro-apps">Micro-Apps</TabsTrigger>
            <TabsTrigger value="chaos-cards">Chaos Cards</TabsTrigger>
          </TabsList>
          <TabsContent value="micro-apps" className="flex-grow mt-2">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {isLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                         <Skeleton className="h-80 w-full" />
                         <Skeleton className="h-80 w-full" />
                     </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                      {apps.map(app => (
                          <MicroAppListingCard 
                            key={app.id} 
                            app={app} 
                            unlockedAppIds={unlockedAppIds}
                            onAcquire={fetchArmoryData}
                          />
                      ))}
                    </div>
                 )}
              </ScrollArea>
          </TabsContent>
          <TabsContent value="chaos-cards" className="flex-grow mt-2">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                         <Skeleton className="h-96 w-full" />
                         <Skeleton className="h-96 w-full" />
                         <Skeleton className="h-96 w-full" />
                     </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                      {cards.map(card => (
                          <ChaosCardListingCard 
                            key={card.key} 
                            card={card}
                            ownedCardKeys={ownedCardKeys}
                            onAcquire={fetchArmoryData}
                          />
                      ))}
                    </div>
                 )}
              </ScrollArea>
          </TabsContent>
      </Tabs>
    </div>
  );
}
