
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { WorkflowRunStatus } from '@prisma/client';

export interface WorkflowRunSummary {
  id: string;
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt: string | null;
  workflow: {
    name: string;
  };
}

interface WorkflowRunHistoryProps {
  activeWorkflowId: string | null;
  triggerRefresh: number;
}

const statusConfig: Record<WorkflowRunStatus, { icon: React.ElementType, color: string, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [WorkflowRunStatus.pending]: { icon: Loader2, color: 'text-blue-400', badgeVariant: 'outline' },
  [WorkflowRunStatus.running]: { icon: Loader2, color: 'text-primary', badgeVariant: 'default' },
  [WorkflowRunStatus.completed]: { icon: CheckCircle, color: 'text-accent', badgeVariant: 'secondary' },
  [WorkflowRunStatus.failed]: { icon: XCircle, color: 'text-destructive', badgeVariant: 'destructive' },
  [WorkflowRunStatus.paused]: { icon: Play, color: 'text-yellow-400', badgeVariant: 'outline' },
};


function RunItem({ run }: { run: WorkflowRunSummary }) {
    const config = statusConfig[run.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
        <div className="p-2 rounded-md border border-foreground/15 hover:bg-accent/10 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                     <Icon className={cn("h-4 w-4", config.color, run.status === 'running' || run.status === 'pending' ? 'animate-spin' : '')} />
                     <div className='overflow-hidden'>
                        <p className="text-sm font-medium truncate" title={run.workflow.name}>{run.workflow.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate" title={run.id}>{run.id}</p>
                     </div>
                </div>
                <Badge variant={config.badgeVariant} className="capitalize text-xs">{run.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">
                Triggered {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
            </p>
        </div>
    );
}

export default function WorkflowRunHistory({ activeWorkflowId, triggerRefresh }: WorkflowRunHistoryProps) {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRuns = async () => {
    setIsLoading(true);
    try {
      const url = activeWorkflowId
        ? `/api/workflows/runs?workflowId=${activeWorkflowId}`
        : '/api/workflows/runs';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch runs');
      const data = await response.json();
      setRuns(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [activeWorkflowId, triggerRefresh]);


  const renderContent = () => {
    if (isLoading && runs.length === 0) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      );
    }
    if (runs.length === 0) {
        return (
            <div className="text-center text-muted-foreground text-sm pt-8">
                <p>No runs found.</p>
                <p className="text-xs">Trigger a workflow to see its history here.</p>
            </div>
        )
    }
    return (
      <div className="space-y-2">
        {runs.map(run => <RunItem key={run.id} run={run} />)}
      </div>
    );
  };

  return (
    <div className="h-full flex-shrink-0 bg-foreground/10 backdrop-blur-xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-lg text-foreground">Run History</h2>
        <Button variant="ghost" size="icon" onClick={fetchRuns} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        {activeWorkflowId ? 'Showing runs for selected workflow.' : 'Showing all recent runs.'}
      </p>
      <ScrollArea className="flex-grow -mr-4 pr-4">
        {renderContent()}
      </ScrollArea>
    </div>
  );
}
