'use client';

import React, { useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import TopBar from '@/components/layout/top-bar';
import MicroAppGrid from '@/components/micro-app-grid';
import { handleCommand, checkForAnomalies } from '@/app/actions';

import { LoomIcon } from '@/components/icons/LoomIcon';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { DrSyntaxIcon } from '@/components/icons/DrSyntaxIcon';
import { DrSyntaxApp } from '@/components/dr-syntax-app';
import { AegisReportApp } from '@/components/aegis-report-app';

import { useToast } from '@/hooks/use-toast';

export interface MicroApp {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  action?: () => void;
  content?: React.ReactNode;
}

export default function Home() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [apps, setApps] = useState<MicroApp[]>([
    {
      id: '1',
      title: 'Loom Studio',
      icon: LoomIcon,
      description: 'Visual command center for AI workflows.',
    },
    {
      id: '2',
      title: 'File Explorer',
      icon: FileExplorerIcon,
      description: 'Access and manage your files.',
    },
    {
      id: '3',
      title: 'Terminal',
      icon: TerminalIcon,
      description: 'Direct command-line access.',
    },
    {
      id: '4',
      title: 'Aegis Control',
      icon: AegisIcon,
      description: 'Run a sample security scan.',
      action: runAnomalyCheck,
    },
    {
      id: '5',
      title: 'Dr. Syntax',
      icon: DrSyntaxIcon,
      description: 'Get your content critiqued. Brutally.',
      content: <DrSyntaxApp />,
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setApps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  function runAnomalyCheck() {
    startTransition(async () => {
      const result = await checkForAnomalies('User accessed financial_records.csv and project_phoenix.docx then initiated a data transfer to an external IP.');
      
      const reportApp: MicroApp = {
        id: `aegis-report-${Date.now()}`,
        title: 'Aegis Scan Report',
        icon: AegisIcon,
        description: `Scan from ${new Date().toLocaleTimeString()}`,
        content: <AegisReportApp result={result} />,
      };
      
      setApps(prev => [...prev, reportApp]);
      
      if (!result.isAnomalous) {
        toast({
          title: 'Aegis Scan Complete',
          description: 'No anomalies detected in the simulated activity.',
        });
      }
    });
  };

  const handleCommandSubmit = (command: string) => {
    if (!command) return;
    startTransition(async () => {
      const suggestedCommands = await handleCommand(command);
      const newApps: MicroApp[] = suggestedCommands.map((cmd, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: cmd,
        icon: CrystalIcon,
        description: 'AI-suggested micro-app.',
        action: () => toast({ title: 'Notice', description: `This is an AI-suggested app. Functionality to launch it would be built here.` }),
      }));
      setApps(prev => [...prev.filter(app => !app.id.startsWith('ai-')), ...newApps]);
    });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar onCommandSubmit={handleCommandSubmit} isLoading={isPending} />
      <div className="flex-grow p-4 rounded-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={apps.map((app) => app.id)} strategy={rectSortingStrategy}>
            <MicroAppGrid apps={apps} />
          </SortableContext>
        </DndContext>
      </div>
       <footer className="text-center text-xs text-muted-foreground">
        <p>ΛΞVON OS - All rights reserved.</p>
      </footer>
    </div>
  );
}
