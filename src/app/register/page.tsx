
'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSpeech } from '@/ai/flows/tts-flow';

// This is a placeholder for the real API call.
const initiateRite = async (email: string) => {
    console.log(`Initiating rite for: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true };
};

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const speak = async (text: string) => {
        try {
            const { audioDataUri } = await generateSpeech({ text });
            if (audioDataUri) {
                const audio = new Audio(audioDataUri);
                audio.play().catch(e => console.error("Audio playback failed:", e));
            }
        } catch(e) {
            console.error("Speech generation failed:", e);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('A valid designation is required.');
            return;
        }

        setIsLoading(true);
        const result = await initiateRite(email);
        setIsLoading(false);

        if (result.success) {
            setIsSubmitted(true);
            speak("The ether has heard your call. Await the echo.");
        } else {
            setError('The invocation failed. The aether is turbulent.');
            toast({
                variant: 'destructive',
                title: 'Invocation Failed',
                description: 'The aether is turbulent. Please try again.',
            });
        }
    };

    // For the prototype, this allows proceeding to the next step
    const handleProceedToVow = () => {
        router.push(`/register/vow?email=${encodeURIComponent(email)}`);
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <Card className="bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <CardHeader className="text-center space-y-2">
                                    <BeepIcon className="w-16 h-16 mx-auto text-primary" />
                                    <CardTitle className="text-3xl font-bold text-center font-headline">The Rite of Invocation</CardTitle>
                                    <CardDescription className="text-center text-muted-foreground mt-2">Begin the whisper. State your designation.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                                        <div>
                                            <label htmlFor="email" className="sr-only">Designation (Email Address)</label>
                                            <Input 
                                                id="email" 
                                                name="email" 
                                                type="email" 
                                                autoComplete="email" 
                                                required
                                                className="w-full px-4 py-3 rounded-lg bg-background/50 border-border/50 focus-visible:ring-primary"
                                                placeholder="initiate@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                        <div>
                                            <Button type="submit" className="w-full" variant="summon" disabled={isLoading}>
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center">
                                                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                                        <span>Transmitting...</span>
                                                    </div>
                                                ) : (
                                                    "Transmit Signature"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                    <div className="mt-4 text-center text-sm">
                                        Already have a pact?{" "}
                                        <Link href="/login" className="underline">
                                            Enter the Chamber.
                                        </Link>
                                    </div>
                                </CardContent>
                            </motion.div>
                        ) : (
                             <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 p-8">
                                <div className="flex justify-center">
                                    <CheckCircle className="w-16 h-16 text-green-400 animate-pulse" />
                                </div>
                                <CardTitle className="text-2xl font-bold font-headline">The Ether Has Heard Your Call</CardTitle>
                                <CardDescription className="text-gray-300">
                                    An echo has been dispatched to your designation. To cross the threshold, you must follow it before it fades.
                                </CardDescription>
                                <Button onClick={handleProceedToVow} variant="outline" className="mt-4">
                                    (Proceed to Vow Chamber)
                                </Button>
                                <p className="text-xs text-muted-foreground">For prototype purposes only.</p>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}
