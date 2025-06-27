import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { handleCommand, checkForAnomalies } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { LoomIcon } from '@/components/icons/LoomIcon';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { DrSyntaxIcon } from '@/components/icons/DrSyntaxIcon';
import { DrSyntaxApp } from '@/components/dr-syntax-app';
import { AegisReportApp } from '@/components/aegis-report-app';

export interface MicroApp {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  action?: () => void;
  content?: React.ReactNode;
}

interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  handleDragEnd: (event: DragEndEvent) => void;
  runAnomalyCheck: () => void;
  handleCommandSubmit: (command: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  apps: [
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
      action: () => get().runAnomalyCheck(),
    },
    {
      id: '5',
      title: 'Dr. Syntax',
      icon: DrSyntaxIcon,
      description: 'Get your content critiqued. Brutally.',
      content: <DrSyntaxApp />,
    },
  ],
  isLoading: false,

  handleDragEnd: (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      set((state) => {
        const oldIndex = state.apps.findIndex((item) => item.id === active.id);
        const newIndex = state.apps.findIndex((item) => item.id === over.id);
        return { apps: arrayMove(state.apps, oldIndex, newIndex) };
      });
    }
  },

  runAnomalyCheck: async () => {
    set({ isLoading: true });
    try {
      const result = await checkForAnomalies('User accessed financial_records.csv and project_phoenix.docx then initiated a data transfer to an external IP.');
      
      const reportApp: MicroApp = {
        id: `aegis-report-${Date.now()}`,
        title: 'Aegis Scan Report',
        icon: AegisIcon,
        description: `Scan from ${new Date().toLocaleTimeString()}`,
        content: <AegisReportApp result={result} />,
      };
      
      set(state => ({ apps: [...state.apps, reportApp] }));
      
      if (!result.isAnomalous) {
        useToast.getState().toast({
          title: 'Aegis Scan Complete',
          description: 'No anomalies detected in the simulated activity.',
        });
      }
    } catch (error) {
      console.error('Error running anomaly check:', error);
      useToast.getState().toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not complete Aegis scan.',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  handleCommandSubmit: async (command: string) => {
    if (!command) return;
    set({ isLoading: true });
    try {
      const suggestedCommands = await handleCommand(command);
      const newApps: MicroApp[] = suggestedCommands.map((cmd, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: cmd,
        icon: CrystalIcon,
        description: 'AI-suggested micro-app.',
        action: () => useToast.getState().toast({ title: 'Notice', description: `This is an AI-suggested app. Functionality to launch it would be built here.` }),
      }));
      set(state => ({
        apps: [...state.apps.filter(app => !app.id.startsWith('ai-')), ...newApps],
      }));
    } catch (error) {
      console.error('Error handling command:', error);
      useToast.getState().toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process command.',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
