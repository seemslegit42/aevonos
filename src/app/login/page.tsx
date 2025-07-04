
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { BeepIcon } from '@/components/icons/BeepIcon';
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4 p-8"
              >
                <MailCheck className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl font-bold font-headline">The Ether Has Heard Your Call</h2>
                <p className="text-muted-foreground">Await the echo.</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <CardHeader className="text-center">
                  <BeepIcon className="w-16 h-16 mx-auto text-primary" />
                  <CardTitle className="font-headline text-2xl text-primary pt-4">Enter the Chamber</CardTitle>
                  <CardDescription>State your designation to proceed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your designation (email)..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Continue'}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
