
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import type { MicroAppManifest } from '@/config/micro-apps';
import { useToast } from '@/hooks/use-toast';

export function MicroAppListingCard({ app }: { app: MicroAppManifest }) {
  const { toast } = useToast();
  const isFree = app.price.toLowerCase() === 'included';

  const handleAcquire = () => {
    if (isFree) {
      toast({
        title: 'App Activated',
        description: `"${app.name}" has been added to your canvas.`,
      });
    } else {
      toast({
        title: 'Acquisition Initiated',
        description: `Opening secure channel to acquire "${app.name}". This is a mock action.`,
      });
    }
  };

  const ActionIcon = isFree ? Check : ShoppingCart;
  const actionText = isFree ? 'Activate' : 'Acquire';
  const buttonVariant = isFree ? 'secondary' : 'default';

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
        <p className="text-2xl font-bold text-primary font-headline">{app.price}</p>
        <Button variant={buttonVariant} onClick={handleAcquire}>
            <ActionIcon className="mr-2 h-4 w-4" /> {actionText}
        </Button>
      </CardFooter>
    </Card>
  );
}
