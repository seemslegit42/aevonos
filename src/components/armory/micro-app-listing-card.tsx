
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

type AppListing = {
  id: string;
  name: string;
  author: string;
  description: string;
  price: string;
  imageUrl: string;
  imageHint: string;
};

export function MicroAppListingCard({ app }: { app: AppListing }) {
  return (
    <Card className="bg-foreground/15 backdrop-blur-[20px] border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col group overflow-hidden">
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
        <Button><ShoppingCart className="mr-2 h-4 w-4" /> Purchase</Button>
      </CardFooter>
    </Card>
  );
}
