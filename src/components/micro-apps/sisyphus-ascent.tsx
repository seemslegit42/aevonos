
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, Gem, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { makeFollyTribute } from '@/app/actions';
import { cn } from '@/lib/utils';
import { SisyphusIcon } from '../icons/SisyphusIcon';

const SYMBOL_CONFIG = {
    BOULDER: { icon: '🪨', label: 'The Boulder' },
    SLIP: { icon: '💥', label: 'It Slipped' },
    REST: { icon: '😮‍💨', label: 'A Reprieve' },
    PEAK: { icon: '🏔️', label: 'The Peak' },
};

type SymbolKey = keyof typeof SYMBOL_CONFIG;

const SYMBOLS: SymbolKey[] = ['BOULDER', 'SLIP', 'REST', 'PEAK'];

const Reel = ({ symbols, duration }: { symbols: SymbolKey[], duration: number }) => (
    <div className="h-24 w-20 overflow-hidden bg-background/30 rounded-lg border border-primary/20 flex items-center justify-center">
        <motion.div
            animate={{ y: `-${(symbols.length - 1) * 6}rem` }}
            transition={{ duration, ease: 'backInOut' }}
            className="text-5xl"
        >
            {symbols.map((symbol, i) => (
                <div key={i} className="h-24 flex items-center justify-center">
                    {SYMBOL_CONFIG[symbol].icon}
                </div>
            ))}
        </motion.div>
    </div>
);

export default function SisyphusAscent() {
    const [isLoading, setIsLoading] = useState(false);
    const [tributeAmount, setTributeAmount] = useState('10');
    const [reels, setReels] = useState<SymbolKey[][]>([['BOULDER'], ['BOULDER'], ['BOULDER']]);
    const [result, setResult] = useState<{ outcome: string, boonAmount: number } | null>(null);
    const [echo, setEcho] = useState<{ amount: number; key: number } | null>(null);
    const { toast } = useToast();

    const spinReels = (outcome: string) => {
        let finalSymbols: [SymbolKey, SymbolKey, SymbolKey];

        switch (outcome) {
            case 'mythic': finalSymbols = ['PEAK', 'PEAK', 'PEAK']; break;
            case 'rare': finalSymbols = ['REST', 'REST', 'BOULDER']; break;
            case 'uncommon':
            case 'pity_boon':
            case 'guaranteed_win':
                 finalSymbols = ['BOULDER', 'BOULDER', 'REST']; break;
            default: // Loss
                finalSymbols = ['BOULDER', 'SLIP', 'BOULDER']; break;
        }

        const newReels = Array(3).fill(0).map(() => 
            Array(20).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
        
        newReels.forEach((reel, i) => reel.push(finalSymbols[i]));
        setReels(newReels);
    };

    const handleTribute = async () => {
        const amount = parseInt(tributeAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Tribute', description: 'One must make a worthy offering.' });
            return;
        }
        setIsLoading(true);
        setResult(null);

        const placeholderReels = Array(3).fill(0).map(() => 
            Array(20).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
        setReels(placeholderReels);

        const tributeResult = await makeFollyTribute('SISYPHUSS_ASCENT', amount);

        if (tributeResult.success) {
            if (tributeResult.aethericEcho && tributeResult.aethericEcho > 0) {
                setEcho({ amount: tributeResult.aethericEcho, key: Date.now() });
            }

            spinReels(tributeResult.outcome!);
            setTimeout(() => {
                setResult({ outcome: tributeResult.outcome!, boonAmount: tributeResult.boonAmount! });
                setIsLoading(false);
            }, 3000);
        } else {
            toast({ variant: 'destructive', title: 'Tribute Failed', description: tributeResult.error });
            setIsLoading(false);
        }
    };

    const getResultAlert = () => {
        if (!result) return null;
        
        const { outcome, boonAmount } = result;
        
        if (outcome !== 'common' && outcome !== 'loss') {
            return (
                <Alert className="border-gilded-accent/50 text-gilded-accent bg-gilded-accent/10">
                    <Gem className="h-4 w-4" />
                    <AlertTitle>A Moment of Reprieve</AlertTitle>
                    <AlertDescription className="text-foreground/80">The gods are pleased. A boon of {boonAmount.toFixed(2)} Ξ has been granted.</AlertDescription>
                </Alert>
            );
        }
        return (
            <Alert variant="destructive">
                <Flame className="h-4 w-4" />
                <AlertTitle>The Boulder Slips</AlertTitle>
                <AlertDescription>Your tribute was consumed by the effort. The ascent continues.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-gradient-to-b from-gray-700/10 via-gray-800/10 to-black/20">
            <Card className="bg-background/30 border-muted-foreground/30">
                <CardHeader className="p-2 pb-0 flex-row items-center gap-2">
                    <SisyphusIcon className="w-8 h-8"/>
                    <div>
                        <CardTitle className="text-base font-headline">Sisyphus's Ascent</CardTitle>
                        <CardDescription className="text-xs">"One must imagine Sisyphus happy."</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-2 relative">
                    <div className="flex justify-center gap-3 py-4">
                        <Reel symbols={reels[0]} duration={2} />
                        <Reel symbols={reels[1]} duration={2.5} />
                        <Reel symbols={reels[2]} duration={3} />
                    </div>
                    <AnimatePresence>
                        {echo && (
                            <motion.div
                                key={echo.key}
                                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 0.7, 0.7, 0], y: -40, scale: 1.1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2.5, ease: "easeOut", times: [0, 0.1, 0.8, 1] }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold font-mono text-roman-aqua pointer-events-none"
                                style={{ textShadow: '0 0 15px hsl(var(--roman-aqua))' }}
                                onAnimationComplete={() => setEcho(null)}
                            >
                                + {echo.amount.toFixed(2)} Ξ
                            </motion.div>
                        )}
                    </AnimatePresence>
                     <div className="flex gap-2">
                        <Input 
                            type="number"
                            value={tributeAmount}
                            onChange={(e) => setTributeAmount(e.target.value)}
                            disabled={isLoading}
                            className="w-24 font-mono text-center"
                        />
                        <Button className="w-full" onClick={handleTribute} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Zap className="mr-2"/>Push</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {getResultAlert()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
