
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';

interface FullUser extends User {
    ownedChaosCards: PrismaChaosCard[];
}

export default function Armory() {
  const [artifacts, setArtifacts] = useState<ArtifactManifest[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

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

  const microApps = useMemo(() => artifacts.filter(a => a.type === 'MICRO_APP'), [artifacts]);
  const chaosCards = useMemo(() => artifacts.filter(a => a.type === 'CHAOS_CARD'), [artifacts]);
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    microApps.forEach(a => a.tags?.forEach(t => tags.add(t)));
    return ['all', ...Array.from(tags).sort()];
  }, [microApps]);

  const filteredMicroApps = useMemo(() => {
    return microApps.filter(app => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const nameMatch = app.name.toLowerCase().includes(lowerCaseSearch);
      const descriptionMatch = app.description.toLowerCase().includes(lowerCaseSearch);
      const tagMatch = selectedTag === 'all' || (app.tags && app.tags.includes(selectedTag));
      return (nameMatch || descriptionMatch) && tagMatch;
    });
  }, [microApps, searchTerm, selectedTag]);

  const unlockedAppIds = workspace?.unlockedAppIds || [];
  const ownedCardKeys = user?.ownedChaosCards.map(c => c.key) || [];

  return (
    <div className="h-full p-2">
      <Tabs defaultValue="micro-apps" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="micro-apps">Micro-Apps</TabsTrigger>
            <TabsTrigger value="chaos-cards">Chaos Cards</TabsTrigger>
          </TabsList>
          <TabsContent value="micro-apps" className="flex-grow mt-2 flex flex-col gap-2 min-h-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Micro-Apps..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-2 pb-2">
                      {allTags.map(tag => (
                          <Button key={tag} variant={selectedTag === tag ? "default" : "outline"} size="sm" onClick={() => setSelectedTag(tag)} className="capitalize">
                              {tag}
                          </Button>
                      ))}
                    </div>
                  </ScrollArea>
              </div>
              <ScrollArea className="flex-grow min-h-0">
                {isLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                         <Skeleton className="h-80 w-full" />
                         <Skeleton className="h-80 w-full" />
                     </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                      {filteredMicroApps.map(artifact => (
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
              <ScrollArea className="h-full">
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
