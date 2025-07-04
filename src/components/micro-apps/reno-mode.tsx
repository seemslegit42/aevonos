
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, Sparkles, UserCheck, HeartHand, Flame, Wind, Droplets } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { RenoModeAnalysisOutput } from '@/ai/agents/reno-mode-schemas';

import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '../ui/input';

const chaosLevelConfig = {
    'Practically Pristine': { icon: Sparkles, color: 'text-accent' },
    'Snackpocalypse Now': { icon: HeartHand, color: 'text-yellow-400' },
    'Gremlin Palace Royale': { icon: UserCheck, color: 'text-orange-400' },
    'Needs an Intervention': { icon: Flame, color: 'text-red-500' },
    'Total Biohazard': { icon: Flame, color: 'text-destructive' },
};

const tierDetails = {
    'The Quickie': { price: "$49", description: "Vacuum, wipe-down, window cleaning. A perfect touch-up." },
    'Deep Clean Daddy': { price: "$149", description: "Everything in The Quickie, plus shampooing, conditioning, and stain removal." },
    'Full Interior Resurrection': { price: "$299+", description: "A complete overhaul. We bring in the big guns for a full reset. Price quoted after inspection." },
};

const mockSpecialists = [
    { name: 'Madame Mop™', specialty: 'The Interior Alchemist', playlist: 'Electro Swing', flags: ['Will organize your glovebox into a state of zen.'] },
    { name: 'Glovebox Guru™', specialty: 'Master of the Micro-Cleanse', playlist: 'Lo-fi Hip Hop', flags: ['Might leave a motivational sticky note.'] },
    { name: 'Sir Suds-a-lot', specialty: 'The Foam Knight', playlist: '80s Power Ballads', flags: ['Will probably sing to your car.'] }
];

export default function RenoMode(props: RenoModeAnalysisOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const { toast } = useToast();
    const [result, setResult] = useState<RenoModeAnalysisOutput | null>(props && 'chaosLevel' in props ? props : null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props && 'chaosLevel' in props) {
            setResult(props);
        }
    }, [props]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async () => {
        if (!preview) {
            toast({ variant: 'destructive', title: "No Evidence!", description: "Reno can't judge what he can't see, you dirty animal." });
            return;
        }
        const command = `analyze car shame with photo: "${preview}"`;
        handleCommandSubmit(command);
    };

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-kendra-fuchsia/10 border border-kendra-fuchsia/30 rounded-lg">
            <Card className="bg-background/50 border-0 shadow-none p-0 flex-shrink-0">
                <CardHeader className="p-2">
                    <CardTitle className="text-base text-kendra-fuchsia">Reno Mode™: Redemption Arc</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">“You glorious disaster… let’s get you back to your seductive sparkle.”</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <div className="relative aspect-video w-full rounded-md border-2 border-dashed border-kendra-fuchsia/30 bg-background/50 flex items-center justify-center">
                        {preview ? (
                            <Image src={preview} alt="Car interior preview" layout="fill" objectFit="contain" />
                        ) : (
                            <p className="text-muted-foreground text-sm">Upload a photo of the crime scene.</p>
                        )}
                        <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <Button className="w-full bg-kendra-fuchsia hover:bg-kendra-fuchsia/90" onClick={handleScan} disabled={!preview || isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Roast Me, Reno</>}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <ScrollArea className="flex-grow min-h-0">
                    <div className="space-y-3 pr-1">
                        <Card className="bg-background/80">
                            <CardHeader className="p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-kendra-fuchsia">Clutter Rating</span>
                                    <span className="text-lg font-bold text-kendra-fuchsia">{result.rating}/100</span>
                                </div>
                                <Progress value={result.rating} className="h-2 [&>div]:bg-kendra-fuchsia" />
                            </CardHeader>
                        </Card>

                        <Alert className="bg-background/80 border-y2k-blueviolet/50">
                            {React.createElement(chaosLevelConfig[result.chaosLevel]?.icon || Droplets, { className: `h-4 w-4 ${chaosLevelConfig[result.chaosLevel]?.color}` })}
                            <AlertTitle className={chaosLevelConfig[result.chaosLevel]?.color}>Mess Title: {result.chaosLevel}</AlertTitle>
                            <AlertDescription className="italic text-foreground/90">
                               "{result.roast}"
                            </AlertDescription>
                        </Alert>
                        
                        <Card className="bg-background/80">
                            <CardHeader className="p-3 pb-2">
                                <CardTitle className="text-base">Recommended Tier</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <h4 className="font-bold text-kendra-fuchsia">{result.recommendedTier} - {tierDetails[result.recommendedTier].price}</h4>
                                <p className="text-xs text-muted-foreground">{tierDetails[result.recommendedTier].description}</p>
                            </CardContent>
                        </Card>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Dirtmatch™ Local Heroes</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2">
                                        {mockSpecialists.map(specialist => (
                                            <Card key={specialist.name} className="bg-background/50">
                                                <CardHeader className="flex flex-row items-center gap-3 p-2">
                                                    <UserCheck className="h-5 w-5 text-accent" />
                                                    <div className="flex-grow">
                                                        <CardTitle className="text-sm">{specialist.name}</CardTitle>
                                                        <CardDescription className="text-xs">{specialist.specialty}</CardDescription>
                                                    </div>
                                                    <Button size="sm">Book Now</Button>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
