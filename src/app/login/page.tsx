
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send login link.');
      }
      
      window.localStorage.setItem('emailForSignIn', email);
      setIsSubmitted(true);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.5, ease: [0.6, -0.05, 0.7, 0.99] } },
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements from RootLayout */}
        <div className="absolute top-0 z-[-2] h-full w-full bg-background">
            <div 
                className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
            />
            <div 
                className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
            />
            <div className="absolute inset-0 grain-overlay" />
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none -z-10">
                <FlowerOfLifeIcon className="w-full h-full max-w-3xl max-h-3xl" />
            </div>
        </div>
      <div
        className="w-full max-w-sm text-center"
      >
        <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4 p-8 bg-background/30 backdrop-blur-md rounded-xl border border-border/20"
              >
                <MailCheck className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl font-bold font-headline">An Echo Has Been Sent</h2>
                <p className="text-muted-foreground">Follow it from your inbox to cross the threshold.</p>
              </motion.div>
            ) : (
              <motion.div key="form" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <Image 
                    src="/logo.png"
                    alt="Aevon OS Logo"
                    width={100}
                    height={100}
                    className="mx-auto animate-subtle-pulse"
                    priority
                />
                <div className="space-y-2">
                    <h1 className="font-headline text-4xl text-foreground tracking-tight">The Threshold</h1>
                    <p className="text-muted-foreground">A silent, waiting space.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1 text-left">
                    <Label htmlFor="email">State your designation</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="oracle@aevonos.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="bg-background/50 h-12 text-center"
                    />
                  </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base" variant="summon">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Cross the Threshold'}
                    </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}
