
'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Play, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import type { Workflow } from '@/app/loom/page';

interface LoomHeaderProps {
  activeWorkflow: Workflow | null;
  onWorkflowNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isRunning: boolean;
}

export default function LoomHeader({ 
    activeWorkflow, 
    onWorkflowNameChange, 
    onSave,
    onRun,
    onDelete,
    isSaving,
    isRunning
}: LoomHeaderProps) {
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
        />
      </div>
      <div className="flex items-center gap-2">
        {activeWorkflow?.id && (
            <>
                <Button variant="outline" onClick={onDelete}>
                    <Trash2 />
                    <span className="hidden md:inline">Delete</span>
                </Button>
                <Button variant="outline" onClick={onRun} disabled={isRunning || isSaving}>
                    {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
                    <span className="hidden md:inline">Run</span>
                </Button>
            </>
        )}
        <Button onClick={onSave} disabled={isSaving || isRunning}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          <span className="hidden md:inline">Save</span>
        </Button>
      </div>
    </header>
  );
}
