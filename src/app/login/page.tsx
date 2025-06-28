
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

const formSchema = z.object({
  email: z.string().email({ message: "A valid email is required for system entry." }),
  password: z.string().min(1, { message: "An encryption key is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "architect@aevonos.com",
      password: "password123",
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
    <div className="relative w-full h-screen flex items-center justify-center p-4">
      {/* Background element */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <FlowerOfLifeIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[100vh] max-h-full" />
      </div>

      {/* Foreground Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-full max-w-sm z-10"
      >
        <Card className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl text-white">
          <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline tracking-widest text-white">
                  Identity Verification
              </CardTitle>
              <CardDescription className="text-white/70">The system requires a handshake.</CardDescription>
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
                          placeholder="architect@aevonos.com" 
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
                          <Link href="#" className="text-xs text-primary/70 hover:text-primary transition-colors">
                              Key forgotten?
                          </Link>
                      </div>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="••••••••••••••••"
                          {...field} 
                          disabled={isSubmitting} 
                          className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary/80 backdrop-blur-sm border border-primary text-primary-foreground hover:bg-primary" disabled={isSubmitting}>
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
      </motion.div>
    </div>
  );
}
