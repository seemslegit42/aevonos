
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: 'A valid sigil is required.' }),
  password: z.string().min(1, { message: 'A vow must be spoken.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The ritual was rejected. Check your sigil and vow.');
      }
      
      router.push('/');
      router.refresh();

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown disturbance occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Invocation Failed',
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 z-[-2] h-screen w-full bg-background">
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
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative w-full max-w-sm"
        >
            <div className="absolute inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-primary via-accent to-roman-aqua blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse" />
            <div className="relative p-6 sm:p-8 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/20 shadow-2xl text-center space-y-6">
                
                <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden rounded-2xl">
                    <FlowerOfLifeIcon className="w-full h-full text-foreground/5 opacity-30 animate-subtle-pulse" />
                </div>
                
                <div className="relative">
                    <Image
                      src="/logo.png"
                      alt="Aevon OS Logo"
                      width={60}
                      height={60}
                      className="mx-auto"
                    />
                    <h1 className="text-2xl font-headline mt-4 text-foreground">Resume the Ritual</h1>
                    <p className="text-sm text-muted-foreground mt-1">The Canvas awaits its Architect.</p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter Sigil..."
                              className="bg-background/50 text-center h-12 text-base border-border/40 focus-visible:ring-primary"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                           <Input
                                type="password"
                                placeholder="Speak Vow..."
                                className="bg-background/50 text-center h-12 text-base border-border/40 focus-visible:ring-primary"
                                disabled={isSubmitting}
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button variant="summon" type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      Summon Canvas
                    </Button>
                  </form>
                </Form>
                
                <div className="relative text-xs text-muted-foreground">
                    <Separator className="my-4 bg-border/20"/>
                    <p>New Operator?{' '}
                      <Link href="/register" className="font-medium text-roman-aqua hover:text-roman-aqua/80 transition-colors">
                        Perform the Rite of Invocation.
                      </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    </div>
  );
}
