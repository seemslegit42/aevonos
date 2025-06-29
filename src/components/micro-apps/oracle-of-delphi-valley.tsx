
'use client';

import React, 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, Gem, Flame, Handshake, ScrollText, GitBranchSlash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { makeFollyTribute } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

const SYMBOL_CONFIG = {
    ROCKS: { icon: '🪨', label: 'Seed Round', color: 'text-gray-400' },
    SCROLL: { icon: '📜', label: 'Term Sheet', color: 'text-amber-300' },
    VOLCANO: { icon: '🌋', label: 'Burn Rate', color: 'text-red-500' },
    UNICORN: { icon: '🦄', label: 'Unicorn', color: 'text-pink-400' },
    LAUREL: { icon: '🌿', label: 'The Exit (IPO)', color: 'text-gilded-accent' },
};

type SymbolKey = keyof typeof SYMBOL_CONFIG;

const SYMBOLS: SymbolKey[] = ['ROCKS', 'SCROLL', 'VOLCANO', 'UNICORN', 'LAUREL'];

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

export default function OracleOfDelphiValley() {
    const { closeApp } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [tributeAmount, setTributeAmount] = useState('25');
    const [reels, setReels] = useState<SymbolKey[][]>([['ROCKS'], ['ROCKS'], ['ROCKS']]);
    const [result, setResult] = useState<{ outcome: string, boonAmount: number } | null>(null);
    const { toast } = useToast();

    const spinReels = (outcome: string, boonAmount: number) => {
        let finalSymbols: [SymbolKey, SymbolKey, SymbolKey];

        if (outcome === 'win' && boonAmount > 200) {
            finalSymbols = ['LAUREL', 'LAUREL', 'LAUREL']; // Jackpot
        } else if (outcome === 'win') {
            finalSymbols = ['UNICORN', 'UNICORN', 'UNICORN']; // Big Win
        } else if (outcome === 'pity_boon') {
            finalSymbols = ['ROCKS', 'ROCKS', 'SCROLL']; // Small win
        } else { // Loss
            finalSymbols = ['VOLCANO', 'VOLCANO', 'VOLCANO'];
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
            toast({ variant: 'destructive', title: 'Invalid Tribute', description: 'The Oracle requires a valid offering.' });
            return;
        }
        setIsLoading(true);
        setResult(null);

        // Prefill reels for spinning animation
        const placeholderReels = Array(3).fill(0).map(() => 
            Array(20).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
        setReels(placeholderReels);

        const tributeResult = await makeFollyTribute('ORACLE_OF_DELPHI_VALLEY', amount);

        if (tributeResult.success) {
            spinReels(tributeResult.outcome!, tributeResult.boonAmount!);
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
        
        if(outcome.startsWith('win') || outcome === 'pity_boon') {
            return (
                <Alert className="border-gilded-accent/50 text-gilded-accent bg-gilded-accent/10">
                    <Gem className="h-4 w-4" />
                    <AlertTitle>Favorable Prophecy</AlertTitle>
                    <AlertDescription className="text-foreground/80">The Oracle smiles upon your venture. A boon of {boonAmount.toFixed(2)} Ξ has been granted.</AlertDescription>
                </Alert>
            );
        }
        return (
            <Alert variant="destructive">
                <Flame className="h-4 w-4" />
                <AlertTitle>Ominous Portent</AlertTitle>
                <AlertDescription>Your tribute has been consumed by the burn rate. The Oracle is silent.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-2 h-full flex flex-col gap-3 bg-gradient-to-b from-primary/10 to-accent/10">
            <Card className="bg-background/30 border-primary/30">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base font-headline">The Loom of Folly</CardTitle>
                    <CardDescription className="text-xs">"Make your offering. Learn your fate."</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="flex justify-center gap-3 py-4">
                        <Reel symbols={reels[0]} duration={2} />
                        <Reel symbols={reels[1]} duration={2.5} />
                        <Reel symbols={reels[2]} duration={3} />
                    </div>
                     <div className="flex gap-2">
                        <Input 
                            type="number"
                            value={tributeAmount}
                            onChange={(e) => setTributeAmount(e.target.value)}
                            disabled={isLoading}
                            className="w-24 font-mono text-center"
                        />
                        <Button className="w-full" onClick={handleTribute} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Zap className="mr-2"/>Make Tribute</>}
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
            
            <Card className="bg-background/30 border-primary/30 mt-auto">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-sm font-headline">The Glyphs</CardTitle>
                </CardHeader>
                 <CardContent className="p-2 grid grid-cols-3 gap-1 text-xs text-center">
                    {SYMBOLS.map(key => (
                        <div key={key} className={cn("p-1 rounded-md", SYMBOL_CONFIG[key].color)}>
                            <p className="text-2xl">{SYMBOL_CONFIG[key].icon}</p>
                            <p className="font-semibold">{SYMBOL_CONFIG[key].label}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
