
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useAppStore } from '@/store/app-store';

interface ProxyAgentProps {
  id: string; // app instance id
  vendor?: string;
  amount?: number;
  currency?: string;
}

const PhysicalPayoutSigil = () => (
    <svg viewBox="0 0 100 100" width="120" height="120">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)">
            <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="none" stroke="#6A0DAD" strokeWidth="2">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
            </path>
            <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="none" stroke="#3EB991" strokeWidth="1.5" transform="rotate(45 50 50)">
                 <animateTransform attributeName="transform" type="rotate" from="45 50 50" to="405 50 50" dur="12s" repeatCount="indefinite" />
            </path>
             <circle cx="50" cy="50" r="20" fill="none" stroke="#20B2AA" strokeWidth="1">
                 <animate attributeName="r" from="20" to="30" dur="1.5s" begin="0s" repeatCount="indefinite" values="20; 30; 20" keyTimes="0; 0.5; 1" />
                 <animate attributeName="opacity" from="1" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" values="1; 0.2; 1" keyTimes="0; 0.5; 1" />
            </circle>
        </g>
    </svg>
);


export default function ProxyAgent({ id, vendor = 'The Alchemist Bar', amount = 175, currency = 'CAD' }: ProxyAgentProps) {
    const { closeApp } = useAppStore();
    const { toast } = useToast();
    const [status, setStatus] = useState<'quoting' | 'ready' | 'authorizing' | 'complete' | 'error'>('quoting');
    const [quote, setQuote] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const getQuote = async () => {
            try {
                const res = await fetch('/api/proxy/initiate_transmutation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, currency, vendor })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to get quote.');
                }
                if (!data.isSufficient) {
                     throw new Error('Insufficient Ξ balance for this transmutation.');
                }
                setQuote(data);
                setStatus('ready');
            } catch (err: any) {
                setError(err.message);
                setStatus('error');
            }
        };
        getQuote();
    }, [vendor, amount, currency]);

    const handleAuthorize = async () => {
        setStatus('authorizing');
        try {
            const res = await fetch('/api/proxy/execute_transmutation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quote })
            });
            if (!res.ok) {
                 const data = await res.json();
                 throw new Error(data.error || 'Authorization failed.');
            }
            setStatus('complete');
            setTimeout(() => closeApp(id), 2500); // Close panel after animation
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };
    
    const renderContent = () => {
        switch (status) {
            case 'quoting':
                return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-sm">Contacting the Proxy...</p></div>;
            case 'ready':
                return (
                    <>
                        <h2 className="text-xl font-headline text-primary">Command a Material Manifestation</h2>
                        <p className="text-sm text-muted-foreground">A tribute to facilitate a real-world transaction with {vendor}.</p>
                        <p className="text-3xl font-bold text-accent">
                            {amount.toFixed(2)} {currency}
                        </p>
                        <Separator className="my-2" />
                        <div className="w-full text-left text-xs space-y-1">
                            <div className="flex justify-between"><span>Cost in Xi:</span> <span className="font-mono">{quote.costInX.toLocaleString()} Ξ</span></div>
                            <div className="flex justify-between"><span>Transmutation Tithe ({quote.titheRate * 100}%):</span> <span className="font-mono">{quote.tithe.toLocaleString()} Ξ</span></div>
                        </div>
                        <div className="w-full text-left text-lg font-bold flex justify-between border-t mt-2 pt-2">
                            <span>Total Tribute:</span>
                            <span className="font-mono">{quote.total.toLocaleString()} Ξ</span>
                        </div>
                        <Button size="lg" className="w-full" onClick={handleAuthorize}>
                            <Fingerprint className="mr-2" />
                            AUTHORIZE
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => closeApp(id)}>
                            Deny
                        </Button>
                    </>
                );
            case 'authorizing':
                 return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-sm">Performing the Ritual...</p></div>;
            case 'complete':
                return (
                    <>
                        <h2 className="text-xl font-headline text-accent">Transmutation Complete</h2>
                        <PhysicalPayoutSigil />
                        <p className="text-sm">The tribute has been accepted.</p>
                    </>
                );
            case 'error':
                return (
                     <>
                        <h2 className="text-xl font-headline text-destructive">Transmutation Failed</h2>
                        <AlertTriangle className="h-10 w-10 text-destructive my-4" />
                        <p className="text-sm">{error}</p>
                         <Button variant="secondary" className="w-full" onClick={() => closeApp(id)}>
                            Close
                        </Button>
                    </>
                );
        }
    };

    return (
        <div className="p-4 h-full">
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
                {renderContent()}
            </div>
        </div>
    );
}
