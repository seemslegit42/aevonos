
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, MailCheck, QrCode, Fingerprint } from 'lucide-react';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

// --- Shared State & Types ---
type PresenceState = {
    challenge: string | null;
    signedChallenge: string | null;
    isAuthenticated: boolean;
};

// --- Component 1: The Workstation Canvas ---
const WorkstationCanvas: React.FC<{ presence: PresenceState, isAuthenticated: boolean }> = ({ presence, isAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send signature.');
            }
            
            window.localStorage.setItem('emailForSignIn', email);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full h-full lg:w-2/3 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
            {isAuthenticated ? (
                <motion.div key="awakened" initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="text-center">
                    <FlowerOfLifeIcon className="w-48 h-48 mx-auto" />
                    <h1 className="text-4xl font-headline text-accent mt-4">Canvas Awakened</h1>
                    <p className="text-muted-foreground">Redirecting to your Sovereign Workspace...</p>
                </motion.div>
            ) : (
                <motion.div key="dormant" className="w-full max-w-md">
                    <Card className="glass-panel text-center p-6">
                        <CardTitle className="font-headline text-xl">Dormant Canvas</CardTitle>
                        <CardDescription>Awaiting Sovereign Signature...</CardDescription>
                        <div className="my-6 flex flex-col items-center gap-4">
                            <QrCode className="w-24 h-24 text-gray-400" />
                            <p className="text-xs text-gray-500 font-mono break-all">{presence.challenge || 'Generating challenge...'}</p>
                        </div>
                        <Separator className="bg-border/20 my-4" />
                        <p className="text-xs text-muted-foreground mb-4">Or, use a legacy whisper:</p>
                        {isSubmitted ? (
                             <motion.div key="submitted" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                                <MailCheck className="w-12 h-12 mx-auto text-accent" />
                                <h2 className="text-lg font-bold font-headline text-accent">The Echo Has Been Sent</h2>
                                <p className="text-muted-foreground text-sm">Follow the echo in your inbox to enter the Chamber.</p>
                            </motion.div>
                        ) : (
                             <form onSubmit={handleFormSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Invocation Failed</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="architect@aevonos.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="bg-background/50"
                                />
                                <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Send the Whisper
                                </Button>
                            </form>
                        )}
                        <div className="mt-4 text-center text-sm">
                            Need an OS?{" "}
                            <Link href="/register" className="underline">
                            Perform the Rite.
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
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
        <div className="w-full max-w-sm lg:w-1/3 h-[500px] lg:h-auto rounded-2xl glass-panel flex flex-col p-6 border border-border/50">
            <div className="text-center mb-4">
                <h2 className="font-headline text-xl">Mobile Companion</h2>
                <p className="text-xs text-muted-foreground">Sovereign's Key</p>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center bg-black/20 rounded-lg p-4">
                {!scannedChallenge ? (
                    <Button onClick={handleScan} variant="summon" className="px-6 py-3 h-auto">
                        Scan Awakening Challenge
                    </Button>
                ) : (
                    <div className="text-center space-y-4 w-full">
                        <p className="text-xs text-gray-400">Challenge Received:</p>
                        <p className="text-sm font-mono bg-black/30 p-2 rounded break-all">{scannedChallenge}</p>
                        <Button 
                            onClick={handleAuthorize} 
                            disabled={isAuthorizing || !!presence.signedChallenge}
                            variant="summon"
                            className="w-full px-6 py-4 text-lg h-auto"
                        >
                            {isAuthorizing 
                                ? <><Loader2 className="animate-spin mr-2"/> Signing...</>
                                : presence.signedChallenge ? 'Signature Transmitted' : <><Fingerprint className="mr-2"/>Authorize</>}
                        </Button>
                    </div>
                )}
            </div>
        </div>
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
        if (!presence.challenge) {
            const newChallenge = `aevon-challenge-${window.crypto.randomUUID()}`;
            setPresence(p => ({ ...p, challenge: newChallenge }));
        }
    }, [presence.challenge]);

    useEffect(() => {
        if (presence.signedChallenge && presence.challenge && presence.signedChallenge === `signed(${presence.challenge})`) {
            setTimeout(() => setPresence(p => ({ ...p, isAuthenticated: true })), 500);
        }
    }, [presence.signedChallenge, presence.challenge]);

    useEffect(() => {
        if (presence.isAuthenticated) {
            // In a real app, this would trigger the full session creation flow.
            // For now, it just redirects to the main canvas.
            setTimeout(() => router.push('/'), 2000);
        }
    }, [presence.isAuthenticated, router]);

    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen items-center justify-center gap-8 p-4">
            <WorkstationCanvas presence={presence} isAuthenticated={presence.isAuthenticated} />
            <MobileCompanion presence={presence} setPresence={setPresence} />
        </div>
    );
}
