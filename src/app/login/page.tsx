
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  email: z.string().email({ message: "A valid email is required for system entry." }),
  password: z.string().min(1, { message: "A password is required. Even I can't get you in without it." }),
});

const emailPlaceholders = [
    "architect@aevonos.com",
    "the.one@the.matrix",
    "beep_is_my_friend@aevonos.com",
    "agent.smith@the.system",
    "enter.the.void@aevonos.com"
];

const passwordPlaceholders = [
    "••••••••••••••",
    "The password is 'password'. Just kidding. Or am I?",
    "It's definitely not '123456'",
    "The key to the universe... or just your password.",
];


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [emailPlaceholder, setEmailPlaceholder] = useState(emailPlaceholders[0]);
  const [passwordPlaceholder, setPasswordPlaceholder] = useState(passwordPlaceholders[0]);

  useEffect(() => {
      const emailInterval = setInterval(() => {
          setEmailPlaceholder(p => {
              const currentIndex = emailPlaceholders.indexOf(p);
              const nextIndex = (currentIndex + 1) % emailPlaceholders.length;
              return emailPlaceholders[nextIndex];
          });
      }, 3000);

      const passwordInterval = setInterval(() => {
          setPasswordPlaceholder(p => {
              const currentIndex = passwordPlaceholders.indexOf(p);
              const nextIndex = (currentIndex + 1) % passwordPlaceholders.length;
              return passwordPlaceholders[nextIndex];
          });
      }, 4500);

      return () => {
          clearInterval(emailInterval);
          clearInterval(passwordInterval);
      };
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication sequence failed. Check credentials.');
      }

      toast({
        title: 'Identity Verified.',
        description: 'Welcome back, Architect. The canvas awaits.',
      });
      router.push('/');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Access Denied.',
        description: (error as Error).message,
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl text-white">
        <CardHeader className="text-center space-y-4 pt-8">
            <div className="flex justify-center">
                <CrystalIcon className="w-16 h-16 text-primary crystal-pulse" />
            </div>
            <div>
                <CardTitle className="text-3xl font-headline tracking-widest text-white">
                    Identity Verification
                </CardTitle>
                <CardDescription className="text-white/70">The system requires a handshake.</CardDescription>
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
                    <FormLabel className="text-white/80">System Handle</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder={emailPlaceholder} 
                        {...field} 
                        disabled={isSubmitting} 
                        className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary"
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
                    <div className="flex justify-between items-center">
                        <FormLabel className="text-white/80">Encryption Key</FormLabel>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">
                                        Key forgotten?
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Tough luck. Try to remember it. I'm an OS, not a locksmith.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={passwordPlaceholder}
                        {...field} 
                        disabled={isSubmitting} 
                        className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary/80 backdrop-blur-sm border border-primary text-white hover:bg-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Authenticate & Enter'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-white/60">
            Need system access?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Request a build.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
