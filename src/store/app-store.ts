
import { create } from 'zustand';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { handleCommand } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { artifactManifests } from '@/config/artifacts';

import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { Contact } from '@/ai/tools/crm-schemas';
import type { UserCommandOutput, AgentReportSchema } from '@/ai/agents/beep-schemas';

// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'file-explorer' 
  | 'terminal' 
  | 'ai-suggestion'
  | 'aegis-control';

// Define the shape of a MicroApp instance
export interface MicroApp {
  id: string; // A unique instance ID
  type: MicroAppType;
  title: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  contentProps?: any; // Props for content components, e.g., report data
}

// A simple, non-react-based unique ID generator for new app instances.
let appInstanceId = 0;
const generateId = () => `app-instance-${appInstanceId++}-${Date.now()}`;

export interface BeepState extends UserCommandOutput {
  responseAudioUri?: string;
}

// Create a lookup map from the single source of truth for efficient access.
const manifestMap = new Map(artifactManifests.map(m => [m.id, m]));

export interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  beepOutput: BeepState | null;
  agentReportHandlerRegistry: Partial<Record<AgentReportSchema['agent'], (reportData: any) => void>>;
  handleDragEnd: (event: DragEndEvent) => void;
  handleResize: (appId: string, size: { width: number; height: number }) => void;
  handleCommandSubmit: (command: string) => void;
  triggerAppAction: (appId: string) => void;
  bringToFront: (appId: string) => void;
  upsertApp: (type: MicroAppType, props: Partial<Omit<MicroApp, 'type'>>) => MicroApp | undefined;
  closeApp: (appId: string) => void;
}

// A registry for app actions, decoupling them from the component.
const appActionRegistry: Record<string, (get: () => AppState, set: (fn: (state: AppState) => AppState) => void, app: MicroApp) => void> = {
  'ai-suggestion': (get, set, app) => {
    get().handleCommandSubmit(app.title);
  },
};


export const useAppStore = create<AppState>((set, get) => {
    
  let zIndexCounter = 10;

  const bringToFront = (appId: string) => {
    const newZIndex = ++zIndexCounter;
    set(state => ({
      apps: state.apps.map(app => 
        app.id === appId ? { ...app, zIndex: newZIndex } : app
      ),
    }));
  };

  const launchApp = (type: MicroAppType, overrides: Partial<Omit<MicroApp, 'type'>> = {}) => {
    const defaults = manifestMap.get(type);
    if (!defaults) {
        console.error(`[AppStore] No manifest found for app type: ${type}. Cannot launch.`);
        return undefined;
    }
    
    const existingAppsCount = get().apps.length;
    
    const newApp: MicroApp = {
        id: overrides.id || generateId(),
        type: type,
        title: overrides.title || defaults.name,
        description: overrides.description || defaults.description,
        contentProps: overrides.contentProps || {},
        position: overrides.position || { x: 40 + (existingAppsCount % 8) * 30, y: 40 + (existingAppsCount % 8) * 30 },
        size: overrides.size || defaults.defaultSize || { width: 360, height: 480 },
        zIndex: ++zIndexCounter,
    };
    
    set(state => ({
      apps: [...state.apps, newApp]
    }));
    
    bringToFront(newApp.id);
    return newApp;
  }
  
  const upsertApp = (type: MicroAppType, props: Partial<Omit<MicroApp, 'type'>>) => {
      if (!props.id) {
          return launchApp(type, props);
      }
      
      const existingApp = get().apps.find(a => a.id === props.id);
      
      if(existingApp) {
          set(state => ({
              apps: state.apps.map(app => 
                  app.id === props.id
                  ? { ...app, ...props, contentProps: {...existingApp.contentProps, ...props.contentProps}, zIndex: ++zIndexCounter }
                  : app
              )
          }));
          bringToFront(props.id);
          return get().apps.find(a => a.id === props.id);
      } else {
          return launchApp(type, props);
      }
  }

  const closeApp = (appId: string) => {
    set(state => ({
        apps: state.apps.filter(app => app.id !== appId)
    }));
  };
  
    // =================================================================
    // AGENT REPORT HANDLER REGISTRY
    // This replaces the giant switch statement for processing agent reports.
    // Each handler defines how the UI should react to a specific agent's output.
    // =================================================================
    const agentReportHandlerRegistry: AppState['agentReportHandlerRegistry'] = {
        'aegis': (report) => {
            launchApp('aegis-control', { contentProps: { ...report } });
            if (report.isAnomalous) {
                useToast.getState().toast({ title: 'Aegis Alert', description: report.anomalyExplanation, variant: 'destructive' });
                if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
            }
        },
    };

  const processAgentReports = (reports: UserCommandOutput['agentReports']) => {
    if (!reports) return;
    for (const report of reports) {
      const handler = agentReportHandlerRegistry[report.agent];
      if (handler) {
        handler(report.report as any);
      } else {
        console.warn(`[AppStore] No handler registered for agent report: ${report.agent}`);
      }
    }
  };

  return {
    apps: [],
    isLoading: false,
    beepOutput: null,
    agentReportHandlerRegistry,
    bringToFront,
    upsertApp,
    closeApp,

    handleResize: (appId: string, size: { width: number; height: number }) => {
        set(state => ({
            apps: state.apps.map(app => 
            app.id === appId ? { ...app, size } : app
            ),
        }));
    },

    handleDragEnd: (event: DragEndEvent) => {
      const { active, delta } = event;
      set(state => ({
        apps: state.apps.map(app => 
          app.id === active.id 
            ? { ...app, position: { x: app.position.x + delta.x, y: app.position.y + delta.y } }
            : app
        )
      }));
      bringToFront(active.id as string);
    },

    triggerAppAction: (appId: string) => {
      const app = get().apps.find(a => a.id === appId);
      if (!app) return;
      const action = appActionRegistry[app.type];
      if (action) {
        action(get, set, app);
      }
    },

    handleCommandSubmit: async (command: string) => {
      if (!command) return;
      
      set({ isLoading: true, beepOutput: null });
      
      set(state => ({
          apps: state.apps.filter(app => app.type !== 'ai-suggestion')
      }));

      try {
        const result = await handleCommand(command);
        
        set({ beepOutput: result });
        
        const { toast } = useToast.getState();
        if (result.responseText && !result.responseText.includes('insufficient credits')) {
            toast({ title: 'BEEP', description: result.responseText });
        }

        processAgentReports(result.agentReports);

        result.appsToLaunch.forEach(appInfo => {
          const defaults = manifestMap.get(appInfo.type);
          upsertApp(appInfo.type, {
            id: `singleton-${appInfo.type}`, // Use a consistent ID to make agent apps singletons
            title: appInfo.title || defaults?.name,
            description: appInfo.description || defaults?.description,
          });
        });

        result.suggestedCommands.forEach(cmd => {
            const defaults = manifestMap.get('ai-suggestion');
            launchApp('ai-suggestion', {
                title: cmd,
                description: defaults?.description || 'Click to execute',
            });
        });

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
  };
});
