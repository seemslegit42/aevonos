
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TrendingUp, Hand, Rocket, Gem, Bone, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { StonksBotOutput, StonksBotMode } from '@/ai/agents/stonks-bot-schemas';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import StonksChartOfProphecy from './stonks/StonksChartOfProphecy';
import StonkPulse from './stonks/StonkPulse';

const confidenceIcons: Record<string, React.ElementType> = {
    'To the moon!': Rocket,
    'Diamond hands!': Gem,
    'Ape strong together!': Hand,
    'The prophecy is clear.': BookOpen,
    'Metrics align.': TrendingUp,
    'Vibes are immaculate.': Gem,
};

const ratingColors: Record<string, string> = {
    'HODL': 'text-yellow-400',
    'BUY THE DIP': 'text-stonks-green',
    'ALL IN': 'text-stonks-anxiety',
    'Consider a diversified position': 'text-secondary-foreground',
    'The runes are unclear': 'text-purple-400',
    'Sell to the fools': 'text-orange-500'
};

export default function StonksBot(props: StonksBotOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const [ticker, setTicker] = useState('');
    const [mode, setMode] = useState<StonksBotMode>('Meme-Lord');
    const [result, setResult] = useState<StonksBotOutput | null>(props && 'ticker' in props ? props : null);
    const { toast } = useToast();

    const isPanic = !!(result?.priceInfo?.change.startsWith('-') && parseFloat(result.priceInfo.changePercent) < -5);

    useEffect(() => {
        if (props && 'ticker' in props) {
            setResult(props);
        }
    }, [props]);


    const handleGetAdvice = async () => {
        if (!ticker) {
            toast({ variant: "destructive", title: "No Ticker!", description: "Gotta give me a ticker to yolo into." });
            return;
        }
        const command = `get stonks advice for ticker ${ticker} in mode ${mode}`;
        handleCommandSubmit(command);
    };

    return (
        <div 
            className={cn(
                "p-2 space-y-3 h-full flex flex-col rounded-lg border transition-colors duration-500",
                isPanic ? "bg-stonks-anxiety/20 border-stonks-anxiety animate-screen-shake" : "bg-stonks-green/10 border-stonks-green/50"
            )}
        >
            <Card className="bg-transparent border-0 shadow-none p-0">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Stonks Bot 9000</CardTitle>
                    <CardDescription className="text-xs">
                        {isPanic ? "WE RIDE THE BLOOD WAVE OR WE DIE POOR." : "Tendies incoming. This is not financial advice."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                     <Input 
                        placeholder="Enter ticker (e.g., GME)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        disabled={isLoading}
                        className="font-mono"
                    />
                    <Select value={mode} onValueChange={(v: any) => setMode(v)} disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Personality..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Meme-Lord">🐸 Meme-Lord</SelectItem>
                            <SelectItem value="MBAcore">💼 MBA-core</SelectItem>
                            <SelectItem value="Oracle Mode">🔮 Oracle Mode</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button className="w-full" onClick={handleGetAdvice} disabled={isLoading || !ticker}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><TrendingUp className="mr-2"/>Get Prophecy</>}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                    <Card className="bg-background/50">
                         <CardHeader className="p-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <StonkPulse isPanic={isPanic} />
                                    <CardTitle className="text-2xl font-mono text-foreground">{result.ticker}</CardTitle>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{result.priceInfo.price}</p>
                                    <p className={cn("text-sm font-semibold", result.priceInfo.change.startsWith('-') ? "text-destructive" : "text-stonks-green")}>
                                        {result.priceInfo.change} ({result.priceInfo.changePercent})
                                    </p>
                                </div>
                            </div>
                            <CardDescription className={cn("font-bold text-lg", ratingColors[result.rating])}>{result.rating}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <StonksChartOfProphecy />
                        </CardContent>
                    </Card>
                    <Alert className="border-primary/50 bg-background/80">
                        {React.createElement(confidenceIcons[result.confidence] || Rocket, { className: "h-4 w-4 text-primary" })}
                        <AlertTitle className="text-primary/90">The Play</AlertTitle>
                        <AlertDescription className="italic">
                            {result.advice}
                        </AlertDescription>
                    </Alert>
                    <Alert className="border-purple-400/50 bg-background/80">
                        <Bone className="h-4 w-4 text-purple-400" />
                        <AlertTitle className="text-purple-400">Financial Astrology</AlertTitle>
                        <AlertDescription className="italic">
                            {result.horoscope}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
