'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, FileText } from 'lucide-react';
import { analyzeComms as analyzeCommsAction } from '@/app/actions';
import type { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

const MoraleDisplay = ({ level }: { level: KifKrokerAnalysisOutput['moraleLevel'] }) => {
    const styles = {
        Nominal: 'text-green-400 border-green-400/50',
        Strained: 'text-yellow-400 border-yellow-400/50',
        Tense: 'text-orange-400 border-orange-400/50',
        Sigh: 'text-destructive border-destructive/50',
    };
    return (
        <div className={cn("text-center p-2 rounded-lg border-2 border-dashed", styles[level])}>
            <p className="font-headline text-2xl font-bold">{level}</p>
            <p className="text-xs font-medium">Atmospheric Reading</p>
        </div>
    )
}

const MetricDisplay = ({ label, value }: { label: string, value: number }) => {
    return (
        <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-lg font-mono font-bold">{value}%</p>
        </div>
    )
}

export default function TheKifKroker() {
    const [isLoading, setIsLoading] = useState(false);
    const [commsText, setCommsText] = useState('');
    const [result, setResult] = useState<KifKrokerAnalysisOutput | null>(null);

    const handleAnalysis = async () => {
        if (!commsText) return;
        setIsLoading(true);
        setResult(null);
        const response = await analyzeCommsAction({ conversationText: commsText });
        setResult(response);
        setIsLoading(false);
    };

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                <Card className="bg-background/50 border-0 shadow-none p-0">
                    <CardContent className="p-0 space-y-2">
                        <Textarea
                          placeholder="*Sigh*... I suppose you can paste the Slack thread here..."
                          value={commsText}
                          onChange={(e) => setCommsText(e.target.value)}
                          disabled={isLoading}
                          rows={5}
                          className="bg-background/80"
                        />
                        <Button className="w-full" onClick={handleAnalysis} disabled={isLoading || !commsText}>
                          {isLoading ? <Loader2 className="animate-spin" /> : <>Scan Communications</>}
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                  <div className="space-y-3 pt-2">
                    <MoraleDisplay level={result.moraleLevel} />
                    <div className="grid grid-cols-2 gap-2">
                        <MetricDisplay label="Passive-Aggression" value={result.passiveAggressionIndex} />
                        <MetricDisplay label="Burnout Probability" value={result.burnoutProbability} />
                    </div>
                    <Alert variant="default" className="bg-background/80">
                      <Zap className="h-4 w-4" />
                      <AlertTitle>Kif's Nudge</AlertTitle>
                      <AlertDescription className="italic">
                          {result.wearyNudge}
                      </AlertDescription>
                    </Alert>
                  </div>
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
