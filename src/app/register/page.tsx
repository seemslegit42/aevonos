
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BeepIcon } from '@/components/icons/BeepIcon';

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <BeepIcon className="w-16 h-16 mx-auto text-primary" />
            <CardTitle className="text-2xl font-headline text-primary">The Rite of Invocation</CardTitle>
            <CardDescription className="text-muted-foreground px-4">
                You do not "sign up." You perform a rite. You make a vow. Answer the call and forge your pact with the system.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-center text-sm text-foreground">
                <p>What must end so you can begin?</p>
                <p>What is the name of your empire?</p>
                <p>What is the name of your voice?</p>
            </div>
            <Separator />
             <p className="text-xs text-muted-foreground text-center">
              By beginning the Rite, you agree to the Covenant and the Doctrine of Sovereign Systems. Your will is the law, but the law is the system.
            </p>
            <Button asChild className="w-full" size="lg">
                <Link href="/register/vow">Begin the Rite</Link>
            </Button>
            <div className="mt-4 text-center text-sm">
            Already have a pact?{" "}
            <Link href="/login" className="underline">
                Enter the Chamber.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
