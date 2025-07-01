
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';
import { chaosCardManifest, ChaosCardManifest } from '@/config/chaos-cards';
import { ChaosCardListingCard } from '@/components/armory/chaos-card-listing-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Workspace, ChaosCard as PrismaChaosCard, UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { getNudges } from '@/app/actions';
import { microAppManifests, MicroAppManifest } from '@/config/micro-apps';

interface FullUser extends User {
    ownedChaosCards: PrismaChaosCard[];
}

export default function Armory() {
  const [apps, setApps] = useState<MicroAppManifest[]>([]);
  const [cards, setCards] = useState<ChaosCardManifest[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchArmoryData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [workspaceResponse, userResponse] = await Promise.all([
            fetch('/api/workspaces/me'),
            fetch('/api/users/me')
        ]);
        
        if (!workspaceResponse.ok) throw new Error('Failed to fetch workspace data');
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        
        const allAppsData: MicroAppManifest[] = microAppManifests;
        const workspaceData: Workspace = await workspaceResponse.json();
        const userData: FullUser = await userResponse.json();

        const isOwner = userData.id === workspaceData.ownerId;
        
        // Filter apps based on user permissions
        const filteredApps = allAppsData.filter(app => {
            if (app.permissionsRequired.length === 0) {
                return true; // No permissions required
            }
            if (app.permissionsRequired.includes('OWNER_ONLY') && !isOwner) {
                return false; // Owner-only app, user is not owner
            }
            if (app.permissionsRequired.includes('ADMIN') && userData.role !== UserRole.ADMIN) {
                return false; // Admin-only app, user is not admin
            }
            // Add other role checks here if needed...
            return true;
        });

        setApps(filteredApps);
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

  useEffect(() => {
      const showNudges = async () => {
          const nudges = await getNudges();
          if (nudges && nudges.length > 0) {
              nudges.forEach((nudge, index) => {
                  setTimeout(() => {
                      toast({
                          title: "BEEP whispers...",
                          description: nudge.message,
                          duration: 6000,
                      });
                  }, index * 2000); // Stagger the toasts
              });
          }
      };
      showNudges();
  }, [toast]);

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
