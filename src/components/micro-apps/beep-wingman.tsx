
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, Copy, Bot, ShieldAlert, Hourglass } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateWingmanMessage } from '@/app/actions';
import type { WingmanInput, WingmanOutput } from '@/ai/agents/wingman-schemas';
import { useToast } from '@/hooks/use-toast';
import CringeOMeterDial from './cringe-o-meter-dial';
import { cn } from '@/lib/utils';

// This is the new Wingman Micro-App, reflecting its upgraded capabilities.
export default function BeepWingman() {
    const [isLoading, setIsLoading] = useState(false);
    const [situationContext, setSituationContext] = useState('');
    const [messageMode, setMessageMode] = useState<WingmanInput['messageMode']>('Cool & Collected');
    const [result, setResult] = useState<WingmanOutput | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!situationContext) {
            toast({ variant: "destructive", title: "Wingman needs intel", description: "I can't work with nothing. What's the situation?" });
            return;
        }
        setIsLoading(true);
        setResult(null);
        const response = await generateWingmanMessage({ situationContext, messageMode });
        setResult(response);
        setIsLoading(false);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Message Copied",
            description: "Go get 'em, tiger.",
        });
    }

    const vibeStyles: { [key: string]: string } = {
        'Smooth': 'text-accent border-accent/50',
        'Slightly Risky': 'text-yellow-400 border-yellow-400/50',
        'You Will Regret This': 'text-destructive border-destructive/50'
    };

    return (
        <div className="flex flex-col gap-4 p-2 h-full">
            <Card className="bg-background/50 border-0 shadow-none">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Wingman: Mission Briefing</CardTitle>
                    <CardDescription className="text-xs">"What's the move?"</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="The situation: who, what, why..."
                        value={situationContext}
                        onChange={(e) => setSituationContext(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                    />
                    <Select value={messageMode} onValueChange={(v: any) => setMessageMode(v)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select message mode..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cool & Collected">🧊 Cool & Collected</SelectItem>
                            <SelectItem value="Charming AF">🥂 Charming AF</SelectItem>
                            <SelectItem value="Roast w/ Precision">🔥 Roast w/ Precision</SelectItem>
                            <SelectItem value="Protective Custody">🛡️ Protective Custody</SelectItem>
                            <SelectItem value="Make Me Seem Smarter">🪄 Make Me Seem Smarter</SelectItem>
                            <SelectItem value="Help Me Say No">🫣 Help Me Say No</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2"/>Deploy Charm</>}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="flex-grow space-y-2 overflow-y-auto pr-1">
                    {result.regretShieldTriggered && (
                        <Alert variant="destructive" className="border-2 border-dashed">
                            <Hourglass className="h-4 w-4" />
                            <AlertTitle>Regret Shield™ Activated</AlertTitle>
                            <AlertDescription>
                                {result.regretShieldReason}
                            </AlertDescription>
                        </Alert>
                    )}
                     <Alert className={cn("bg-background/80", vibeStyles[result.vibe])}>
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="flex justify-between items-center">
                            <span>Wingman's Suggestion</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(result.suggestedMessage)}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </AlertTitle>
                        <AlertDescription className="italic text-foreground">
                            "{result.suggestedMessage}"
                        </AlertDescription>
                    </Alert>
                    <CringeOMeterDial score={result.cringeScore} />
                     <Alert variant="default" className="bg-background/80 mt-2">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Vibe & Cringe Analysis</AlertTitle>
                        <AlertDescription>
                            {result.analysis}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
}
