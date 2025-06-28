'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TrendingUp, Hand, Rocket, Gem, ArrowDown, ArrowUp } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { StonksBotOutput } from '@/ai/agents/stonks-bot-schemas';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const confidenceIcons: Record<string, React.ElementType> = {
    'To the moon!': Rocket,
    'Diamond hands!': Gem,
    'Ape strong together!': Hand,
}

export default function StonksBot(props: StonksBotOutput | {}) {
    const { handleCommandSubmit, isLoading } = useAppStore();
    const [ticker, setTicker] = useState('');
    const [result, setResult] = useState<StonksBotOutput | null>(props && 'ticker' in props ? props : null);
    const { toast } = useToast();

    useEffect(() => {
        if (props && 'ticker' in props) {
            setResult(props);
        }
    }, [props]);


    const handleGetAdvice = async () => {
        if (!ticker) {
            toast({ variant: "destructive", title: "No Ticker!", description: "Gotta give me a ticker to tell you to yolo into." });
            return;
        }
        const command = `get stonks advice for ticker ${ticker}`;
        handleCommandSubmit(command);
    };

    const getChangeInfo = (change: string) => {
        if (!change || change === 'N/A') return { color: 'text-muted-foreground', icon: null };
        const changeValue = parseFloat(change);
        if (changeValue > 0) {
            return { color: 'text-accent', icon: <ArrowUp className="h-3 w-3" /> };
        }
        if (changeValue < 0) {
            return { color: 'text-destructive', icon: <ArrowDown className="h-3 w-3" /> };
        }
        return { color: 'text-muted-foreground', icon: null };
    };
    
    const changeInfo = result?.priceInfo?.change ? getChangeInfo(result.priceInfo.change) : null;

    return (
        <div className="p-2 space-y-3 h-full flex flex-col">
            <Card className="bg-background/50 border-0 shadow-none p-0">
                <CardHeader className="p-2">
                    <CardTitle className="text-base">Stonks Bot 9000</CardTitle>
                    <CardDescription className="text-xs">Tendies incoming. This is not financial advice.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                     <Input 
                        placeholder="Enter ticker (e.g., GME)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        disabled={isLoading}
                        className="font-mono"
                    />
                     <Button className="w-full" onClick={handleGetAdvice} disabled={isLoading || !ticker}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <><TrendingUp className="mr-2"/>Get Advice</>}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card className="bg-accent/10 border-accent/50 flex-grow text-foreground">
                     <CardHeader className="p-3">
                        <div className="flex justify-between items-baseline">
                            <CardTitle className="text-2xl font-mono text-accent">{result.ticker}</CardTitle>
                             {result.priceInfo.price !== 'N/A' && (
                                <span className="text-2xl font-bold font-mono text-foreground">${parseFloat(result.priceInfo.price).toFixed(2)}</span>
                             )}
                        </div>
                        {result.priceInfo.price !== 'N/A' && changeInfo && (
                            <div className={cn("flex justify-end items-center gap-1 text-sm font-semibold", changeInfo.color)}>
                               {changeInfo.icon}
                               <span>{parseFloat(result.priceInfo.change).toFixed(2)} ({result.priceInfo.changePercent})</span>
                            </div>
                        )}
                        <CardDescription className="font-bold text-lg text-accent text-left pt-2">{result.rating}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                         <Alert className="border-accent/50 bg-background/80">
                            <Rocket className="h-4 w-4 text-accent" />
                            <AlertTitle>The Play</AlertTitle>
                            <AlertDescription className="italic">
                                {result.advice}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-2 text-center text-accent">
                            {React.createElement(confidenceIcons[result.confidence] || Rocket, { className: "h-6 w-6 mx-auto mb-1" })}
                            <p className="text-xs font-bold">{result.confidence}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
