
'use client';

import React, { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { login } from '@/app/auth/actions';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : 'Enter Canvas'}
        </Button>
    )
}

export default function LoginPage() {
  const { toast } = useToast();
  const [state, dispatch] = useFormState(login, undefined);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline tracking-widest text-primary">
            ΛΞVON
          </CardTitle>
          <CardDescription>Enter the intelligent canvas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="agent@aevonos.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <LoginButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Need an account?{' '}
            <Link href="/register" className="underline text-primary">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
