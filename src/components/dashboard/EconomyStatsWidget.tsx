
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CircleDollarSign, Bot, Users } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface EconomyStats {
    agents: number;
    members: number;
    credits: number;
}

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: number, label: string }) => (
    <div className="flex items-center gap-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
        <div>
            <p className="text-xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
)

export default function EconomyStatsWidget({ stats, isLoading }: { stats: EconomyStats, isLoading: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5"/>
            Workspace Pulse
        </CardTitle>
        <CardDescription>At-a-glance metrics for your domain.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        ) : (
            <>
                <StatItem icon={Bot} value={stats.agents} label="Agents Deployed" />
                <StatItem icon={Users} value={stats.members} label="Team Members" />
                <StatItem icon={CircleDollarSign} value={Math.floor(stats.credits)} label="ΞCredit Balance" />
            </>
        )}
      </CardContent>
    </Card>
  );
}
