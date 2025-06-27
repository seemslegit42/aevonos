
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { WingmanInput } from '@/ai/agents/wingman-schemas';
import { handleGenerateWingmanMessage } from '@/app/actions';

export default function BeepWingman() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<WingmanInput['persona']>('alpha-hustler');
    
    const handleGenerate = async () => {
        if (!targetDescription) {
            setResult("Error: Target profile description cannot be empty.");
            return;
        }
        setIsLoading(true);
        setResult(null);
        const response = await handleGenerateWingmanMessage({ targetDescription, persona });
        setResult(response.openingMessage);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <Card className="bg-background/50 border-0 shadow-none">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Agent Configuration</CardTitle>
                    <CardDescription className="text-xs">"RicoSuave-bot deployed. Initiating Phase 1: Compliment, then confuse."</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-2">
                    <label className="text-sm font-medium">Persona Tuning</label>
                    <Select value={persona} onValueChange={(v: WingmanInput['persona']) => setPersona(v)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select dating persona..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alpha-hustler">💼 RicoSuaveBot™</SelectItem>
                            <SelectItem value="chill-demon">😏 Savage</SelectItem>
                            <SelectItem value="awkward-sweetheart">🥰 Sweetheart</SelectItem>
                            <SelectItem value="sapiosexual">🤖 Turing-Tested Seducer</SelectItem>
                        </SelectContent>
                    </Select>

                    <label className="text-sm font-medium">Target Profile</label>
                     <Textarea 
                        placeholder="Describe the target's profile (e.g., 'Name is Sarah, bio says \"fluent in sarcasm and movie quotes\", has a picture with a golden retriever...')" 
                        value={targetDescription}
                        onChange={(e) => setTargetDescription(e.target.value)}
                        disabled={isLoading}
                        className="bg-background/80"
                        rows={4}
                    />

                    <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Bot className="mr-2 h-4 w-4" /> Generate Opener</>}
                    </Button>
                     {result && (
                        <Alert variant={result.startsWith("Error:") ? "destructive" : "default"} className="mt-3 bg-background/80">
                            <Bot className="h-4 w-4" />
                            <AlertTitle>{result.startsWith("Error:") ? "Generation Failed" : "Agent Suggestion"}</AlertTitle>
                            <AlertDescription className={result.startsWith("Error:") ? "" : "italic"}>
                                {result.startsWith("Error:") ? result : `"${result}"`}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
