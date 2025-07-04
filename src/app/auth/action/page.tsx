
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { BeepIcon } from '@/components/icons/BeepIcon';

export default function AuthActionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
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
                    // The user opened the link on a different device. To prevent session fixation
                    // attacks, ask the user to provide their email again.
                    // For simplicity in this flow, we will error out. A real app might show a form.
                    setError("Your email is required to complete sign-in. Please try the login process again on this device.");
                    setStatus('error');
                    return;
                }
                
                try {
                    await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                    setStatus('success');
                    // The onAuthStateChanged listener in AuthContext will handle session creation.
                    // Redirect after a short delay.
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                } catch (err) {
                    console.error("Sign in with email link error:", err);
                    setError('The signature is invalid or has expired. Please try again.');
                    setStatus('error');
                }
            } else {
                 setError('This is not a valid sign-in link.');
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
                        <p className="text-muted-foreground">The Canvas awakens. Redirecting...</p>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <AlertTriangle className="w-16 h-16 text-destructive" />
                        <h2 className="text-2xl font-bold font-headline">Authentication Failed</h2>
                        <p className="text-muted-foreground">{error}</p>
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
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-sm text-center space-y-4"
            >
                <BeepIcon className="w-20 h-20 mx-auto text-primary" />
                {renderStatus()}
            </motion.div>
        </div>
    );
}
