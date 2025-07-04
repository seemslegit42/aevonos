
'use client';

import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { produce } from 'immer';
import { generateSpeech } from '@/ai/flows/tts-flow';
import { artifactManifests } from '@/config/artifacts';
import { toast } from '@/hooks/use-toast';
import { agentReportHandlers } from './agent-report-handler';
import type { AgentReport, UserCommandOutput } from '@/ai/agents/beep-schemas';


enableMapSet();

export type MicroAppType =
  | 'terminal'
  | 'ai-suggestion'
  | 'aegis-control'
  | 'dr-syntax'
  | 'contact-list'
  | 'contact-editor'
  | 'usage-monitor'
  | 'top-up'
  | 'user-profile-settings'
  | 'workspace-settings'
  | 'armory'
  | 'aegis-threatscope'
  | 'aegis-command'
  | 'file-explorer'
  | 'loom'
  | 'winston-wolfe'
  | 'kif-kroker'
  | 'vandelay'
  | 'rolodex'
  | 'jroc-business-kit'
  | 'lahey-surveillance'
  | 'foremanator'
  | 'sterileish'
  | 'paper-trail'
  | 'barbara'
  | 'auditor-generalissimo'
  | 'beep-wingman'
  | 'kendra'
  | 'orphean-oracle'
  | 'project-lumbergh'
  | 'lucille-bluth'
  | 'pam-poovey-onboarding'
  | 'stonks-bot'
  | 'reno-mode'
  | 'patrickt-app'
  | 'vin-diesel'
  | 'inventory-daemon'
  | 'obelisk-marketplace'
  | 'proxy-agent'
  | 'admin-console'
  | 'infidelity-radar'
  | 'ritual-quests'
  | 'howards-sidekick'
  | 'sisyphus-ascent'
  | 'merchant-of-cabbage'
  | 'command-and-cauldron'
  | 'integration-nexus'
  | 'validator';

export interface MicroApp {
  id: string;
  type: MicroAppType;
  title: string;
  description?: string;
  position: { x: number; y: number };
  size: { width: number, height: number };
  zIndex: number;
  contentProps?: Record<string, any>;
}

export interface AppStore {
  apps: MicroApp[];
  activeAppId: string | null;
  nextZIndex: number;
  isLoading: boolean;
  beepOutput: UserCommandOutput | null;
  upsertApp: (type: MicroAppType, partialApp: Partial<MicroApp>) => void;
  closeApp: (id: string) => void;
  bringToFront: (id: string) => void;
  handleResize: (id: string, size: { width: number; height: number }) => void;
  handleDragEnd: (event: any) => void;
  handleCommandSubmit: (command: string, activeAppContext?: string) => Promise<void>;
  triggerAppAction: (id: string) => void;
}

const getAppDefaultSize = (type: MicroAppType) => {
    const manifest = artifactManifests.find(a => a.id === type);
    return manifest?.defaultSize || { width: 400, height: 500 };
}


export const useAppStore = create<AppStore>()((set, get) => ({
  apps: [],
  activeAppId: null,
  nextZIndex: 10,
  isLoading: false,
  beepOutput: null,

  upsertApp: (type, partialApp) => {
    set(
      produce((state: AppStore) => {
        const existingAppIndex = state.apps.findIndex(
          (app) => app.id === partialApp.id
        );
        const zIndex = state.nextZIndex + 1;

        if (existingAppIndex > -1) {
          state.apps[existingAppIndex] = {
            ...state.apps[existingAppIndex],
            ...partialApp,
            zIndex,
          };
        } else {
            const isClient = typeof window !== 'undefined';
            const defaultSize = getAppDefaultSize(type);

            let position = { x: 150, y: 100 };
            let size = defaultSize;

            if (isClient) {
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                    size = { width: window.innerWidth - 32, height: window.innerHeight * 0.7 };
                    position = { x: 16, y: 80 };
                } else {
                    const topBarHeight = 80; // Approximate height of top bar + padding
                    position = { 
                        x: Math.random() * (window.innerWidth - defaultSize.width - 100) + 50, 
                        y: Math.random() * (window.innerHeight - defaultSize.height - topBarHeight - 50) + topBarHeight 
                    };
                }
            }

            const defaults = {
                id: `app-${Date.now()}`,
                type: type,
                title: artifactManifests.find(a => a.id === type)?.name || `New ${type}`,
                description: artifactManifests.find(a => a.id === type)?.description || `A new ${type} app.`,
                position,
                size,
                zIndex: zIndex,
            };
            state.apps.push({ ...defaults, ...partialApp });
        }
        state.activeAppId = partialApp.id || state.apps[state.apps.length - 1].id;
        state.nextZIndex = zIndex;
      })
    );
  },

  closeApp: (id) => {
    set(
      produce((state: AppStore) => {
        state.apps = state.apps.filter((app) => app.id !== id);
      })
    );
  },

  bringToFront: (id) => {
    set(
      produce((state: AppStore) => {
        const zIndex = state.nextZIndex + 1;
        const appIndex = state.apps.findIndex((app) => app.id === id);
        if (appIndex > -1) {
          state.apps[appIndex].zIndex = zIndex;
          state.nextZIndex = zIndex;
        }
        state.activeAppId = id;
      })
    );
  },

  handleResize: (id, size) => {
    set(produce((state: AppStore) => {
      const appIndex = state.apps.findIndex(app => app.id === id);
      if (appIndex !== -1) {
        state.apps[appIndex].size = size;
      }
    }));
  },

  handleDragEnd: (event) => {
    set(
      produce((state: AppStore) => {
        const { active, delta } = event;
        const appIndex = state.apps.findIndex((app) => app.id === active.id);
        if (appIndex > -1) {
          state.apps[appIndex].position.x += delta.x;
          state.apps[appIndex].position.y += delta.y;
        }
      })
    );
  },

  handleCommandSubmit: async (command, activeAppContext) => {
    set({ isLoading: true, beepOutput: null });

    const { handleCommand } = await import('@/app/actions');
    const result = await handleCommand(command, activeAppContext);
    
    // Generate audio in parallel
    let audioPromise = null;
    if (result.responseText) {
        const isAlert = result.agentReports?.some(r => r.agent === 'aegis' && r.report.isAnomalous);
        audioPromise = generateSpeech({ text: result.responseText, mood: isAlert ? 'alert' : 'neutral' });
    }

    // Show a toast for text-only responses
    if (result.responseText && (!result.appsToLaunch || result.appsToLaunch.length === 0)) {
        toast({
            title: "BEEP",
            description: result.responseText,
        });
    }

    // Process agent reports
    if (result.agentReports) {
      for (const report of result.agentReports) {
        const handler = agentReportHandlers[report.agent as keyof typeof agentReportHandlers];
        if (handler) {
          handler(report.report as any, get());
        }
      }
    }
    
    if (result.appsToLaunch) {
        for (const app of result.appsToLaunch) {
            get().upsertApp(app.type, app);
        }
    }

    if(audioPromise) {
        const audioResult = await audioPromise;
        set({ beepOutput: { ...result, responseAudioUri: audioResult.audioDataUri } });
    } else {
        set({ beepOutput: result });
    }

    set({ isLoading: false });
  },

  triggerAppAction: (id) => {
    console.log(`Action triggered for app: ${id}`);
    // This is a placeholder for future functionality.
  },
}));
