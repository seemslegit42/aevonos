
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline text-primary">Invocation Chamber</CardTitle>
          <CardDescription>Your will, made manifest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="architect@aevonos.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" disabled />
          </div>
          <Button asChild className="w-full">
            <Link href="/">Sign In as The Architect</Link>
          </Button>
          <div className="mt-4 text-center text-sm">
            Need an OS?{" "}
            <Link href="/register" className="underline">
              Perform the Rite.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
