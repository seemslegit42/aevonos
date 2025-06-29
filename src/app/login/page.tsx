
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email({ message: 'A valid sigil is required.' }),
  password: z.string().min(1, 'A vow must be made.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'architect@aevonos.com',
      password: 'password123',
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: LoginFormData) {
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
        title: 'Vow Accepted.',
        description: 'The canvas materializes before you.',
      });

      router.push('/');
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Vow Rejected.',
        description: (error as Error).message,
      });
    }
  }

  return (
    <div className="w-full h-screen relative flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-sm"
        >
            <Card className="bg-foreground/5 backdrop-blur-xl border-foreground/20">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image src="/logo-green.png" alt="Aevon OS Logo" width={60} height={60} />
                    </div>
                    <CardTitle className="text-2xl font-headline tracking-wider text-primary">Re-enter the Canvas</CardTitle>
                    <CardDescription>Reaffirm your vow to the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="architect@aevonos.com" {...field} className="pl-10" />
                                            </div>
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
                                        <FormLabel className="sr-only">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="password" placeholder="••••••••••••••••" {...field} className="pl-10" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Invoke The Canvas'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                First invocation?{' '}
                <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                    Begin the Rite.
                </Link>
            </div>
        </motion.div>
    </div>
  );
}
