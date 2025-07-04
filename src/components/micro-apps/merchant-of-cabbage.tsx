
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

// --- Custom Icons for a more thematic experience ---

const CabbageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 17.27c-2.33-2.3-1.48-7.27.15-8.9a5.62 5.62 0 0 1 8.35 8.19c-1.63 1.63-6.6 2.45-8.5 1.02z" fill="hsl(120 60% 70% / 0.3)" />
        <path d="M12.27 14c-2.3-2.33-7.27-1.48-8.9.15a5.62 5.62 0 0 0 8.19 8.35c1.63-1.63 2.45-6.6 1.02-8.5z" fill="hsl(120 60% 80% / 0.4)" />
        <path d="M12 11c-2.5-2.5-2.5-7 1-7s7 2.5 7 7-4.5 9.5-7 7-7-4.5-7-7z" fill="hsl(120 60% 90% / 0.5)" />
    </svg>
);

const CoinPouchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="hsl(var(--gilded-accent))" fill="hsl(var(--gilded-accent) / 0.3)" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="hsl(var(--sidekick-brown))" fontWeight="bold">Ξ</text>
    </svg>
);

const CartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
);

const TrampledIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8.5 14.5 7 13l-5 5" />
        <path d="m15.5 14.5 1.5-1.5 5 5" />
        <path d="M6 9.5 7.5 8l5 5" />
        <path d="m18 9.5-1.5-1.5-5 5" />
        <path d="m12 2-1 4-4-1 2 5-5 2 4 1-1 4 4-1 1 4 4-1-1-4 4-1-2-5 5-2-4 1-1-4z" fill="hsl(var(--destructive) / 0.3)"/>
    </svg>
);

const PraetorianGuardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="hsl(var(--primary) / 0.3)" />
        <path d="M12 4.5L18 7v4" />
        <path d="M12 4.5L6 7v4" />
        <path d="M12 13V22" />
        <path d="M6 11l6 2 6-2" />
    </svg>
);

const SYMBOL_CONFIG = {
    CABBAGE: { icon: CabbageIcon, label: 'Perfect Cabbage', color: 'text-green-400' },
    COIN: { icon: CoinPouchIcon, label: 'Coin Pouch', color: 'text-gilded-accent' },
    CART: { icon: CartIcon, label: 'Sturdy Cart', color: 'text-blue-400' },
    TRAMPLED: { icon: TrampledIcon, label: 'Trampled Cabbage', color: 'text-destructive' },
    GUARD: { icon: PraetorianGuardIcon, label: 'Praetorian Guard', color: 'text-primary' },
};

type SymbolKey = keyof typeof SYMBOL_CONFIG;

const SYMBOLS: SymbolKey[] = ['CABBAGE', 'COIN', 'CART', 'TRAMPLED', 'GUARD'];

const Reel = ({ symbols, duration }: { symbols: SymbolKey[], duration: number }) => {
    const Icon = symbols[symbols.length-1] ? SYMBOL_CONFIG[symbols[symbols.length-1]].icon : CabbageIcon;
    const color = symbols[symbols.length-1] ? SYMBOL_CONFIG[symbols[symbols.length-1]].color : 'text-foreground';
    
    return (
        <div className="h-24 w-20 overflow-hidden bg-background/30 rounded-lg border border-primary/20 flex items-center justify-center">
            <motion.div
                animate={{ y: `-${(symbols.length - 1) * 6}rem` }}
                transition={{ duration, ease: 'backInOut' }}
            >
                {symbols.map((symbol, i) => {
                    const SymbolIcon = SYMBOL_CONFIG[symbol].icon;
                    return (
                        <div key={i} className="h-24 flex items-center justify-center">
                            <SymbolIcon className={cn("w-14 h-14", SYMBOL_CONFIG[symbol].color)} />
                        </div>
                    )
                })}
            </motion.div>
        </div>
    )
};

const WinConfetti = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({length: 30}).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gilded-accent rounded-full"
                    style={{
                        top: '50%',
                        left: '50%',
                    }}
                    animate={{
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        scale: [1, 1.5, 0],
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                        ease: 'easeOut'
                    }}
                />
            ))}
        </div>
    )
}

export default function MerchantOfCabbage() {
    const [isLoading, setIsLoading] = useState(false);
    const [tributeAmount, setTributeAmount] = useState('15');
    const [reels, setReels] = useState<SymbolKey[][]>([['CABBAGE'], ['CABBAGE'], ['CABBAGE']]);
    const [result, setResult] = useState<{ outcome: string, boonAmount: number } | null>(null);
    const [echo, setEcho] = useState<{ amount: number; key: number } | null>(null);
    const { toast } = useToast();
    const [isShaking, setIsShaking] = useState(false);

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
                if(tributeResult.outcome === 'common' || tributeResult.outcome === 'loss') {
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 500);
                }
            }, 3000);
        } else {
            toast({ variant: 'destructive', title: 'Tribute Failed', description: tributeResult.error });
            setIsLoading(false);
        }
    };

    const getResultAlert = () => {
        if (!result) return null;
        
        const { outcome, boonAmount } = result;
        const isWin = outcome !== 'common' && outcome !== 'loss';

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                {isWin && <WinConfetti />}
                <Alert className={cn(isWin ? 'border-gilded-accent/50 text-gilded-accent bg-gilded-accent/10' : 'border-destructive text-destructive bg-destructive/10')}>
                    <Gem className="h-4 w-4" />
                    <AlertTitle>{isWin ? 'Imperial Contract!' : 'MY CABBAGES!!'}</AlertTitle>
                    <AlertDescription className="text-foreground/80">
                        {isWin ? `A profitable day at the market! A boon of ${boonAmount.toFixed(2)} Ξ has been secured.` : 'Your cart was overturned in a minor public disturbance. The tribute was lost.'}
                    </AlertDescription>
                </Alert>
            </motion.div>
        );
    }

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-gradient-to-b from-military-green/10 via-sidekick-brown/10 to-background/10">
            <motion.div animate={isShaking ? 'shake' : 'stop'} variants={{ shake: { x: [0, -5, 5, -5, 5, 0] }, stop: { x: 0 } }} transition={{ duration: 0.4 }}>
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
            </motion.div>

            <AnimatePresence>
                {result && getResultAlert()}
            </AnimatePresence>
            
            <Card className="bg-background/30 border-sidekick-brown/30 mt-auto">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-sm font-headline">The Forum</CardTitle>
                </CardHeader>
                <CardContent className="p-2 grid grid-cols-5 gap-1 text-xs text-center">
                    {SYMBOLS.map(key => {
                        const Icon = SYMBOL_CONFIG[key].icon;
                        return (
                        <div key={key} className="p-1 rounded-md flex flex-col items-center">
                            <Icon className={cn("w-8 h-8", SYMBOL_CONFIG[key].color)} />
                            <p className="font-semibold mt-1 text-foreground/80">{SYMBOL_CONFIG[key].label}</p>
                        </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
