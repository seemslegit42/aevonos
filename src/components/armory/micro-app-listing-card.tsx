'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import type { MicroAppManifest } from '@/config/micro-apps';
import { useToast } from '@/hooks/use-toast';
import { purchaseMicroApp } from '@/app/actions';

interface MicroAppListingCardProps {
  app: MicroAppManifest;
  unlockedAppIds: string[];
  onAcquire: () => void;
}

export function MicroAppListingCard({ app, unlockedAppIds, onAcquire }: MicroAppListingCardProps) {
  const { toast } = useToast();
  const [isAcquiring, setIsAcquiring] = useState(false);
  const isIncluded = app.priceModel === 'included';
  const isUnlocked = isIncluded || unlockedAppIds.includes(app.id);

  const handleAcquire = async () => {
    if (isUnlocked || isAcquiring) return;
    setIsAcquiring(true);
    const result = await purchaseMicroApp(app.id);
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
    <Card className="bg-foreground/10 backdrop-blur-xl border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden">
            <Image 
                src={app.imageUrl} 
                alt={app.name} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                data-ai-hint={app.imageHint}
            />
        </div>
        <div className="p-4">
            <CardTitle className="font-headline text-lg text-foreground">{app.name}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">by {app.author}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-foreground/80">{app.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-2xl font-bold text-primary font-headline">
            {isIncluded ? 'Included' : `${app.creditCost} Ξ`}
        </p>
        <Button variant={isUnlocked ? "secondary" : "default"} onClick={handleAcquire} disabled={isUnlocked || isAcquiring}>
            {getActionContent()}
        </Button>
      </CardFooter>
    </Card>
  );
}
