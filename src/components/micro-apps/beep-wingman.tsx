
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, Copy, Bot, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateWingmanMessage } from '@/app/actions';
import type { WingmanInput, WingmanOutput } from '@/ai/agents/wingman-schemas';
import { useToast } from '@/hooks/use-toast';
import CringeOMeterDial from './cringe-o-meter-dial';

export default function BeepWingman() {
    const [isLoading, setIsLoading] = useState(false);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<WingmanInput['persona']>('chill-demon');
    const [result, setResult] = useState<WingmanOutput | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!targetDescription) {
            toast({ variant: "destructive", title: "Mission Critical Info Missing", description: "I need a description of the target, chief." });
            return;
        }
        setIsLoading(true);
        setResult(null);
        const response = await generateWingmanMessage({ targetDescription, persona });
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

    return (
        <div className="flex flex-col gap-4 p-2 h-full">
            <Card className="bg-background/50 border-0 shadow-none">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Agent Configuration</CardTitle>
                    <CardDescription className="text-xs">Provide intel on the target.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Textarea 
                        placeholder="Target Profile (e.g., 'Likes dogs, hiking, and The Office...')"
                        value={targetDescription}
                        onChange={(e) => setTargetDescription(e.target.value)}
                        disabled={isLoading}
                        rows={3}
                    />
                    <Select value={persona} onValueChange={(v: any) => setPersona(v)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Wingman Persona..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sapiosexual">🧠 Sapiosexual</SelectItem>
                            <SelectItem value="alpha-hustler">💼 Alpha Hustler</SelectItem>
                            <SelectItem value="chill-demon">😏 Chill Demon</SelectItem>
                            <SelectItem value="awkward-sweetheart">🤓 Awkward Sweetheart</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2"/>Generate Message</>}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="flex-grow space-y-2">
                    <Alert className="bg-background/80">
                        <Bot className="h-4 w-4" />
                        <AlertTitle className="flex justify-between items-center">
                            <span>Wingman's Suggestion</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(result.openingMessage)}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </AlertTitle>
                        <AlertDescription className="italic">
                            "{result.openingMessage}"
                        </AlertDescription>
                    </Alert>
                    <CringeOMeterDial score={result.cringeScore} />
                     <Alert variant={result.cringeScore > 70 ? 'destructive' : 'default'} className="bg-background/80 mt-2">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Cringe Analysis</AlertTitle>
                        <AlertDescription>
                            {result.analysis}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
}
