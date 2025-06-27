import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

import { processUserCommand } from '@/ai/agents/beep';
import { recallSessionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { checkForAnomalies } from '@/app/actions';

// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'loom-studio' 
  | 'file-explorer' 
  | 'terminal' 
  | 'aegis-control' 
  | 'dr-syntax' 
  | 'aegis-report'
  | 'dr-syntax-report'
  | 'ai-suggestion'
  | 'echo-control'
  | 'echo-recall';

// Define the shape of a MicroApp instance
export interface MicroApp {
  id: string; // A unique instance ID
  type: MicroAppType;
  title: string;
  description: string;
  contentProps?: any; // Props for content components, e.g., report data
}

const defaultAppDetails: Record<MicroAppType, Omit<MicroApp, 'id' | 'contentProps'>> = {
  'loom-studio': { type: 'loom-studio', title: 'Loom Studio', description: 'Visual command center for AI workflows.' },
  'file-explorer': { type: 'file-explorer', title: 'File Explorer', description: 'Access and manage your files.' },
  'terminal': { type: 'terminal', title: 'Terminal', description: 'Direct command-line access.' },
  'aegis-control': { type: 'aegis-control', title: 'Aegis Control', description: 'Run a sample security scan.' },
  'dr-syntax': { type: 'dr-syntax', title: 'Dr. Syntax', description: 'Get your content critiqued. Brutally.' },
  'aegis-report': { type: 'aegis-report', title: 'Aegis Scan Report', description: 'Security scan result.'},
  'dr-syntax-report': { type: 'dr-syntax-report', title: 'Dr. Syntax Report', description: 'A critique from the doctor.' },
  'ai-suggestion': { type: 'ai-suggestion', title: 'AI Suggestion', description: 'Click to execute this command.' },
  'echo-control': { type: 'echo-control', title: 'Recall Session', description: "Click to have Echo summarize the last session's activity." },
  'echo-recall': { type: 'echo-recall', title: 'Session Recall', description: 'A summary of your last session.'},
};


interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  handleDragEnd: (event: DragEndEvent) => void;
  runAnomalyCheck: () => void;
  handleCommandSubmit: (command: string) => void;
  triggerAppAction: (appId: string) => void;
  handleSessionRecall: () => void;
}

// A registry for app actions, decoupling them from the component.
const appActionRegistry: Record<string, (get: () => AppState, set: (fn: (state: AppState) => AppState) => void, app: MicroApp) => void> = {
  'aegis-control': (get) => get().runAnomalyCheck(),
  'echo-control': (get) => get().handleSessionRecall(),
  'ai-suggestion': (get, set, app) => {
    get().handleCommandSubmit(app.title);
  },
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
      type: 'echo-control',
      title: 'Recall Session',
      description: "Click to have Echo summarize the last session's activity.",
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
      action(get, set, app);
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

  handleSessionRecall: async () => {
    set({ isLoading: true });
    try {
      // Dummy data for now. In a real scenario, this would come from a persisted log.
      const dummyActivity = `User opened File Explorer.
User ran 'critique this copy' in Dr. Syntax.
User ran an Aegis scan at 14:32.
User launched Loom Studio to inspect 'Client Onboarding' workflow.`;

      const result = await recallSessionAction({ sessionActivity: dummyActivity });
      
      const recallApp: MicroApp = {
        id: `echo-recall-${Date.now()}`,
        type: 'echo-recall',
        title: 'Echo: Session Recall',
        description: `Recall from ${new Date().toLocaleTimeString()}`,
        contentProps: { result },
      };
      
      set(state => ({ apps: [...state.apps, recallApp] }));
      
      useToast.getState().toast({
        title: 'Echo has remembered.',
        description: 'A summary of your last session is now on your Canvas.',
      });
    } catch (error) {
      console.error('Error recalling session:', error);
      useToast.getState().toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Echo could not recall the session.',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  handleCommandSubmit: async (command: string) => {
    if (!command) return;
    set({ isLoading: true });
    
    set(state => ({
        apps: state.apps.filter(app => app.type !== 'ai-suggestion')
    }));

    try {
      const result = await processUserCommand({ userCommand: command });
      
      const { toast } = useToast.getState();
      if (result.responseText) {
          toast({ title: 'BEEP', description: result.responseText });
      }

      const appsToLaunch: MicroApp[] = result.appsToLaunch.map((appInfo) => {
        const defaults = defaultAppDetails[appInfo.type];
        return {
          id: `${appInfo.type}-${Date.now()}`,
          type: appInfo.type,
          title: appInfo.title || defaults.title,
          description: appInfo.description || defaults.description,
        };
      });

      // Handle agent reports by creating report apps
      const reportApps: MicroApp[] = [];
      if (result.agentReports) {
        for (const agentReport of result.agentReports) {
          if (agentReport.agent === 'dr-syntax') {
            reportApps.push({
              id: `dr-syntax-report-${Date.now()}`,
              type: 'dr-syntax-report',
              title: defaultAppDetails['dr-syntax-report'].title,
              description: `Critique from ${new Date().toLocaleTimeString()}`,
              contentProps: { result: agentReport.report },
            });
          }
        }
      }

      const suggestionApps: MicroApp[] = result.suggestedCommands.map((cmd, index) => ({
        id: `ai-${Date.now()}-${index}`,
        type: 'ai-suggestion',
        title: cmd,
        description: defaultAppDetails['ai-suggestion'].description,
      }));

      set(state => ({
        apps: [...state.apps, ...appsToLaunch, ...reportApps, ...suggestionApps],
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
