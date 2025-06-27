'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, XOctagon } from 'lucide-react';
import type { KendraOutput } from '@/ai/agents/kendra-schemas';
import { useAppStore } from '@/store/app-store';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

function ResultDisplay({ result }: { result: KendraOutput }) {
    return (
        <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-4">
                <Card className="bg-background/80 border-primary/50">
                    <CardContent className="p-3">
                         <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-dashed border-primary/30 bg-background/50 flex items-center justify-center">
                            {result.imageDataUri ? (
                                <Image src={result.imageDataUri} alt={result.imageDescription} fill className="object-cover" data-ai-hint="advertisement marketing fashion" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                                    <Wand2 className="w-10 h-10 mb-2" />
                                    <p className="text-center text-xs italic">KENDRA decided an image was too basic for you. AI Description: "{result.imageDescription}"</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 <Alert>
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>Viral Hooks</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-4 space-y-1">
                            {result.viralHooks.map((hook, i) => <li key={i}>{hook}</li>)}
                        </ul>
                    </AlertDescription>
                </Alert>

                <Separator />
                
                <div>
                    <h4 className="text-sm font-semibold mb-2 ml-1">Ad Copy</h4>
                    <div className="space-y-2">
                        {result.adCopy.map((ad, i) => (
                           <Alert key={i}>
                                <AlertTitle>{ad.voice}</AlertTitle>
                                <AlertDescription className="italic">"{ad.copy}"</AlertDescription>
                           </Alert>
                        ))}
                    </div>
                </div>

                <Separator />
                
                <Alert>
                    <AlertTitle>Hashtags</AlertTitle>
                    <AlertDescription className="flex flex-wrap gap-2 pt-2">
                        {result.hashtags.map((tag, i) => <span key={i} className="font-mono text-xs">#{tag}</span>)}
                    </AlertDescription>
                </Alert>
                
                <Alert variant="destructive">
                    <XOctagon className="h-4 w-4" />
                    <AlertTitle>What Not To Do</AlertTitle>
                    <AlertDescription>
                         <ul className="list-disc pl-4 space-y-1">
                            {result.whatNotToDo.map((warning, i) => <li key={i}>{warning}</li>)}
                        </ul>
                    </AlertDescription>
                </Alert>

                <Separator />

                <blockquote className="mt-6 border-l-2 pl-6 italic">
                  "{result.kendraCommentary}"
                </blockquote>

            </div>
        </ScrollArea>
    )
}

export default function Kendra(props: KendraOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const [productIdea, setProductIdea] = useState('');
    const [result, setResult] = useState<KendraOutput | null>(props && 'campaignTitle' in props ? props : null);
    
    useEffect(() => {
        if (props && 'campaignTitle' in props) {
            setResult(props);
        }
    }, [props]);


    const handleGenerate = async () => {
        if (!productIdea) return;
        const command = `Get KENDRA.exe's take on this idea: "${productIdea}"`;
        handleCommandSubmit(command);
    };

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <Card className="bg-transparent border-0 shadow-none p-0">
                <CardContent className="p-0 space-y-2">
                    <Textarea 
                        placeholder="Drop your product idea. Don't be boring."
                        value={productIdea}
                        onChange={(e) => setProductIdea(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                    />
                     <Button className="w-full" onClick={handleGenerate} disabled={isLoading || !productIdea}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Get KENDRA's Take</>}
                    </Button>
                </CardContent>
            </Card>

            {result && <ResultDisplay result={result} />}
        </div>
    );
}
