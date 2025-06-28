'use client';

import React from 'react';
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

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
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
        throw new Error(errorData.error || 'Failed to login.');
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back to ΛΞVON OS.',
      });
      router.push('/');
      router.refresh(); // To ensure layout reflects logged-in state
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: (error as Error).message,
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl text-white">
        <CardHeader className="text-center space-y-4 pt-8">
            <div className="flex justify-center">
                 <CrystalIcon className="w-16 h-16 text-primary" />
            </div>
            <div>
                <CardTitle className="text-3xl font-headline tracking-widest text-white">
                    ΛΞVON
                </CardTitle>
                <CardDescription className="text-white/70">Enter the intelligent canvas.</CardDescription>
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
                    <FormLabel className="text-white/80">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="agent@aevonos.com" 
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
                    <FormLabel className="text-white/80">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
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
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enter Canvas'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-white/60">
            Need an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
