
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
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
        throw new Error(data.error || 'An unexpected error occurred.');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Invocation Failed',
        description: err.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Image
              src="/logo-neutral.svg"
              alt="Aevon OS Logo"
              width={120}
              height={40}
              className="mx-auto mb-4 h-10 w-auto"
            />
            <CardTitle className="font-headline text-2xl">Resume the Ritual</CardTitle>
            <CardDescription>The Canvas awaits its Architect.</CardDescription>
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
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Sigil (Email)"
                            className="pl-10"
                            disabled={isSubmitting}
                            {...field}
                          />
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
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <Input
                            type="password"
                            placeholder="Vow (Password)"
                            className="pl-10"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant="summon" type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Summon the Canvas
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col items-center justify-center text-center">
             {error && <p className="text-destructive text-sm mb-4">{error}</p>}
            <p className="text-xs text-muted-foreground">
              New Operator?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Begin the Rite of Invocation.
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
