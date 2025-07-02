
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Shield, Briefcase, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const offerings = [
    {
        icon: Briefcase,
        title: "Perpetual License: Arcane IDE",
        description: "A lifetime license for the industry's most powerful code editor, forged for agents.",
        price: "150,000 Ξ"
    },
    {
        icon: Shield,
        title: "Forged Artifact: The Aegis Node",
        description: "A pre-configured, obsidian-cased private server for running your own secure daemons.",
        price: "750,000 Ξ"
    },
    {
        icon: Award,
        title: "Sovereign Counsel: One Hour with The Architect",
        description: "A one-on-one strategic consultation on automation and system design with the core ΛΞVON OS team.",
        price: "1,250,000 Ξ"
    },
    {
        icon: Gem,
        title: "A Seat in the Pantheon",
        description: "Transmute an astronomical sum of Ξ into a token fraction of actual equity in the ΛΞVON OS company.",
        price: "1,000,000,000 Ξ"
    }
];

const OfferingCard = ({ offering, index }: { offering: typeof offerings[0], index: number }) => {
    const { toast } = useToast();
    const handleAcquire = () => {
        toast({
            title: "Tribute Proposed",
            description: `Your request to acquire "${offering.title}" has been sent to the Proxy.Agent for review.`,
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="bg-background/50 border-primary/30 h-full flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <offering.icon className="w-8 h-8 text-primary" />
                        <CardTitle className="text-lg">{offering.title}</CardTitle>
                    </div>
                    <CardDescription>{offering.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <CardContent className="flex justify-between items-center">
                    <p className="text-2xl font-bold font-headline text-gilded-accent">{offering.price}</p>
                    <Button onClick={handleAcquire}>Propose Tribute</Button>
                </CardContent>
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
