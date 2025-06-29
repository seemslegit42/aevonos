
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TrendingUp, Hand, Rocket, Gem } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { StonksBotOutput } from '@/ai/agents/stonks-bot-schemas';
import { useToast } from '@/hooks/use-toast';

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
            toast({ variant: "destructive", title: "No Ticker!", description: "Gotta give me a ticker to yolo into." });
            return;
        }
        const command = `get stonks advice for ticker ${ticker}`;
        handleCommandSubmit(command);
    };

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
                <Card className="bg-stonks-green/10 border-stonks-green/50 flex-grow text-foreground">
                     <CardHeader className="p-3">
                        <CardTitle className="text-2xl font-mono text-stonks-green">{result.ticker}</CardTitle>
                        <CardDescription className="font-bold text-lg text-stonks-green/80">{result.rating}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                         <Alert className="border-stonks-green/50 bg-background/80">
                            <Rocket className="h-4 w-4 text-stonks-green" />
                            <AlertTitle className="text-stonks-green/90">The Play</AlertTitle>
                            <AlertDescription className="italic">
                                {result.advice}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-2 text-center text-stonks-green">
                            {React.createElement(confidenceIcons[result.confidence] || Rocket, { className: "h-6 w-6 mx-auto mb-1" })}
                            <p className="text-xs font-bold">{result.confidence}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
