
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!auth) {
            setError('Firebase is not configured. Please provide the required API keys in your environment file.');
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged in AuthContext will handle session cookie and redirect
            router.push('/');
            router.refresh();
        } catch (err: any) {
            if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(err.code)) {
                setError('Invalid credentials. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDemoLogin = async () => {
        setError(null);
        setIsLoading(true);
        if (!auth) {
            setError('Firebase is not configured. Please provide the required API keys in your environment file.');
            setIsLoading(false);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, 'architect@aevonos.com', 'password123');
            router.push('/');
            router.refresh();
        } catch (err) {
             setError('Demo user login failed. Please ensure the database is seeded.');
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-sm"
        >
            <Card className="bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
                <CardHeader className="text-center space-y-2">
                <BeepIcon className="w-16 h-16 mx-auto text-primary" />
                <CardTitle className="text-2xl font-headline text-primary">Invocation Chamber</CardTitle>
                <CardDescription>Your will, made manifest.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    </div>
                    <Button type="submit" className="w-full" variant="summon" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Enter the Chamber
                    </Button>
                </form>
                <Button variant="secondary" className="w-full mt-2" onClick={handleDemoLogin} disabled={isLoading}>
                    Sign In as The Architect
                </Button>
                <div className="mt-4 text-center text-sm">
                    Need an OS?{" "}
                    <Link href="/register" className="underline">
                    Perform the Rite.
                    </Link>
                </div>
                </CardContent>
            </Card>
      </motion.div>
    </div>
  );
}
