
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Bot, CheckCircle, XCircle, PauseCircle, PlayCircle, Loader2, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Agent, AgentStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateAgentStatus, deleteAgent } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

const statusConfig: Record<AgentStatus, { icon: React.ElementType, color: string, text: string }> = {
  [AgentStatus.active]: { icon: CheckCircle, color: 'text-accent', text: 'Active' },
  [AgentStatus.processing]: { icon: Loader2, color: 'text-primary', text: 'Processing' },
  [AgentStatus.idle]: { icon: PauseCircle, color: 'text-yellow-400', text: 'Idle' },
  [AgentStatus.paused]: { icon: PauseCircle, color: 'text-muted-foreground', text: 'Paused' },
  [AgentStatus.error]: { icon: XCircle, color: 'text-destructive', text: 'Error' },
};

function AgentActions({ agent, onActionStart, onActionEnd }: { agent: Agent, onActionStart: () => void, onActionEnd: () => void }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = (status: AgentStatus) => {
        const formData = new FormData();
        formData.append('agentId', agent.id);
        formData.append('status', status);
        onActionStart();
        startTransition(async () => {
            const result = await updateAgentStatus(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
            onActionEnd();
        });
    }

    const handleDelete = () => {
        const formData = new FormData();
        formData.append('agentId', agent.id);
        onActionStart();
        startTransition(async () => {
            const result = await deleteAgent(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                setIsDeleteDialogOpen(false);
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
            onActionEnd();
        });
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}><MoreHorizontal /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleStatusUpdate(AgentStatus.active)}><PlayCircle className="mr-2"/>Activate</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleStatusUpdate(AgentStatus.paused)}><PauseCircle className="mr-2"/>Pause</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleStatusUpdate(AgentStatus.error)} className="text-destructive"><XCircle className="mr-2"/>Set to Error</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-destructive"><Trash2 className="mr-2"/>Decommission</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Decommission Agent?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the agent <strong className="text-foreground">{agent.name}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : 'Decommission'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


export default function SystemMonitoringTab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchAgents() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error('You do not have permission to view agents.');
        }
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgents();
  }, [refreshKey]);
  
  const handleAction = () => {
      // Trigger a re-fetch after an action is completed.
      setRefreshKey(prev => prev + 1);
  };


  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
        return <TableRow><TableCell colSpan={4} className="text-center text-destructive">{error}</TableCell></TableRow>;
    }
    
    if (agents.length === 0) {
        return <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No agents deployed.</TableCell></TableRow>;
    }

    return agents.map(agent => {
        const config = statusConfig[agent.status] || statusConfig.idle;
        const Icon = config.icon;
        return (
            <TableRow key={agent.id}>
                <TableCell>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">{agent.type}</div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn(config.color, 'border-current')}>
                        <Icon className={cn("mr-2", agent.status === 'processing' && 'animate-spin')} />{config.text}
                    </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(agent.createdAt))} ago
                </TableCell>
                <TableCell className="text-right">
                    <AgentActions agent={agent} onActionStart={() => {}} onActionEnd={handleAction} />
                </TableCell>
            </TableRow>
        )
    });
  }

  return (
    <div className="p-2">
      <div className="flex justify-end mb-4">
        <Button disabled><Bot className="mr-2" />Deploy Agent</Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Deployed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
