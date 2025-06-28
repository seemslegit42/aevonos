'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FlowerOfLifeIcon } from '@/components/icons/FlowerOfLifeIcon';
import { motion } from 'framer-motion';

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
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <FlowerOfLifeIcon className="w-full h-full max-w-4xl max-h-4xl" />
      </div>
      <div className="relative w-full h-full flex items-center justify-center p-4">
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white/80">System Handle</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="architect@aevonos.com" 
                    defaultValue="architect@aevonos.com"
                    required 
                    className="mt-1 bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" 
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white/80">Encryption Key</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••••••••••" 
                    defaultValue="password123"
                    required 
                    className="mt-1 bg-white/5 border-white/20 placeholder:text-white/40 focus:border-primary" 
                  />
                </div>
                <Button type="submit" className="w-full bg-primary/80 backdrop-blur-sm border border-primary text-white hover:bg-primary">
                  Authenticate & Enter
                </Button>
              </form>
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
    </div>
  );
}
