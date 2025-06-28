'use client';

import React, { useState, useEffect } from 'react';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { type MicroAppManifest } from '@/config/micro-apps';
import { Skeleton } from '../ui/skeleton';

export default function Armory() {
  const [apps, setApps] = useState<MicroAppManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getMicroApps() {
      try {
        const response = await fetch('/api/microapps');
        if (!response.ok) {
          console.error(`Failed to fetch microapps: ${response.status} ${response.statusText}`);
          return;
        }
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error("Error fetching micro-apps:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getMicroApps();
  }, []);

  const disgruntledPackApps = apps.filter(app => app.isFeatured);

  return (
    <ScrollArea className="h-full">
        <div className="p-2">
            <section id="featured-bundle" className="mb-8">
                <h2 className="text-xl font-headline font-semibold text-primary mb-3">Featured Drop</h2>
                <Card className="bg-foreground/10 backdrop-blur-xl border-primary/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline text-foreground">🔻 The Disgruntled Employee Pack</CardTitle>
                        <CardDescription className="text-foreground/80">The essential toolkit for surviving corporate life.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs">
                            {disgruntledPackApps.map(app => (
                                <li key={app.name} className="flex items-center gap-2 text-foreground">
                                    <Check className="w-3 h-3 text-accent flex-shrink-0" />
                                    <span>{app.name}</span>
                                </li>
                            ))}
                        </ul>
                        <Button size="sm" className="w-full">Get The Bundle (Free)</Button>
                    </CardContent>
                </Card>
            </section>

            <section id="full-catalog">
                 <h2 className="text-xl font-headline font-semibold text-primary mb-3">Full Catalog</h2>
                 {isLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Skeleton className="h-80 w-full" />
                         <Skeleton className="h-80 w-full" />
                         <Skeleton className="h-80 w-full" />
                         <Skeleton className="h-80 w-full" />
                     </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {apps.map(app => <MicroAppListingCard key={app.id} app={app} />)}
                    </div>
                 )}
            </section>
        </div>
    </ScrollArea>
  );
}
