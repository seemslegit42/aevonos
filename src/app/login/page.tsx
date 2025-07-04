
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Fingerprint, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// --- Shared State & Types ---
type PresenceState = {
    challenge: string | null;
    signedChallenge: string | null;
    isAuthenticated: boolean;
};

// --- SVG & Asset Components ---
const FlowerOfLifeSVG: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="100%" height="100%" viewBox="0 0 800 800" className={cn("absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000", className)}>
        <defs>
            <pattern id="flower" patternUnits="userSpaceOnUse" width="100" height="115.47">
                <g transform="translate(50, 57.735)">
                    <circle cx="0" cy="0" r="28.8675" stroke="rgba(255, 255, 255, 0.2)" fill="none" strokeWidth="0.5"/>
                </g>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#flower)" />
    </svg>
);

const Logo: React.FC = () => (
    <Image 
        src="/logo.png" 
        alt="ΛΞVON OS Logo" 
        width={150}
        height={50}
        className="h-10 w-auto"
        priority
    />
);

// --- Component 1: The Workstation Canvas ---
interface WorkstationCanvasProps {
    presence: PresenceState;
    setPresence: React.Dispatch<React.SetStateAction<PresenceState>>;
}

const WorkstationCanvas: React.FC<WorkstationCanvasProps> = ({ presence, setPresence }) => {
    
    useEffect(() => {
        if (!presence.challenge) {
            const newChallenge = `aevon-challenge-${crypto.randomUUID()}`;
            setPresence(p => ({ ...p, challenge: newChallenge }));
        }
    }, [presence.challenge, setPresence]);

    useEffect(() => {
        if (presence.signedChallenge && presence.challenge) {
            if (presence.signedChallenge === `signed(${presence.challenge})`) {
                setTimeout(() => setPresence(p => ({ ...p, isAuthenticated: true })), 500);
            }
        }
    }, [presence.signedChallenge, presence.challenge, setPresence]);

    const isAwake = presence.isAuthenticated;

    return (
        <Card className={cn(
            "w-full lg:w-2/3 h-full relative overflow-hidden transition-all duration-1000 ease-in-out flex flex-col items-center justify-center text-center p-8",
            isAwake ? 'border-primary/50 shadow-2xl shadow-primary/20' : 'border-border/20'
        )}>
            <div className={cn(
                "absolute inset-0 z-[-1] transition-opacity duration-1000 ease-in-out",
                isAwake ? 'opacity-25 animate-aurora' : 'opacity-5',
                "bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
            )}></div>
            
            <FlowerOfLifeSVG className={isAwake ? 'opacity-10' : 'opacity-5'}/>

            <div className="relative z-10">
                <motion.div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    animate={{ opacity: isAwake ? 0 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-headline text-muted-foreground">ΛΞVON OS</h1>
                    <p className="text-muted-foreground/80 mt-2">Dormant. Awaiting Presence.</p>
                    
                    {presence.challenge && (
                         <div className="mt-8 p-4 bg-white/10 rounded-lg inline-block">
                             <Image 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${presence.challenge}&bgcolor=19191E&color=F5F5F5&qzone=1`}
                                alt="Awakening Challenge QR Code"
                                width={160}
                                height={160}
                             />
                         </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4">Scan the Awakening Challenge with your Mobile Companion.</p>
                </motion.div>

                <motion.div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isAwake ? 1 : 0 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                >
                    <Logo />
                    <h1 className="text-5xl font-headline mt-4">Welcome, Sovereign.</h1>
                    <p className="text-primary mt-2">The Canvas is awake.</p>
                </motion.div>
            </div>
        </Card>
    );
};


// --- Component 2: The Mobile Companion ---
interface MobileCompanionProps {
    presence: PresenceState;
    setPresence: React.Dispatch<React.SetStateAction<PresenceState>>;
}

const MobileCompanion: React.FC<MobileCompanionProps> = ({ presence, setPresence }) => {
    const [scannedChallenge, setScannedChallenge] = useState<string | null>(null);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    const handleScan = () => {
        if (presence.challenge) {
            setScannedChallenge(presence.challenge);
        }
    };

    const handleAuthorize = async () => {
        setIsAuthorizing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (scannedChallenge) {
            const signed = `signed(${scannedChallenge})`;
            setPresence(p => ({ ...p, signedChallenge: signed }));
        }
        setIsAuthorizing(false);
    };

    return (
        <Card className="w-full max-w-sm lg:w-1/3 h-full flex flex-col p-6">
            <CardHeader className="text-center p-0 mb-4">
                <CardTitle className="text-xl font-headline">Mobile Companion</CardTitle>
                <CardDescription>Sovereign's Key</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center bg-background/50 rounded-lg p-4">
                {!scannedChallenge ? (
                    <Button onClick={handleScan} variant="summon" className="px-6 py-3 h-auto">
                        Scan Awakening Challenge
                    </Button>
                ) : (
                    <div className="text-center space-y-4 w-full">
                        <p className="text-xs text-muted-foreground">Challenge Received:</p>
                        <p className="text-sm font-mono bg-background/80 p-2 rounded break-all">{scannedChallenge}</p>
                        <Button 
                            onClick={handleAuthorize} 
                            disabled={isAuthorizing || !!presence.signedChallenge}
                            variant="summon"
                            className="w-full px-6 py-4 text-lg h-auto"
                        >
                            {isAuthorizing 
                                ? <><Loader2 className="animate-spin mr-2"/> Signing...</>
                                : presence.signedChallenge ? <><Check className="mr-2"/> Signature Transmitted</> : <><Fingerprint className="mr-2"/>Authorize</>}
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-0 pt-4 mt-auto">
                <div className="text-center text-sm w-full">
                    New Initiate?{" "}
                    <Link href="/register" className="underline text-primary">
                        Begin the Rite of Invocation.
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
};


// --- Main Page Component ---
export default function LoginPage() {
    const router = useRouter();
    const [presence, setPresence] = useState<PresenceState>({
        challenge: null,
        signedChallenge: null,
        isAuthenticated: false,
    });

    useEffect(() => {
        if (presence.isAuthenticated) {
            // This is a simulation. A real implementation would now call the backend to get a session JWT.
            // For now, it just redirects to the main canvas.
            setTimeout(() => router.push('/'), 2000);
        }
    }, [presence.isAuthenticated, router]);
    
    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen items-stretch justify-center gap-8 p-4 lg:p-8">
            <WorkstationCanvas presence={presence} setPresence={setPresence} />
            <MobileCompanion presence={presence} setPresence={setPresence} />
        </div>
    );
}
