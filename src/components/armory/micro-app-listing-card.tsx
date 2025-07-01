
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import type { ArtifactManifest } from '@/config/artifacts';
import { useToast } from '@/hooks/use-toast';
import { purchaseMicroApp, logInstrumentDiscovery } from '@/app/actions';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';

interface MicroAppListingCardProps {
  artifact: ArtifactManifest;
  unlockedAppIds: string[];
  onAcquire: () => void;
}

export function MicroAppListingCard({ artifact, unlockedAppIds, onAcquire }: MicroAppListingCardProps) {
  const { toast } = useToast();
  const [isAcquiring, setIsAcquiring] = useState(false);
  const isIncluded = artifact.priceModel === 'included';
  const isUnlocked = isIncluded || unlockedAppIds.includes(artifact.id);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Fire and forget the discovery log
          logInstrumentDiscovery(artifact.id);
          // Disconnect after first view to prevent re-triggering
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [artifact.id]);

  const handleAcquire = async () => {
    if (isUnlocked || isAcquiring) return;
    setIsAcquiring(true);
    const result = await purchaseMicroApp(artifact.id);
    if (result.success) {
      toast({ title: 'Acquisition Successful', description: result.message });
      onAcquire();
    } else {
      toast({ variant: 'destructive', title: 'Acquisition Failed', description: result.error });
    }
    setIsAcquiring(false);
  };

  const getActionContent = () => {
      if (isAcquiring) return <Loader2 className="animate-spin" />;
      if (isUnlocked) return <><Check className="mr-2 h-4 w-4" /> Unlocked</>;
      return <><ShoppingCart className="mr-2 h-4 w-4" /> Acquire</>;
  }

  return (
    <Card ref={cardRef} className="bg-foreground/10 backdrop-blur-xl border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden">
            <Image 
                src={artifact.imageUrl} 
                alt={artifact.name} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                data-ai-hint={artifact.imageHint}
            />
        </div>
        <div className="p-4">
            <CardTitle className="font-headline text-lg text-foreground">{artifact.name}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">by {artifact.author}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-foreground/80">{artifact.description}</p>
        {artifact.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
                {artifact.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
            </div>
        )}
        {artifact.branding && (
            <>
                <Separator className="my-3 bg-border/20" />
                <div className="text-xs text-muted-foreground space-y-1 font-mono">
                    {artifact.branding.doctrine && <p><strong>Doctrine:</strong> {artifact.branding.doctrine}</p>}
                    {artifact.branding.callsign && <p><strong>Callsign:</strong> {artifact.branding.callsign}</p>}
                    {artifact.branding.forgedIn && <p><strong>Forged In:</strong> {artifact.branding.forgedIn}</p>}
                    {artifact.branding.poweredBy && <p><strong>Powered By:</strong> {artifact.branding.poweredBy.join(', ')}</p>}
                </div>
            </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-2xl font-bold text-primary font-headline">
            {isIncluded ? 'Included' : `${artifact.creditCost} Ξ`}
        </p>
        <Button variant={isUnlocked ? "secondary" : "default"} onClick={handleAcquire} disabled={isUnlocked || isAcquiring}>
            {getActionContent()}
        </Button>
      </CardFooter>
    </Card>
  );
}
