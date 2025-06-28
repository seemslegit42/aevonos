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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CrystalIcon } from '@/components/icons/CrystalIcon';

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  workspaceName: z.string().trim().min(1, { message: "Workspace name cannot be empty." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      workspaceName: "",
      email: "",
      password: "",
    },
  });
  
  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData.issues ? responseData.issues.map((i: any) => i.message).join(', ') : responseData.error;
        throw new Error(errorMsg || 'Failed to register.');
      }
      
      toast({
        title: 'Registration Successful',
        description: 'Your workspace has been created. Welcome to ΛΞVON OS.',
      });

      router.push('/');
      router.refresh();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
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
              <CardDescription className="text-white/70">Create your intelligent canvas.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Art" {...field} disabled={isSubmitting} className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Vandelay" {...field} disabled={isSubmitting} className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="workspaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vandelay Industries" {...field} disabled={isSubmitting} className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="agent@aevonos.com" {...field} disabled={isSubmitting} className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" />
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
                      <Input type="password" placeholder="Min. 8 characters" {...field} disabled={isSubmitting} className="bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary/80 backdrop-blur-sm border border-primary text-white hover:bg-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Workspace'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
