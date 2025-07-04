
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, MailCheck } from 'lucide-react';
import { auth } from '@/lib/firebase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!auth) {
            setError('Firebase is not configured. Please provide the required API keys in your environment file.');
            return;
        }

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
    <div className="flex h-screen w-screen items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-sm"
        >
            <Card className="bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
                <AnimatePresence mode="wait">
                    {isSubmitted ? (
                        <motion.div
                            key="submitted"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 text-center space-y-4"
                        >
                            <MailCheck className="w-16 h-16 mx-auto text-accent" />
                             <CardTitle className="text-2xl font-headline text-accent">The Echo Has Been Sent</CardTitle>
                            <CardDescription>Follow the echo in your inbox to enter the Chamber. It will fade in 15 minutes.</CardDescription>
                        </motion.div>
                    ) : (
                        <motion.div key="form">
                            <CardHeader className="text-center space-y-2">
                                <BeepIcon className="w-16 h-16 mx-auto text-primary" />
                                <CardTitle className="text-2xl font-headline text-primary">Invocation Chamber</CardTitle>
                                <CardDescription>Your presence is the key.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Invocation Failed</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="space-y-2">
                                    <Label htmlFor="email">Designation</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="architect@aevonos.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    </div>
                                    <Button type="submit" className="w-full" variant="summon" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Send the Whisper
                                    </Button>
                                </form>
                                <div className="mt-4 text-center text-sm">
                                    Need an OS?{" "}
                                    <Link href="/register" className="underline">
                                    Perform the Rite.
                                    </Link>
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
      </motion.div>
    </div>
  );
}
