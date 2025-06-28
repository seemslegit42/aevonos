
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <div className="w-full h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-full max-w-sm z-10"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline tracking-widest">
              Identity Verification
            </CardTitle>
            <CardDescription>The system requires a handshake.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">System Handle</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="architect@aevonos.com" 
                  defaultValue="architect@aevonos.com"
                  required 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="password">Encryption Key</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••••••••••" 
                  defaultValue="password123"
                  required 
                  className="mt-1" 
                />
              </div>
              <Button type="submit" className="w-full">
                Authenticate & Enter
              </Button>
            </form>
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
  );
}
