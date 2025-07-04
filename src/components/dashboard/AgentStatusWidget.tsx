
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { type Agent, AgentStatus } from '@prisma/client';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const statusConfig: Record<AgentStatus, { color: string; text: string }> = {
    [AgentStatus.active]: { color: 'bg-accent', text: 'Active' },
    [AgentStatus.processing]: { color: 'bg-primary animate-pulse', text: 'Processing' },
    [AgentStatus.idle]: { color: 'bg-yellow-400', text: 'Idle' },
    [AgentStatus.paused]: { color: 'bg-muted-foreground', text: 'Paused' },
    [AgentStatus.error]: { color: 'bg-destructive', text: 'Error' },
};

function AgentItem({ agent }: { agent: Agent }) {
    const config = statusConfig[agent.status] || statusConfig.idle;
    return (
        <div className="flex items-center gap-3 py-2 px-1">
            <div className="flex-shrink-0">
                <div className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
            </div>
            <div className="flex-grow text-sm font-medium truncate">{agent.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{agent.type}</div>
        </div>
    )
}

function AgentStatusSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-1">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-4 flex-grow" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    );
}

export default function AgentStatusWidget({ agents, isLoading }: { agents: Agent[], isLoading: boolean }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5"/>
            Agent Muster
        </CardTitle>
        <CardDescription>Live status of your deployed daemons.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
        <ScrollArea className="h-full">
            {isLoading && agents.length === 0 ? <AgentStatusSkeleton /> : (
                <div className="divide-y divide-border/20">
                    {agents.map(agent => <AgentItem key={agent.id} agent={agent} />)}
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
