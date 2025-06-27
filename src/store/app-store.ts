import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

import { handleCommand, checkForAnomalies } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'loom-studio' 
  | 'file-explorer' 
  | 'terminal' 
  | 'aegis-control' 
  | 'dr-syntax' 
  | 'aegis-report'
  | 'ai-suggestion';

// Define the shape of a MicroApp instance
export interface MicroApp {
  id: string; // A unique instance ID
  type: MicroAppType;
  title: string;
  description: string;
  contentProps?: any; // Props for content components, e.g., report data
}

interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  handleDragEnd: (event: DragEndEvent) => void;
  runAnomalyCheck: () => void;
  handleCommandSubmit: (command: string) => void;
  triggerAppAction: (appId: string) => void;
}

// A registry for app actions, decoupling them from the component.
const appActionRegistry: Record<string, (get: () => AppState, set: (fn: (state: AppState) => AppState) => void) => void> = {
  'aegis-control': (get) => get().runAnomalyCheck(),
  'ai-suggestion': () => useToast.getState().toast({ title: 'Notice', description: `This is an AI-suggested app. Functionality to launch it would be built here.` }),
};


export const useAppStore = create<AppState>((set, get) => ({
  apps: [
    {
      id: '1',
      type: 'loom-studio',
      title: 'Loom Studio',
      description: 'Visual command center for AI workflows.',
    },
    {
      id: '2',
      type: 'file-explorer',
      title: 'File Explorer',
      description: 'Access and manage your files.',
    },
    {
      id: '3',
      type: 'terminal',
      title: 'Terminal',
      description: 'Direct command-line access.',
    },
    {
      id: '4',
      type: 'aegis-control',
      title: 'Aegis Control',
      description: 'Run a sample security scan.',
    },
    {
      id: '5',
      type: 'dr-syntax',
      title: 'Dr. Syntax',
      description: 'Get your content critiqued. Brutally.',
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

  triggerAppAction: (appId: string) => {
    const app = get().apps.find(a => a.id === appId);
    if (!app) return;
    const action = appActionRegistry[app.type];
    if (action) {
      action(get, set);
    }
  },

  runAnomalyCheck: async () => {
    set({ isLoading: true });
    try {
      const result = await checkForAnomalies('User accessed financial_records.csv and project_phoenix.docx then initiated a data transfer to an external IP.');
      
      const reportApp: MicroApp = {
        id: `aegis-report-${Date.now()}`,
        type: 'aegis-report',
        title: 'Aegis Scan Report',
        description: `Scan from ${new Date().toLocaleTimeString()}`,
        contentProps: { result },
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
        type: 'ai-suggestion',
        title: cmd,
        description: 'AI-suggested micro-app.',
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
