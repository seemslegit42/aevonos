
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BeepIcon } from '@/components/icons/BeepIcon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Invalid credentials. Please try again.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Demo user login handler
    const handleDemoLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: 'architect@aevonos.com',
                password: 'password123',
            });
            if (result?.error) {
                setError('Demo user login failed. Please ensure the database is seeded.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
             setError('An unexpected error occurred during demo login.');
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <BeepIcon className="w-16 h-16 mx-auto text-primary" />
          <CardTitle className="text-2xl font-headline text-primary">Invocation Chamber</CardTitle>
          <CardDescription>Your will, made manifest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="architect@aevonos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Sign In
            </Button>
          </form>
           <Button variant="secondary" className="w-full mt-2" onClick={handleDemoLogin} disabled={isLoading}>
              Sign In as The Architect
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
