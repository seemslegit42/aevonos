'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Share2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBusinessKit } from '@/app/actions';
import type { JrocOutput } from '@/ai/agents/jroc-schemas';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const BoomBoxSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
        <Image src="https://placehold.co/150x100.png" data-ai-hint="boombox graffiti" alt="Boombox" width={150} height={100} className="animate-pulse" />
        <p className="text-lg font-headline text-primary animate-pulse">Keepin' it Legit... Please Wait, Dawg.</p>
    </div>
)

export default function JrocBusinessKit() {
    const [isLoading, setIsLoading] = useState(false);
    const [businessType, setBusinessType] = useState('');
    const [logoStyle, setLogoStyle] = useState<'bling' | 'chrome' | 'dank minimal'>('bling');
    const [result, setResult] = useState<JrocOutput | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!businessType) {
            toast({ variant: "destructive", title: "Yo, Hold Up!", description: "Gotta tell me what your hustle is, mafk." });
            return;
        }
        setIsLoading(true);
        setResult(null);
        const response = await generateBusinessKit({ businessType, logoStyle });
        setResult(response);
        setIsLoading(false);
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
                            <Image src={`https://placehold.co/600x400.png`} alt={result.logoDescription} fill className="object-cover" data-ai-hint={`${logoStyle} logo`} />
                            <p className="absolute bottom-2 left-2 right-2 text-xs bg-black/50 text-white p-1 rounded italic backdrop-blur-sm">{result.logoDescription}</p>
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
