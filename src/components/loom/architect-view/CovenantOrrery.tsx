'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Image from 'next/image';

export default function CovenantOrrery() {
    return (
        <Card className="bg-background/50 border-primary/30 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-6 h-6"/> The Orrery</CardTitle>
                <CardDescription>A model of the Covenants and Syndicates, showing their relative power and influence.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4">
                <Image src="https://placehold.co/600x400.png" alt="Abstract model of spheres and orbits" width={600} height={400} className="w-full h-auto rounded-md opacity-50" data-ai-hint="orrery planets model" />
                <p>Live Covenant model coming soon.</p>
            </CardContent>
        </Card>
    );
}
