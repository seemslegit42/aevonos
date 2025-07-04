
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
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
              <h2 className="text-2xl font-bold font-headline">The Echo Has Been Sent</h2>
              <p className="text-muted-foreground">Follow the echo sent to your designation to enter the Canvas.</p>
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
    </div>
  );
}
