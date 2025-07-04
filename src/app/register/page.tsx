
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('A valid designation is required.');
            return;
        }

        setIsLoading(true);

        // Simulate a brief delay to show loading state, then redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.push(`/register/vow?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <Card className="bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
                    <CardHeader className="text-center space-y-2">
                        <BeepIcon className="w-16 h-16 mx-auto text-primary" />
                        <CardTitle className="text-3xl font-bold text-center font-headline">The Rite of Invocation</CardTitle>
                        <CardDescription className="text-center text-muted-foreground mt-2">Begin the whisper. State your designation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="invocation-form" className="mt-4 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="sr-only">Designation (Email Address)</label>
                                <Input id="email" name="email" type="email" autoComplete="email" required
                                    className="w-full px-4 py-3 rounded-lg bg-background/50 border-border/50 focus-visible:ring-primary"
                                    placeholder="initiate@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <div>
                                <Button type="submit"
                                        className="w-full" variant="summon" disabled={isLoading}>
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
                </Card>
            </motion.div>
        </div>
    );
}
