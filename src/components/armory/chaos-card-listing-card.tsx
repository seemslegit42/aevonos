
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import type { ArtifactManifest } from '@/config/artifacts';
import { useToast } from '@/hooks/use-toast';
import { makeFollyTribute, logInstrumentDiscovery } from '@/app/actions';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


interface ChaosCardListingCardProps {
  artifact: ArtifactManifest;
  ownedCardKeys: string[];
  onAcquire: () => void;
}

const classStyles = {
    AESTHETIC: 'border-accent text-accent',
    AGENTIC: 'border-primary text-primary',
    SYSTEMIC: 'border-yellow-400 text-yellow-400',
    SYNDICATE: 'border-ring text-ring',
    BOON: 'border-gilded-accent text-gilded-accent',
};

export function ChaosCardListingCard({ artifact, ownedCardKeys, onAcquire }: ChaosCardListingCardProps) {
  const { toast } = useToast();
  const [isAcquiring, setIsAcquiring] = useState(false);
  const isOwned = ownedCardKeys.includes(artifact.id);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          logInstrumentDiscovery(artifact.id);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [artifact.id]);

  const handleAcquire = async () => {
    if (isOwned || isAcquiring) return;
    setIsAcquiring(true);
    const result = await makeFollyTribute(artifact.id);
    
    if (result.success) {
      if (result.outcome === 'win' || result.outcome === 'pity_boon') {
        toast({ title: 'Acquisition Successful', description: result.message });
        onAcquire(); // Refresh to show ownership
      } else {
        toast({
          variant: 'default',
          title: 'Tribute Lost',
          description: result.message,
        });
        onAcquire(); // Still refresh to show credit change
      }
    } else {
      toast({ variant: 'destructive', title: 'Tribute Failed', description: result.error });
    }
    
    setIsAcquiring(false);
  };

  const getActionContent = () => {
      if (isAcquiring) return <Loader2 className="animate-spin" />;
      if (isOwned) return <><Check className="mr-2 h-4 w-4" /> Owned</>;
      return <><ShoppingCart className="mr-2 h-4 w-4" /> Make Tribute</>;
  }

  const cardClass = artifact.cardClass ? classStyles[artifact.cardClass] || classStyles.AESTHETIC : classStyles.AESTHETIC;

  return (
    <Card ref={cardRef} className="bg-foreground/10 backdrop-blur-xl border border-foreground/30 hover:border-primary transition-all duration-300 flex flex-col group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/5.6] w-full overflow-hidden">
            <Image 
                src={artifact.imageUrl} 
                alt={artifact.name} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                data-ai-hint={artifact.imageHint}
            />
        </div>
        <div className="p-4">
            <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-lg text-foreground">{artifact.name}</CardTitle>
              {artifact.cardClass && (
                <Badge variant="outline" className={cn("capitalize text-xs", cardClass)}>{artifact.cardClass.toLowerCase()}</Badge>
              )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-foreground/80">{artifact.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-2xl font-bold text-primary font-headline">
            {`${artifact.creditCost} Ξ`}
        </p>
        <Button variant={isOwned ? "secondary" : "default"} onClick={handleAcquire} disabled={isOwned || isAcquiring}>
            {getActionContent()}
        </Button>
      </CardFooter>
    </Card>
  );
}

    
