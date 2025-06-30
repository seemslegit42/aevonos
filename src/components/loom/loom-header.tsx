'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Play, Trash2, Loader2, ArrowLeft, Eye } from 'lucide-react';
import type { Workflow } from './types';
import type { UserRole } from '@prisma/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LoomHeaderProps {
  activeWorkflow: Workflow | null;
  onWorkflowNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isRunning: boolean;
  userRole: UserRole | null;
  isLoadingUser: boolean;
  isArchitectView: boolean;
  onToggleArchitectView: () => void;
}

export default function LoomHeader({ 
    activeWorkflow, 
    onWorkflowNameChange, 
    onSave,
    onRun,
    onDelete,
    isSaving,
    isRunning,
    userRole,
    isLoadingUser,
    isArchitectView,
    onToggleArchitectView,
}: LoomHeaderProps) {
  const canEdit = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canRun = userRole !== 'AUDITOR';
  const isAdmin = userRole === 'ADMIN';
  const isActionDisabled = isSaving || isRunning || isLoadingUser;

  return (
    <header className="flex-shrink-0 p-2 border-b border-foreground/20 flex items-center justify-between gap-4 h-16">
      <div className="flex items-center gap-2 md:gap-4">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/">
                        <ArrowLeft />
                      </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Return to Canvas</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Input
          value={activeWorkflow?.name || 'Untitled Workflow'}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          placeholder="Workflow Name"
          className="text-lg font-headline bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
          disabled={!canEdit || isArchitectView}
        />
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
           <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onToggleArchitectView}>
                          <Eye className={cn("h-5 w-5", isArchitectView && "text-primary")} />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>{isArchitectView ? "Return to Workflow Editor" : "Enter Architect View (Loom of Fates)"}</p>
                  </TooltipContent>
              </Tooltip>
           </TooltipProvider>
        )}
        {!isArchitectView && activeWorkflow?.id && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={onDelete} disabled={isActionDisabled || !canEdit}>
                            <Trash2 className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Delete</span>
                        </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>Delete this workflow</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="outline" size="sm" onClick={onRun} disabled={isActionDisabled || !canRun}>
                            {isRunning ? <Loader2 className="animate-spin h-4 w-4 md:mr-2" /> : <Play className="h-4 w-4 md:mr-2" />}
                            <span className="hidden md:inline">Run</span>
                        </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>Trigger a test run</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        {!isArchitectView && (
          <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                     <Button onClick={onSave} size="sm" disabled={isActionDisabled || !canEdit}>
                      {isSaving ? <Loader2 className="animate-spin h-4 w-4 md:mr-2" /> : <Save className="h-4 w-4 md:mr-2" />}
                      <span className="hidden md:inline">Save</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save workflow changes</p>
                  </TooltipContent>
              </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
