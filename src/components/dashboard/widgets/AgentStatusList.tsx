
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Agent, AgentStatus }from '@prisma/client';
import { Bot, CheckCircle, XCircle, PauseCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

type AgentStatusString = 'active' | 'idle' | 'processing' | 'paused' | 'error';

const statusConfig: Record<AgentStatusString, { icon: React.ElementType; color: string }> = {
  active: { icon: CheckCircle, color: 'text-accent' },
  processing: { icon: Loader2, color: 'text-primary' },
  idle: { icon: PauseCircle, color: 'text-yellow-400' },
  paused: { icon: PauseCircle, color: 'text-muted-foreground' },
  error: { icon: XCircle, color: 'text-destructive' },
};

interface AgentStatusListProps {
    agents: Agent[];
    isLoading: boolean;
}

export default function AgentStatusList({ agents, isLoading }: AgentStatusListProps) {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <div className="flex-grow space-y-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (agents.length === 0) {
            return <div className="text-center text-xs text-muted-foreground pt-4">No agents commissioned.</div>;
        }

        return (
            <div className="space-y-3">
                {agents.map((agent) => {
                    const status = agent.status as AgentStatusString;
                    const config = statusConfig[status] || statusConfig.idle;
                    const Icon = config.icon;
                    return (
                        <div key={agent.id} className="flex items-center gap-2">
                            <Icon className={cn('h-4 w-4 flex-shrink-0', config.color, status === 'processing' && 'animate-spin')} />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{agent.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{status}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
    
    return (
        <Card className="bg-background/50 h-full flex flex-col">
            <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Agent Muster
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-grow min-h-0">
                <ScrollArea className="h-full">
                   {renderContent()}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
