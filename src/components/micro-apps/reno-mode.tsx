
'use client';

import React, { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock Data for Filthmatch™ and Guide
const mockDetailers = [
    { name: 'Reno', vibe: 'Will trauma-dump while buffing your console.', playlist: '90s Industrial', redFlags: 'Smokes while cleaning.', rate: '$$$' },
    { name: 'Cherry', vibe: 'Calls you "honey" and leaves a lollipop on your dash.', playlist: 'Bubblegum Pop', redFlags: 'Will try to sell you essential oils.', rate: '$$' },
    { name: 'Spike', vibe: 'Silent, meticulous, possibly ex-military.', playlist: 'German Techno', redFlags: 'Judges your taste in music.', rate: '$$$$' }
];

const diyGuideSteps = [
    { title: "The Purge: Evict Your Gremlins", content: "Get two bags. One for trash, one for 'I'll deal with this later' (that's a lie, but it helps). Be ruthless. That ketchup packet from 2022? It's not vintage, it's a biohazard. Evict it." },
    { title: "The Great Crumb-ening: A Vacuum Odyssey", content: "Go at those seats like you're trying to find a lost diamond earring. Use the weird little attachments. Get in the cracks. This is therapy. The crumbs are your regrets. Suck 'em up." },
    { title: "Wipe Me Down: The Rub & Buff", content: "Get an all-purpose cleaner. Not Windex, you animal. A real interior cleaner. Microfiber cloths are your best friends. Wipe every surface. If you can touch it, clean it. Yes, even that weird sticky spot." },
    { title: "Glass Act: The Final Polish", content: "Now you can use the Windex (or proper glass cleaner). Two cloths: one to apply, one to buff dry. No streaks. You're better than streaks. Look at your reflection. You're a goddamn champion." }
];

// Main Component
export default function RenoMode(props: RenoModeAnalysisOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [result, setResult] = useState<RenoModeAnalysisOutput | null>(props && 'rating' in props ? props : null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = () => {
        if (!preview) {
            toast({ variant: 'destructive', title: "Show me the filth.", description: "I can't judge what I can't see, honey." });
            return;
        }
        const command = `ask reno to analyze this car photo: ${preview}`;
        handleCommandSubmit(command);
    };

    const shameLevelColors: Record<string, string> = {
        'Pristine Goddex': 'text-gilded-accent',
        'Dusty Bitch': 'text-amber-400',
        'Snackcident Zone': 'text-orange-500',
        'Certified Gremlin Nest': 'text-red-500',
        'Biohazard Ex': 'text-destructive animate-pulse'
    };
    
    return (
        <ScrollArea className="h-full p-2">
            <div className="space-y-4">
                <Card className="bg-background/50 border-primary/30">
                    <CardHeader className="p-3">
                        <CardTitle className="font-headline text-lg">Car Shame Index™</CardTitle>
                        <CardDescription className="text-xs">Upload a pic of your disasterpiece. No judgment... much.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                        {preview && <Image src={preview} alt="Car interior preview" width={300} height={200} className="rounded-md mx-auto" />}
                        <div className="flex gap-2">
                             <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                <Camera className="mr-2 h-4 w-4" /> Choose Photo
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <Button className="w-full" onClick={handleAnalyze} disabled={!preview || isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Analyze Filth</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="bg-background/50 border-primary/30">
                        <CardHeader className="p-3">
                            <CardTitle className={cn("text-xl font-bold font-headline", shameLevelColors[result.shameLevel])}>{result.shameLevel}</CardTitle>
                            <Progress value={100 - result.rating} className="h-2 mt-1" indicatorClassName={result.rating > 50 ? "bg-accent" : "bg-destructive"} />
                            <CardDescription className="text-xs italic pt-2">Reno says: "{result.roast}"</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>Recommendation</AlertTitle>
                                <AlertDescription>
                                    Based on this level of... character... we recommend the <strong className="text-primary">{result.recommendedTier}</strong> package.
                                    <p className="text-xs mt-1">Weirdest object detected: <em className="text-foreground">{result.weirdestObject}</em></p>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-background/50 border-primary/30">
                    <CardHeader className="p-3">
                        <CardTitle className="font-headline text-lg">Filthmatch™ Local</CardTitle>
                        <CardDescription className="text-xs">Find your chaotic good detailer.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                        {mockDetailers.map(d => (
                            <Card key={d.name} className="p-2 bg-background/50 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{d.name} <span className="font-mono text-primary">{d.rate}</span></p>
                                    <p className="text-xs italic text-muted-foreground">{d.vibe}</p>
                                </div>
                                <Button size="sm"><UserCheck className="mr-2 h-4 w-4" /> Book</Button>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
                
                 <Card className="bg-background/50 border-primary/30">
                    <CardHeader className="p-3">
                        <CardTitle className="font-headline text-lg">Reno’s Guide to Dirty Pleasure</CardTitle>
                        <CardDescription className="text-xs">A how-to for the broke and the brave.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3">
                        <Accordion type="single" collapsible>
                            {diyGuideSteps.map(step => (
                                <AccordionItem value={step.title} key={step.title}>
                                    <AccordionTrigger>{step.title}</AccordionTrigger>
                                    <AccordionContent>{step.content}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                 <Card className="bg-background/50 border-primary/30">
                    <CardHeader className="p-3">
                        <CardTitle className="font-headline text-lg">Mood-Driven Car Care</CardTitle>
                        <CardDescription className="text-xs">Match your mental state to a ritual.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 grid grid-cols-2 gap-2">
                        <Button variant="outline"><Flame className="mr-2" /> Spiraling</Button>
                        <Button variant="outline"><HeartHand className="mr-2" /> Horny</Button>
                        <Button variant="outline"><Wind className="mr-2" /> Bored</Button>
                        <Button variant="outline"><Droplets className="mr-2" /> Sad</Button>
                    </CardContent>
                </Card>

                <Card className="bg-background/50 border-primary/30">
                    <CardHeader className="p-3">
                        <CardTitle className="font-headline text-lg">Sticker Collection</CardTitle>
                        <CardDescription className="text-xs">Your filthy achievements.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 grid grid-cols-3 gap-2">
                        <Badge className="p-2 justify-center text-center">Crumb Daddy</Badge>
                        <Badge variant="secondary" className="p-2 justify-center text-center">Stain Whisperer</Badge>
                        <Badge variant="outline" className="p-2 justify-center text-center">Mildew Slayer</Badge>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
}
