
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Shield, Briefcase, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const offerings = [
    {
        icon: Briefcase,
        title: "Perpetual License: Arcane IDE",
        description: "A lifetime license for the industry's most powerful code editor, forged for agents.",
        price: "150,000 Ξ",
        scarcity: 'Ethereal',
        availability: 'Always Available'
    },
    {
        icon: Shield,
        title: "Forged Artifact: The Aegis Node",
        description: "A pre-configured, obsidian-cased private server for running your own secure daemons.",
        price: "750,000 Ξ",
        scarcity: 'Rare',
        availability: '18 of 200 Remaining this Cycle'
    },
    {
        icon: Award,
        title: "Sovereign Counsel: One Hour with The Architect",
        description: "A one-on-one strategic consultation on automation and system design with the core ΛΞVON OS team.",
        price: "1,250,000 Ξ",
        scarcity: 'Mythic',
        availability: '2 of 5 Remaining this Epoch'
    },
    {
        icon: Gem,
        title: "A Seat in the Pantheon",
        description: "Transmute an astronomical sum of ΞCredits into a token fraction of actual equity in the ΛΞVON OS company.",
        price: "1,000,000,000 Ξ",
        scarcity: 'Divine',
        availability: 'One Sovereign may wield this.'
    }
];

const scarcityStyles: Record<string, string> = {
    Ethereal: 'border-muted-foreground/50 text-muted-foreground',
    Rare: 'border-blue-400/50 text-blue-400',
    Mythic: 'border-purple-400/50 text-purple-400',
    Divine: 'border-gilded-accent/50 text-gilded-accent',
};

const OfferingCard = ({ offering, index }: { offering: typeof offerings[0], index: number }) => {
    const { toast } = useToast();
    const handleAcquire = () => {
        toast({
            title: "Tribute Proposed",
            description: `Your request to acquire "${offering.title}" has been sent to the Proxy.Agent for review.`,
        });
    }
    const cardClass = scarcityStyles[offering.scarcity] || 'border-primary/30';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className={cn("bg-background/50 h-full flex flex-col", cardClass)}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <offering.icon className="w-8 h-8 text-primary" />
                            <CardTitle className="text-lg">{offering.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className={cn("capitalize", cardClass)}>{offering.scarcity}</Badge>
                    </div>
                    <CardDescription>{offering.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end p-6 pt-0">
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">{offering.availability}</p>
                    </div>
                    <Separator className="my-2 bg-border/20"/>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                            <Shield size={14} />
                            <span>Aegis-Enforced Provenance</span>
                        </div>
                        <ul className="list-disc pl-6 text-foreground/70">
                            <li>Digitally-signed certificate of ownership</li>
                            <li>Transaction recorded on immutable Scroll</li>
                            <li>Bound to a unique Ritual ID</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <p className="text-2xl font-bold font-headline text-gilded-accent">{offering.price}</p>
                    <Button onClick={handleAcquire}>Propose Tribute</Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default function ObeliskMarketplace() {
  return (
    <div className="h-full p-4 overflow-y-auto space-y-4">
       <div className="text-center">
            <h2 className="text-3xl font-headline text-primary">The Obelisk Marketplace</h2>
            <p className="text-muted-foreground">"Where will is transmuted into reality."</p>
       </div>
       <div className="grid md:grid-cols-2 gap-4">
           {offerings.map((offering, i) => (
                <OfferingCard key={i} offering={offering} index={i} />
           ))}
       </div>
    </div>
  );
}
