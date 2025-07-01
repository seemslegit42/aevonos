
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';
import { artifactManifests, type ArtifactManifest } from '@/config/artifacts';
import { ChaosCardListingCard } from '@/components/armory/chaos-card-listing-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Workspace, ChaosCard as PrismaChaosCard, UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { getNudges } from '@/app/actions';

interface FullUser extends User {
    ownedChaosCards: PrismaChaosCard[];
}

export default function Armory() {
  const [artifacts, setArtifacts] = useState<ArtifactManifest[]>([]);
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
        
        const allArtifacts: ArtifactManifest[] = artifactManifests;
        const workspaceData: Workspace = await workspaceResponse.json();
        const userData: FullUser = await userResponse.json();

        const isOwner = userData.id === workspaceData.ownerId;
        
        const filteredArtifacts = allArtifacts.filter(artifact => {
            if (!artifact.permissionsRequired || artifact.permissionsRequired.length === 0) {
                return true;
            }
            if (artifact.permissionsRequired.includes('OWNER_ONLY') && !isOwner) {
                return false;
            }
            if (artifact.permissionsRequired.includes('ADMIN') && userData.role !== UserRole.ADMIN) {
                return false;
            }
            return true;
        });

        setArtifacts(filteredArtifacts);
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
  
  const microApps = artifacts.filter(a => a.type === 'MICRO_APP');
  const chaosCards = artifacts.filter(a => a.type === 'CHAOS_CARD');

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
                      {microApps.map(artifact => (
                          <MicroAppListingCard 
                            key={artifact.id} 
                            artifact={artifact} 
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
                      {chaosCards.map(artifact => (
                          <ChaosCardListingCard 
                            key={artifact.id} 
                            artifact={artifact}
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
