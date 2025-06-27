'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, PhoneOff, History, ChevronRight } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { handleGenerateWingmanMessage } from '@/app/actions';
import type { WingmanInput, WingmanOutput } from '@/ai/agents/wingman-schemas';
import CringeOMeterDial from './cringe-o-meter-dial';

export default function BeepWingman() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<WingmanOutput | null>(null);
    const [history, setHistory] = useState<WingmanOutput[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [targetDescription, setTargetDescription] = useState('');
    const [persona, setPersona] = useState<WingmanInput['persona']>('alpha-hustler');
    const [burnerMode, setBurnerMode] = useState(false);

    const handleGenerate = async () => {
        if (!targetDescription) {
            setResult({ openingMessage: "Error: Target profile description cannot be empty.", cringeScore: 0 });
            return;
        }
        setIsLoading(true);
        setResult(null);
        const response = await handleGenerateWingmanMessage({ targetDescription, persona });
        setResult(response);
        
        if (response.openingMessage && !response.openingMessage.startsWith("Error:")) {
            setHistory(prev => [response, ...prev].slice(0, 10));
        }
        setIsLoading(false);
    };

    const isError = result?.openingMessage.startsWith("Error:");

    return (
        <div className="flex flex-col gap-4 p-2 h-full">
            <Card className="bg-background/50 border-0 shadow-none">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Agent Configuration</CardTitle>
                    <CardDescription className="text-xs">"RicoSuave-bot deployed. Initiating Phase 1: Compliment, then confuse."</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-2">
                    <div className="space-y-1">
                        <Label htmlFor="persona-select">Persona Tuning</Label>
                        <Select value={persona} onValueChange={(v: WingmanInput['persona']) => setPersona(v)} disabled={isLoading}>
                            <SelectTrigger id="persona-select">
                                <SelectValue placeholder="Select dating persona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alpha-hustler">💼 RicoSuaveBot™</SelectItem>
                                <SelectItem value="chill-demon">😏 Savage</SelectItem>
                                <SelectItem value="awkward-sweetheart">🥰 Sweetheart</SelectItem>
                                <SelectItem value="sapiosexual">🤖 Turing-Tested Seducer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="target-profile">Target Profile</Label>
                        <Textarea 
                            id="target-profile"
                            placeholder="Describe the target's profile (e.g., 'Name is Sarah, bio says \"fluent in sarcasm and movie quotes\", has a picture with a golden retriever...')" 
                            value={targetDescription}
                            onChange={(e) => setTargetDescription(e.target.value)}
                            disabled={isLoading}
                            className="bg-background/80"
                            rows={4}
                        />
                    </div>

                    <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Bot className="mr-2 h-4 w-4" /> Generate Opener</>}
                    </Button>
                     {result && (
                        <>
                            <Alert variant={isError ? "destructive" : "default"} className="mt-3 bg-background/80">
                                <Bot className="h-4 w-4" />
                                <AlertTitle>{isError ? "Generation Failed" : "Agent Suggestion"}</AlertTitle>
                                <AlertDescription className={isError ? "" : "italic"}>
                                    {isError ? result.openingMessage : `"${result.openingMessage}"`}
                                </AlertDescription>
                            </Alert>
                            {!isError && <CringeOMeterDial score={result.cringeScore} />}
                        </>
                    )}

                    {history.length > 0 && (
                        <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="space-y-2 mt-2">
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        <span>Generation History</span>
                                    </div>
                                    <ChevronRight className={`transition-transform duration-200 ${isHistoryOpen ? 'rotate-90' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <ScrollArea className="h-24 w-full rounded-md border p-2 bg-background/50">
                                    <div className="space-y-2">
                                    {history.map((item, index) => (
                                        <p key={index} className="text-xs text-muted-foreground italic border-b border-border/50 pb-1 last:border-b-0">"{item.openingMessage}"</p>
                                    ))}
                                    </div>
                                </ScrollArea>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </CardContent>
            </Card>

            <div className="mt-auto pt-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                                <Switch id="burner-mode" checked={burnerMode} onCheckedChange={setBurnerMode} />
                                <Label htmlFor="burner-mode" className="text-xs text-muted-foreground">Burner Phone Mode</Label>
                                <PhoneOff className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">When enabled, this agent instance will be automatically deleted after 24 hours. A premium feature of the Artisan plan.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
