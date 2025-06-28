
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof formSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'architect@aevonos.com',
      password: 'password123',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormData) {
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
    <div className="w-full h-screen relative">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
            <FlowerOfLifeIcon className="w-full max-w-3xl h-full max-h-3xl" />
        </div>
        <div className="w-full h-screen flex items-center justify-center p-4 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-full max-w-sm"
            >
                <Card className="bg-background/80 backdrop-blur-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-headline tracking-widest">
                        Identity Verification
                        </CardTitle>
                        <CardDescription>The system requires a handshake.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>System Handle</FormLabel>
                                        <FormControl>
                                            <Input placeholder="architect@aevonos.com" {...field} disabled={isSubmitting} />
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
                                        <FormLabel>Encryption Key</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••••••••" {...field} disabled={isSubmitting}/>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                     {isSubmitting ? <Loader2 className="animate-spin" /> : 'Authenticate & Enter'}
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                        Need system access?{' '}
                        <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                            Request a build.
                        </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    </div>
  );
}
