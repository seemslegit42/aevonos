
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
import { MerchantOfCabbageIcon } from '../icons/MerchantOfCabbageIcon';

const SYMBOL_CONFIG = {
    CABBAGE: { icon: '🥬', label: 'Perfect Cabbage' },
    COIN: { icon: '💰', label: 'Coin Pouch' },
    CART: { icon: '🛒', label: 'Sturdy Cart' },
    TRAMPLED: { icon: '💥', label: 'Trampled Cabbage' },
    GUARD: { icon: '🛡️', label: 'Praetorian Guard' },
};

type SymbolKey = keyof typeof SYMBOL_CONFIG;

const SYMBOLS: SymbolKey[] = ['CABBAGE', 'COIN', 'CART', 'TRAMPLED', 'GUARD'];

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

export default function MerchantOfCabbage() {
    const [isLoading, setIsLoading] = useState(false);
    const [tributeAmount, setTributeAmount] = useState('15');
    const [reels, setReels] = useState<SymbolKey[][]>([['CABBAGE'], ['CABBAGE'], ['CABBAGE']]);
    const [result, setResult] = useState<{ outcome: string, boonAmount: number } | null>(null);
    const [echo, setEcho] = useState<{ amount: number; key: number } | null>(null);
    const { toast } = useToast();

    const spinReels = (outcome: string) => {
        let finalSymbols: [SymbolKey, SymbolKey, SymbolKey];

        switch (outcome) {
            case 'mythic': finalSymbols = ['GUARD', 'GUARD', 'GUARD']; break;
            case 'rare': finalSymbols = ['CART', 'CART', 'COIN']; break;
            case 'uncommon': finalSymbols = ['CABBAGE', 'COIN', 'CABBAGE']; break;
            case 'pity_boon': finalSymbols = ['COIN', 'CABBAGE', 'CABBAGE']; break;
            default: finalSymbols = ['TRAMPLED', 'CABBAGE', 'TRAMPLED']; break; // Loss
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
            toast({ variant: 'destructive', title: 'Invalid Tribute', description: 'The merchant requires a valid offering.' });
            return;
        }
        setIsLoading(true);
        setResult(null);

        const placeholderReels = Array(3).fill(0).map(() => 
            Array(20).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
        setReels(placeholderReels);

        const tributeResult = await makeFollyTribute('MERCHANT_OF_CABBAGE', amount);

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
        
        if (outcome.includes('win') || outcome.includes('rare') || outcome.includes('mythic') || outcome.includes('uncommon') || outcome === 'pity_boon') {
            return (
                <Alert className="border-gilded-accent/50 text-gilded-accent bg-gilded-accent/10">
                    <Gem className="h-4 w-4" />
                    <AlertTitle>Imperial Contract!</AlertTitle>
                    <AlertDescription className="text-foreground/80">A profitable day at the market! A boon of {boonAmount.toFixed(2)} Ξ has been secured.</AlertDescription>
                </Alert>
            );
        }
        return (
            <Alert variant="destructive">
                <Flame className="h-4 w-4" />
                <AlertTitle>MY CABBAGES!!</AlertTitle>
                <AlertDescription>Your cart was overturned in a minor public disturbance. The tribute was lost.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-gradient-to-b from-military-green/10 via-sidekick-brown/10 to-background/10">
            <Card className="bg-background/30 border-sidekick-brown/50">
                <CardHeader className="p-2 pb-0 flex-row items-center gap-2">
                    <MerchantOfCabbageIcon className="w-8 h-8"/>
                    <div>
                        <CardTitle className="text-base font-headline">Merchant of Cabbage</CardTitle>
                        <CardDescription className="text-xs">"My cabbages!!"</CardDescription>
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
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Zap className="mr-2"/>Dispatch Merchant</>}
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
            
            <Card className="bg-background/30 border-sidekick-brown/30 mt-auto">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-sm font-headline">The Forum</CardTitle>
                </CardHeader>
                 <CardContent className="p-2 grid grid-cols-3 gap-1 text-xs text-center">
                    {SYMBOLS.filter(s => s !== 'TRAMPLED').map(key => (
                        <div key={key} className="p-1 rounded-md">
                            <p className="text-2xl">{SYMBOL_CONFIG[key].icon}</p>
                            <p className="font-semibold">{SYMBOL_CONFIG[key].label}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
