'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GLOBAL ERROR]', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
       <head>
        <title>ΛΞVON OS - System Fault</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Lexend:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="absolute top-0 z-[-2] h-screen w-full bg-background">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="flex h-screen w-screen flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-headline text-destructive mb-4">A Fundamental Disturbance in the Aether</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                The OS has encountered a critical instability at its core and cannot proceed. The system's Architect has been notified. You may attempt to restore the connection, but a full system restart may be required.
            </p>
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={() => reset()}
                >
                    Attempt to Restore Connection
                </Button>
                 <Button onClick={() => window.location.href = '/'}>
                    Return to Canvas
                </Button>
            </div>
        </div>
      </body>
    </html>
  );
}
