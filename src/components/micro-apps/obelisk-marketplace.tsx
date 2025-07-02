
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Shield, Briefcase, Gem, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { type Workspace, UserRole, PlanTier } from '@prisma/client';

const offeringCategories = [
    {
        category: 'Instruments of the Craft',
        offerings: [
            {
                icon: Briefcase,
                title: "Perpetual License: Arcane IDE",
                description: "A lifetime license for the industry's most powerful code editor, forged for agents.",
                price: "150,000 Ξ",
                scarcity: 'Ethereal',
                availability: 'Always Available'
            },
        ]
    },
    {
        category: 'Forged Artifacts',
        offerings: [
            {
                icon: Shield,
                title: "Forged Artifact: The Aegis Node",
                description: "A pre-configured, obsidian-cased private server for running your own secure daemons.",
                price: "750,000 Ξ",
                scarcity: 'Rare',
                availability: '18 of 200 Remaining this Cycle'
            },
        ]
    },
    {
        category: 'Sovereign Counsel',
        offerings: [
             {
                icon: Award,
                title: "Sovereign Counsel: One Hour with The Architect",
                description: "A one-on-one strategic consultation on automation and system design with the core ΛΞVON OS team.",
                price: "1,250,000 Ξ",
                scarcity: 'Mythic',
                availability: '2 of 5 Remaining this Epoch'
            },
        ]
    },
    {
        category: 'A Seat in the Pantheon',
        offerings: [
             {
                icon: Gem,
                title: "A Seat in the Pantheon",
                description: "Transmute an astronomical sum of ΞCredits into a token fraction of actual equity in the ΛΞVON OS company.",
                price: "1,000,000,000 Ξ",
                scarcity: 'Divine',
                availability: 'One Sovereign may wield this.'
            }
        ]
    }
];


const scarcityStyles: Record<string, string> = {
    Ethereal: 'border-muted-foreground/50 text-muted-foreground',
    Rare: 'border-blue-400/50 text-blue-400',
    Mythic: 'border-purple-400/50 text-purple-400',
    Divine: 'border-gilded-accent/50 text-gilded-accent',
};

const OfferingCard = ({ offering, index }: { offering: (typeof offeringCategories)[0]['offerings'][0], index: number }) => {
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

const GatedView = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
        <Lock className="w-16 h-16 mb-4" />
        <h3 className="font-headline text-2xl text-foreground">Access Denied by Decree</h3>
        <p>Your Sovereignty Class is insufficient to enter the Obelisk Marketplace.</p>
        <p className="text-xs mt-2">Only those of the Priesthood may propose these grand transmutations.</p>
    </div>
);

const LoadingView = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-16 h-16 mb-4 animate-spin text-primary" />
        <h3 className="font-headline text-2xl text-foreground">Opening the Vault...</h3>
    </div>
);


export default function ObeliskMarketplace() {
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
      async function fetchAuthData() {
        try {
          const [wsRes, userRes] = await Promise.all([
            fetch('/api/workspaces/me'),
            fetch('/api/users/me')
          ]);
          if (!wsRes.ok || !userRes.ok) throw new Error("Could not verify credentials for the Marketplace.");
          const wsData = await wsRes.json();
          const userData = await userRes.json();
          setWorkspace(wsData);
          setUserRole(userData.role);
        } catch (e) {
          console.error(e);
          setUserRole(null);
        } finally {
          setIsCheckingAuth(false);
        }
      }
      fetchAuthData();
    }, []);

    if (isCheckingAuth) {
        return <LoadingView />;
    }
    
    // Sovereignty Class 3+ interpreted as Priesthood plan for now.
    if (workspace?.planTier !== PlanTier.Priesthood) {
        return <GatedView />;
    }

    return (
        <div className="h-full p-4 overflow-y-auto space-y-6">
           <div className="text-center">
                <h2 className="text-3xl font-headline text-primary">The Obelisk Marketplace</h2>
                <p className="text-muted-foreground">"Where will is transmuted into reality."</p>
           </div>
           
           {offeringCategories.map(category => (
               <div key={category.category}>
                    <h3 className="font-headline text-2xl mb-2 text-foreground/80">{category.category}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {category.offerings.map((offering, i) => (
                            <OfferingCard key={i} offering={offering} index={i} />
                        ))}
                    </div>
               </div>
           ))}
        </div>
    );
}
