
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const LoginSchema = z.object({
  email: z.string().email({ message: "A valid designation is required." }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      const response = await fetch('/api/auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send login link.');
      }
      
      window.localStorage.setItem('emailForSignIn', data.email);
      setIsSubmitted(true);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: (error as Error).message,
      });
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
              >
                <Card className="bg-background/70 backdrop-blur-xl border-accent/50 shadow-lg">
                    <CardContent className="p-8 space-y-4">
                        <MailCheck className="w-16 h-16 mx-auto text-accent" />
                        <h2 className="text-2xl font-bold font-headline">An Echo Has Been Sent</h2>
                        <p className="text-muted-foreground">Follow it from your inbox to cross the threshold.</p>
                    </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="form" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                <Card className="bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
                    <CardHeader className="space-y-4">
                        <Image 
                            src="/logo.png"
                            alt="Aevon OS Logo"
                            width={80}
                            height={80}
                            className="mx-auto animate-subtle-pulse"
                            priority
                        />
                        <div className="space-y-1">
                            <CardTitle className="font-headline text-3xl tracking-tight">The Threshold</CardTitle>
                            <CardDescription>State your designation to begin the Rite of Invocation.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          id="email"
                                          type="email"
                                          placeholder="oracle@aevonos.com"
                                          disabled={isSubmitting}
                                          className="bg-background/50 h-12 text-center"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base" variant="summon">
                                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Cross the Threshold'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}
