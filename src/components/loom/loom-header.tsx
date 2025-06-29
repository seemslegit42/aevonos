
'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Play, Trash2, Loader2, ArrowLeft, Plus } from 'lucide-react';
import type { Workflow } from './types';
import type { UserRole } from '@prisma/client';

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
  onAddNodeClick?: () => void;
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
    onAddNodeClick,
}: LoomHeaderProps) {
  const canEdit = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canRun = userRole !== 'AUDITOR';
  const isActionDisabled = isSaving || isRunning || isLoadingUser;

  return (
    <header className="flex-shrink-0 p-2 border-b border-foreground/20 flex items-center justify-between gap-4 h-16">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
        <Input
          value={activeWorkflow?.name || 'Untitled Workflow'}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          placeholder="Workflow Name"
          className="text-lg font-headline bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
          disabled={!canEdit}
        />
      </div>
      <div className="flex items-center gap-2">
        {onAddNodeClick && (
          <Button variant="outline" size="icon" className="md:hidden" onClick={onAddNodeClick}>
            <Plus />
          </Button>
        )}
        {activeWorkflow?.id && (
            <>
                <Button variant="outline" size="sm" onClick={onDelete} disabled={isActionDisabled || !canEdit}>
                    <Trash2 className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Delete</span>
                </Button>
                <Button variant="outline" size="sm" onClick={onRun} disabled={isActionDisabled || !canRun}>
                    {isRunning ? <Loader2 className="animate-spin h-4 w-4 md:mr-2" /> : <Play className="h-4 w-4 md:mr-2" />}
                    <span className="hidden md:inline">Run</span>
                </Button>
            </>
        )}
        <Button onClick={onSave} size="sm" disabled={isActionDisabled || !canEdit}>
          {isSaving ? <Loader2 className="animate-spin h-4 w-4 md:mr-2" /> : <Save className="h-4 w-4 md:mr-2" />}
          <span className="hidden md:inline">Save</span>
        </Button>
      </div>
    </header>
  );
}
