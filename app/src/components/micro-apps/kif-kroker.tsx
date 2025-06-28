'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, FileText } from 'lucide-react';
import type { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/app-store';

const MoraleDisplay = ({ level, name }: { level: KifKrokerAnalysisOutput['moraleLevel'], name: string }) => {
    const styles = {
        Nominal: 'text-green-400 border-green-400/50',
        Strained: 'text-yellow-400 border-yellow-400/50',
        Tense: 'text-orange-400 border-orange-400/50',
        Sigh: 'text-destructive border-destructive/50',
    };
    return (
        <div className={cn("text-left p-2 rounded-lg border border-dashed", styles[level])}>
            <p className="font-headline text-lg font-bold">{level}</p>
            <p className="text-xs font-medium">{name}</p>
        </div>
    )
}

export default function TheKifKroker(props: KifKrokerAnalysisOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore(state => ({
        handleCommandSubmit: state.handleCommandSubmit,
        isLoading: state.isLoading
    }));
    const { toast } = useToast();
    
    const [channelName, setChannelName] = useState('');
    const [messageSamples, setMessageSamples] = useState('');
    const [result, setResult] = useState<KifKrokerAnalysisOutput | null>(null);
    
    useEffect(() => {
        if (props && 'wearyNudge' in props) {
            setResult(props);
        }
    }, [props]);


    const handleScan = async () => {
        if (!channelName || !messageSamples) {
            toast({ variant: 'destructive', title: 'Insufficient Data', description: '*Sigh*... I suppose I need a channel name and some message samples to analyze.' });
            return;
        }
        const command = `analyze team comms in channel "${channelName}" with these samples: "${messageSamples}"`;
        handleCommandSubmit(command);
    }

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                <Card className="bg-background/50">
                     <CardHeader className="p-2">
                        <CardTitle className="text-base">Atmospheric Monitor</CardTitle>
                        <CardDescription className="text-xs">*Sigh*... Point me at a channel.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2">
                        <Input
                            placeholder="Channel Name (e.g., #project-phoenix)"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            disabled={isLoading}
                        />
                        <Textarea 
                            placeholder="Paste message samples here, one per line..."
                            value={messageSamples}
                            onChange={(e) => setMessageSamples(e.target.value)}
                            disabled={isLoading}
                            rows={3}
                        />
                        <Button className="w-full" onClick={handleScan} disabled={isLoading || !channelName || !messageSamples}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Zap className="mr-2" /> Scan Atmosphere</>}
                        </Button>
                    </CardContent>
                </Card>
                
                {result && (
                    <Card className="bg-background/50">
                        <CardHeader className="p-2">
                           <MoraleDisplay level={result.moraleLevel} name={channelName} />
                        </CardHeader>
                        <CardContent className="p-2 space-y-2">
                            <div className="text-xs space-y-1">
                                <p>Passive Aggression Index: <span className="font-bold font-mono">{result.passiveAggressionIndex}%</span></p>
                                <p>Team Burnout Probability: <span className="font-bold font-mono">{result.burnoutProbability}%</span></p>
                            </div>
                            <Alert variant="default" className="bg-background/50">
                              <Zap className="h-4 w-4" />
                              <AlertTitle>Weary Nudge</AlertTitle>
                              <AlertDescription className="italic text-foreground">
                                  {result.wearyNudge}
                              </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            {/* MonetizationHook */}
            <div className="mt-auto pt-2 border-t border-border/50">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="record-log-mode" className="text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    "For The Record" Log
                                </Label>
                                <Switch id="record-log-mode" disabled/>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs max-w-xs">Automatically save objective, anonymized logs of flagged conversations for HR review. Requires Priesthood plan.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
