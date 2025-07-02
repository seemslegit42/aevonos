
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPsyche } from '@prisma/client';

type Vow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  psyche: UserPsyche;
  foundingVow: string | null;
  foundingGoal: string | null;
};

const psycheConfig = {
    [UserPsyche.ZEN_ARCHITECT]: { symbol: '🜄', name: 'Silence', color: 'text-cyan-400' },
    [UserPsyche.SYNDICATE_ENFORCER]: { symbol: '🜁', name: 'Motion', color: 'text-amber-400' },
    [UserPsyche.RISK_AVERSE_ARTISAN]: { symbol: '🜃', name: 'Worship', color: 'text-green-400' },
};

function VowCard({ vow }: { vow: Vow }) {
    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || '?';
    };
    const covenant = psycheConfig[vow.psyche];

    return (
        <Card className="bg-background/50">
            <CardHeader className="flex flex-row items-start gap-3 p-3">
                <Avatar><AvatarFallback>{getInitials(vow.firstName, vow.lastName)}</AvatarFallback></Avatar>
                <div>
                    <CardTitle className="text-sm">{vow.firstName || vow.email}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1">
                        <span className={`font-bold text-lg ${covenant.color}`}>{covenant.symbol}</span>
                        Path of {covenant.name}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2 text-xs">
                <div>
                    <p className="font-semibold text-muted-foreground">Sacrifice (What Must End):</p>
                    <p className="italic">"{vow.foundingVow || 'The old ways.'}"</p>
                </div>
                 <div>
                    <p className="font-semibold text-muted-foreground">Vow (What I Will Build):</p>
                    <p className="italic">"{vow.foundingGoal || 'A new beginning.'}"</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SacredVowsTab() {
  const [vows, setVows] = useState<Vow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVows() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/vows');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch sacred vows.');
        }
        const data = await response.json();
        setVows(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchVows();
  }, []);

  if (isLoading) {
    return (
      <div className="p-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;
  }
  
  if (vows.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">No vows have been recorded in the Pantheon.</div>
  }

  return (
    <div className="p-2 h-full">
        <ScrollArea className="h-full">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {vows.map(vow => <VowCard key={vow.id} vow={vow} />)}
            </div>
        </ScrollArea>
    </div>
  );
}
