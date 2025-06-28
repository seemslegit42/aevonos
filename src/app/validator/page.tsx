
import ValidatorTool from '@/components/validator/validator-tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ValidatorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-2xl bg-foreground/10 backdrop-blur-xl border-foreground/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline tracking-wider text-primary">Uncut Truth Engine</CardTitle>
          <CardDescription>"When suspicion becomes evidence, verify its soul. The hash doesn't lie."</CardDescription>
        </CardHeader>
        <CardContent>
          <ValidatorTool />
        </CardContent>
      </Card>
      <Link href="/" className="mt-6 text-sm text-muted-foreground hover:text-primary underline">
        Return to Canvas
      </Link>
    </div>
  );
}
