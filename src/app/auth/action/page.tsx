
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

export default function AuthActionPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleSignIn = async () => {
            if (!auth) {
                setError('Authentication service is not configured.');
                setStatus('error');
                return;
            }
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    setError("The Echo has faded. The path is closed. Please return to the Threshold and state your designation again.");
                    setStatus('error');
                    return;
                }
                
                try {
                    await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/');
                    }, 2500);
                } catch (err) {
                    console.error("Sign in with email link error:", err);
                    setError('The signature is invalid or has expired. Please return to the Threshold.');
                    setStatus('error');
                }
            } else {
                 setError('This is not a valid echo. The path is unclear.');
                 setStatus('error');
            }
        };

        handleSignIn();
    }, [router]);
    

    const renderStatus = () => {
        switch (status) {
            case 'success':
                return (
                    <>
                        <CheckCircle className="w-16 h-16 text-accent" />
                        <h2 className="text-2xl font-bold font-headline">Signature Verified</h2>
                        <p className="text-muted-foreground">Your identity is being forged in the Nexus. Prepare to make your Vow.</p>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <AlertTriangle className="w-16 h-16 text-destructive" />
                        <h2 className="text-2xl font-bold font-headline">The Path is Broken</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto">{error}</p>
                    </>
                );
            case 'loading':
            default:
                return (
                    <>
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <h2 className="text-2xl font-bold font-headline">Verifying Signature...</h2>
                        <p className="text-muted-foreground">The aether is being consulted.</p>
                    </>
                );
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center p-4 relative overflow-hidden">
             <div className="absolute top-0 z-[-2] h-full w-full bg-background">
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
                />
                <div 
                    className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
                />
                <div className="absolute inset-0 grain-overlay" />
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-sm text-center space-y-4"
            >
                 <FlowerOfLifeIcon className="w-24 h-24 mx-auto text-primary" />
                {renderStatus()}
            </motion.div>
        </div>
    );
}
