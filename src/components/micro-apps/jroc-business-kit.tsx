'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Share2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from '@/store/app-store';
import type { JrocOutput } from '@/ai/agents/jroc-schemas';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { JrocIcon } from '../icons/JrocIcon';

const BoomBoxSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
        <JrocIcon className="w-24 h-24 text-primary animate-pulse" />
        <p className="text-lg font-headline text-primary animate-pulse">Keepin' it Legit... Please Wait, Dawg.</p>
    </div>
)

export default function JrocBusinessKit(props: JrocOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading,
    }));
    const [businessType, setBusinessType] = useState('');
    const [logoStyle, setLogoStyle] = useState<'bling' | 'chrome' | 'dank minimal'>('bling');
    const [result, setResult] = useState<JrocOutput | null>(props && 'businessName' in props ? props : null);
    const { toast } = useToast();

    useEffect(() => {
        if (props && 'businessName' in props) {
            setResult(props);
        }
    }, [props]);


    const handleGenerate = async () => {
        if (!businessType) {
            toast({ variant: "destructive", title: "Yo, Hold Up!", description: "Gotta tell me what your hustle is, mafk." });
            return;
        }
        const command = `generate a business kit for a "${businessType}" business with a "${logoStyle}" logo style`;
        handleCommandSubmit(command);
    };

    const handleShare = () => {
        toast({ title: "J-ROC says:", description: "Your biz card is now live on the interwebs, know'm sayin'? (Just kidding, this is a prototype)." });
    }

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <Card className="bg-background/50 border-border/50">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Business Formation</CardTitle>
                    <CardDescription className="text-xs">Select province/LLC type... just kidding, let's get you a name first.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Input 
                        placeholder="Your hustle (e.g., 'vape juice')"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        disabled={isLoading}
                    />
                    <Select value={logoStyle} onValueChange={(v: any) => setLogoStyle(v)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select logo style..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bling">💎 Bling</SelectItem>
                            <SelectItem value="chrome">⛓️ Chrome</SelectItem>
                            <SelectItem value="dank minimal">🌿 Dank Minimal</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2"/>Get It Legit</>}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && <BoomBoxSpinner />}

            {result && (
                <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 flex-grow">
                     <CardHeader>
                        <CardTitle className="text-primary font-headline tracking-wider">{result.businessName}</CardTitle>
                        <CardDescription className="italic text-muted-foreground">"{result.tagline}"</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed border-primary/30 bg-background/50 flex items-center justify-center">
                            {result.logoDataUri ? (
                                <Image src={result.logoDataUri} alt={result.logoDescription} fill className="object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                                    <Sparkles className="w-10 h-10 mb-2" />
                                    <p className="text-center text-xs italic">Image generation failed. AI Description: "{result.logoDescription}"</p>
                                </div>
                            )}
                        </div>
                         <Button variant="secondary" className="w-full" onClick={handleShare}>
                            <Share2 className="mr-2" />
                            Yo, Peep My BizCard
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
