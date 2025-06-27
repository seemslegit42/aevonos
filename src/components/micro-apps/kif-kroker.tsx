'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, FileText, CheckCircle, Link2 } from 'lucide-react';
import { analyzeComms as analyzeCommsAction } from '@/app/actions';
import type { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

// Mock Data Structures
interface ChannelStatus {
    id: string;
    name: string;
    morale: KifKrokerAnalysisOutput['moraleLevel'];
    lastScan: string;
    isLoading: boolean;
    analysis?: {
        passiveAggression: number;
        burnout: number;
    }
}

interface Nudge {
    id: string;
    text: string;
    timestamp: string;
}

const initialChannels: ChannelStatus[] = [
    { id: 'C01', name: '#project-phoenix', morale: 'Strained', lastScan: '5m ago', isLoading: false, analysis: { passiveAggression: 78, burnout: 65 }},
    { id: 'C02', name: '#general', morale: 'Nominal', lastScan: '12m ago', isLoading: false, analysis: { passiveAggression: 12, burnout: 23 }},
    { id: 'C03', name: '#design-crit', morale: 'Tense', lastScan: '1h ago', isLoading: false, analysis: { passiveAggression: 45, burnout: 55 }},
];

const initialNudges: Nudge[] = [
    { id: 'N01', text: "*Deep, weary sigh*... I feel compelled to inform you that the tone in #project-phoenix has become... suboptimal. You may want to suggest a 10-minute break.", timestamp: "8m ago" }
]

const mockMessageSamples: Record<string, string[]> = {
    '#project-phoenix': [
        "Is this done yet?",
        "I'm just saying, the deadline is the deadline.",
        "Fine.",
        "As per my last email...",
        "Can we just get this over with?"
    ],
    '#general': [
        "Happy Friday everyone!",
        "Anyone seen the new episode of that show?",
        "lol good one",
        "Weekend plans?",
    ],
    '#design-crit': [
        "I'm not sure I understand the direction here.",
        "We need to be more innovative.",
        "Let's circle back on the typography.",
        "The stakeholders won't like this.",
    ]
}

const MoraleDisplay = ({ level, name }: { level: ChannelStatus['morale'], name: string }) => {
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

export default function TheKifKroker() {
    const [isConnected, setIsConnected] = useState(false);
    const [channels, setChannels] = useState<ChannelStatus[]>([]);
    const [nudges, setNudges] = useState<Nudge[]>([]);

    const handleConnect = () => {
        setIsConnected(true);
        setChannels(initialChannels);
        setNudges(initialNudges);
    }
    
    const handleScanChannel = async (channelId: string) => {
        const channel = channels.find(c => c.id === channelId);
        if(!channel) return;

        setChannels(prev => prev.map(c => c.id === channelId ? {...c, isLoading: true} : c));

        const messageSamples = mockMessageSamples[channel.name] || [];
        const response = await analyzeCommsAction({ channelName: channel.name, messageSamples });

        setChannels(prev => prev.map(c => c.id === channelId ? {
            ...c,
            isLoading: false,
            morale: response.moraleLevel,
            analysis: {
                passiveAggression: response.passiveAggressionIndex,
                burnout: response.burnoutProbability
            },
            lastScan: 'Just now'
        } : c));

        if(response.moraleLevel === 'Sigh' || response.moraleLevel === 'Tense') {
            setNudges(prev => [{id: `N${Date.now()}`, text: response.wearyNudge, timestamp: 'Just now'}, ...prev]);
        }
    };

    if (!isConnected) {
        return (
            <div className="p-2 h-full flex flex-col items-center justify-center text-center">
                <KifKrokerIcon className="w-24 h-24 text-muted-foreground/50" />
                <h3 className="text-lg font-headline mt-4">Atmospheric Monitor Offline</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-1">
                    *Sigh*... I suppose you need to grant me access to the communications array before I can begin my thankless task.
                </p>
                <Button onClick={handleConnect} className="mt-4">
                    <Link2 className="mr-2" />
                    Connect to Slack
                </Button>
            </div>
        )
    }

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                <Card className="bg-background/50">
                     <CardHeader className="p-2">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Channel Status</span>
                            <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                                <CheckCircle className="w-3 h-3"/> Connected to Slack
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2">
                        {channels.map(channel => (
                            <div key={channel.id} className="flex items-center gap-2">
                                <div className="flex-grow">
                                    <MoraleDisplay level={channel.morale} name={channel.name} />
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => handleScanChannel(channel.id)} disabled={channel.isLoading}>
                                    {channel.isLoading ? <Loader2 className="animate-spin" /> : <Zap />}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-background/50">
                     <CardHeader className="p-2">
                        <CardTitle className="text-base">Recent Weary Nudges</CardTitle>
                     </CardHeader>
                    <CardContent className="p-2">
                         <ScrollArea className="h-28">
                             <div className="space-y-2">
                            {nudges.map(nudge => (
                                <Alert key={nudge.id} variant="default" className="bg-background/80">
                                  <Zap className="h-4 w-4" />
                                  <AlertTitle className="text-xs text-muted-foreground">{nudge.timestamp}</AlertTitle>
                                  <AlertDescription className="italic text-foreground">
                                      {nudge.text}
                                  </AlertDescription>
                                </Alert>
                            ))}
                             </div>
                         </ScrollArea>
                    </CardContent>
                </Card>
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
