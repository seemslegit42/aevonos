
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, Trophy, Users, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPsyche } from '@prisma/client';

type CovenantName = 'motion' | 'worship' | 'silence';
type Member = { id: string; email: string; firstName: string | null; lastName: string | null; };
type LeaderboardEntry = Member & { vas: number };

const COVENANT_CONFIG: Record<CovenantName, { name: string; symbol: string; psyche: UserPsyche; }> = {
    motion: { name: "Covenant of Motion", symbol: '🜁', psyche: UserPsyche.SYNDICATE_ENFORCER },
    worship: { name: "Covenant of Worship", symbol: '🜃', psyche: UserPsyche.RISK_AVERSE_ARTISAN },
    silence: { name: "Covenant of Silence", symbol: '🜄', psyche: UserPsyche.ZEN_ARCHITECT },
};

function CovenantColumn({ covenantName }: { covenantName: CovenantName }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [membersRes, leaderboardRes] = await Promise.all([
                    fetch(`/api/covenants/${covenantName}/members`),
                    fetch(`/api/covenants/${covenantName}/leaderboard`),
                ]);
                if (!membersRes.ok || !leaderboardRes.ok) throw new Error(`Failed to fetch data for ${covenantName}.`);
                const membersData = await membersRes.json();
                const leaderboardData = await leaderboardRes.json();
                setMembers(membersData);
                setLeaderboard(leaderboardData);
            } catch (e) {
                setError(e instanceof Error ? e.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [covenantName]);
    
    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || '?';
    };

    if (isLoading) {
        return (
            <Card className="bg-background/50 h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }

    return (
        <Card className="bg-background/50 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{COVENANT_CONFIG[covenantName].symbol}</span>
                    <span>{COVENANT_CONFIG[covenantName].name}</span>
                </CardTitle>
                <CardDescription>{members.length} Member(s)</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4 min-h-0">
                <div className="flex-1 min-h-0">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Trophy className="w-4 h-4"/> Leaderboard</h4>
                    <ScrollArea className="h-48">
                        <div className="space-y-2 pr-4">
                            {leaderboard.map((entry, index) => (
                                <div key={entry.id} className="flex items-center gap-2 text-sm">
                                    <span className="font-bold w-6 text-center">{index + 1}.</span>
                                    <Avatar className="h-6 w-6 text-xs"><AvatarFallback>{getInitials(entry.firstName, entry.lastName)}</AvatarFallback></Avatar>
                                    <span className="flex-grow truncate">{entry.firstName || entry.email}</span>
                                    <span className="font-mono font-bold text-primary">{entry.vas}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                 <Separator />
                <div className="flex-1 min-h-0">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Member Roster</h4>
                    <ScrollArea className="h-48">
                        <div className="space-y-2 pr-4">
                            {members.map(member => (
                                 <div key={member.id} className="flex items-center gap-2 text-sm">
                                    <Avatar className="h-6 w-6 text-xs"><AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback></Avatar>
                                    <span className="flex-grow truncate">{member.firstName || member.email}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}


export default function CovenantsTab() {
  return (
    <div className="p-2 h-full">
        <div className="grid md:grid-cols-3 gap-4 h-full">
            <CovenantColumn covenantName="motion" />
            <CovenantColumn covenantName="worship" />
            <CovenantColumn covenantName="silence" />
        </div>
    </div>
  );
}
