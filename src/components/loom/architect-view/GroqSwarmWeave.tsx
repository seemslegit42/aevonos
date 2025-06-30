'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeepIcon } from '@/components/icons/BeepIcon';
import Image from 'next/image';

export default function GroqSwarmWeave() {
    return (
        <Card className="bg-background/50 border-primary/30 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BeepIcon className="w-6 h-6"/> The Weave</CardTitle>
                <CardDescription>A living visualization of the Groq Swarm dispatching agentic daemons.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4">
                 <Image src="https://placehold.co/600x400.png" alt="Abstract network visualization" width={600} height={400} className="w-full h-auto rounded-md opacity-50" data-ai-hint="network abstract data" />
                <p>Live Swarm visualization coming soon.</p>
            </CardContent>
        </Card>
    );
}
