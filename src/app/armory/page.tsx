
import React from 'react';
import Link from 'next/link';
import { MicroAppListingCard } from '@/components/armory/micro-app-listing-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { type MicroAppManifest } from '@/config/micro-apps';

// This function now fetches from the API endpoint defined in the spec,
// rather than importing the config file directly. This enforces the
// client-server contract and aligns with a services-oriented architecture.
async function getMicroApps(): Promise<MicroAppManifest[]> {
  try {
    // The fetch URL must be absolute when used in a Server Component.
    // In a real production environment, this would come from an environment variable.
    // For now, we use the local dev server URL for consistency with other parts of the app.
    const response = await fetch('http://localhost:9002/api/microapps', {
        cache: 'no-store' // We want the latest manifest data
    });

    if (!response.ok) {
        console.error(`Failed to fetch microapps: ${response.status} ${response.statusText}`);
        return []; // Return empty array on error to prevent crashing the page
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching micro-apps:", error);
    return []; // Gracefully handle fetch errors
  }
}

export default async function ArmoryPage() {
  const allApps = await getMicroApps();
  const disgruntledPackApps = allApps.filter(app => app.isFeatured);
  
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 pt-6 text-center">
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-wider">The Micro-App Cabinet</h1>
        <p className="text-muted-foreground mt-1">A Showcase of Dysfunctional Excellence.</p>
      </header>
      <main className="flex-grow overflow-y-auto p-4">
        <section id="featured-bundle" className="mb-12">
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Featured Drop</h2>
            <Card className="bg-foreground/10 backdrop-blur-xl border-primary/50">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-foreground">🔻 The Disgruntled Employee Pack</CardTitle>
                    <CardDescription className="text-foreground/80">The essential toolkit for surviving corporate life. Free forever for solo founders and burned-out teams.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mb-6">
                        {disgruntledPackApps.map(app => (
                            <li key={app.name} className="flex items-center gap-2 text-sm text-foreground">
                                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>{app.name}</span>
                            </li>
                        ))}
                    </ul>
                    <Button size="lg" className="w-full">Get The Bundle (Free)</Button>
                </CardContent>
            </Card>
        </section>

        <section id="full-catalog">
             <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Full Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allApps.map(app => <MicroAppListingCard key={app.id} app={app} />)}
            </div>
        </section>
      </main>
      <footer className="text-center text-xs text-muted-foreground pb-4 flex-shrink-0">
        <p>All transactions are final. Choose your instruments wisely.</p>
        <p className="mt-2"><Link href="/" className="hover:text-primary underline">Return to Canvas</Link></p>
      </footer>
    </div>
  );
}
