
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowSummary {
  uuid: string;
  name: string;
  updatedAt: string;
}

interface WorkflowListProps {
  onSelectWorkflow: (id: string | null) => void;
  activeWorkflowId: string | null;
  triggerRefresh: number;
}

export default function WorkflowList({ onSelectWorkflow, activeWorkflowId, triggerRefresh }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflows() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        setWorkflows(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkflows();
  }, [triggerRefresh]);

  return (
    <div className="w-64 flex-shrink-0 bg-foreground/10 backdrop-blur-xl border-r border-foreground/20 p-4 flex flex-col gap-4">
      <h2 className="font-headline text-lg text-foreground">Workflows</h2>
      <Button variant="outline" onClick={() => onSelectWorkflow(null)}>
        <PlusCircle className="mr-2" />
        New Workflow
      </Button>
      <ScrollArea className="flex-grow -mr-4 pr-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {workflows.map(wf => (
              <button
                key={wf.uuid}
                onClick={() => onSelectWorkflow(wf.uuid)}
                className={cn(
                  'w-full text-left p-2 rounded-md transition-colors flex items-center gap-3',
                  activeWorkflowId === wf.uuid ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Workflow className="w-5 h-5 flex-shrink-0" />
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold truncate text-sm">{wf.name}</p>
                    <p className="text-xs opacity-70">
                        Updated {new Date(wf.updatedAt).toLocaleDateString()}
                    </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
