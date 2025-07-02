
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { WorkflowRunStatus, type WorkflowRun as PrismaWorkflowRun } from '@prisma/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface WorkflowRunSummary {
  id: string;
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt: string | null;
  workflow: {
    name: string;
  };
}

interface FullWorkflowRun extends PrismaWorkflowRun {
    log?: any;
}

const statusConfig: Record<WorkflowRunStatus, { icon: React.ElementType, color: string, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [WorkflowRunStatus.pending]: { icon: Loader2, color: 'text-blue-400', badgeVariant: 'outline' },
  [WorkflowRunStatus.running]: { icon: Loader2, color: 'text-primary', badgeVariant: 'default' },
  [WorkflowRunStatus.completed]: { icon: CheckCircle, color: 'text-accent', badgeVariant: 'secondary' },
  [WorkflowRunStatus.failed]: { icon: XCircle, color: 'text-destructive', badgeVariant: 'destructive' },
  [WorkflowRunStatus.paused]: { icon: Play, color: 'text-yellow-400', badgeVariant: 'outline' },
};


function RunDetails({ runId, workflowName }: { runId: string, workflowName: string }) {
    const [details, setDetails] = useState<FullWorkflowRun | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDetails() {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/workflows/runs/${runId}`);
                if (!response.ok) throw new Error("Failed to fetch run details.");
                const data = await response.json();
                setDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetails();
    }, [runId]);

    const renderJsonPayload = (title: string, data: any) => (
        <div>
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <pre className="text-xs bg-muted/50 p-2 rounded-md max-h-40 overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
    
    const renderLogStep = (step: any, index: number) => {
        return (
            <AccordionItem value={`step-${index}`} key={index}>
                <AccordionTrigger className="text-xs hover:no-underline">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold">{index + 1}</div>
                        <span className="font-semibold">{step.label}</span>
                        <span className="text-muted-foreground font-mono text-xs">({step.type})</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <pre className="text-xs bg-muted/50 p-2 rounded-md max-h-48 overflow-auto">
                        {JSON.stringify(step.result, null, 2)}
                    </pre>
                </AccordionContent>
            </AccordionItem>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!details) return null;

    return (
        <div className="space-y-4">
            {details.triggerPayload && renderJsonPayload("Trigger Payload", details.triggerPayload)}

            {details.log && Array.isArray(details.log) && details.log.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-1">Execution Log</h4>
                    <Accordion type="single" collapsible className="w-full">
                       {details.log.map(renderLogStep)}
                    </Accordion>
                </div>
            )}
            
            {details.output && renderJsonPayload("Final Output", details.output)}
        </div>
    );
}

function RunItem({ run }: { run: WorkflowRunSummary }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const config = statusConfig[run.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <button
                    className="w-full text-left p-2 rounded-md border border-foreground/15 hover:bg-accent/10 transition-colors"
                >
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
                </button>
            </DialogTrigger>
            {isDialogOpen && (
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Run Details: {run.workflow.name}</DialogTitle>
                        <DialogDescription>
                            <span className='font-mono text-xs'>{run.id}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <RunDetails runId={run.id} workflowName={run.workflow.name} />
                </DialogContent>
            )}
        </Dialog>
    );
}

interface WorkflowRunHistoryProps {
  activeWorkflowId: string | null;
  triggerRefresh: number;
}

export default function WorkflowRunHistory({ activeWorkflowId, triggerRefresh }: WorkflowRunHistoryProps) {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
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
  }, [activeWorkflowId]);

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [activeWorkflowId, triggerRefresh, fetchRuns]);


  const renderContent = () => {
    if (isLoading && runs.length === 0) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
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

    