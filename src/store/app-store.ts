
'use client';

import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { produce } from 'immer';
import type { User, Workspace } from '@prisma/client';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { AgentReport, UserCommandOutput } from '@/ai/agents/beep-schemas';
import type { CrmAgentReport } from '@/ai/agents/beep-schemas';
import type { BillingAgentReport } from '@/ai/agents/beep-schemas';
import type { Contact } from '@/ai/tools/crm-schemas';
import { generateSpeech } from '@/ai/flows/tts-flow';
import type { WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';

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
  | 'obelisk-marketplace'
  | 'proxy-agent'
  | 'admin-console';

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

type AgentReportHandlers = {
  [K in AgentReport['agent']]?: (report: Extract<AgentReport, { agent: K }>['report'], store: AppStore) => void;
};

interface AppStore {
  apps: MicroApp[];
  activeAppId: string | null;
  nextZIndex: number;
  isLoading: boolean;
  tendyRainActive: boolean;
  screenShakeActive: boolean;
  beepOutput: UserCommandOutput | null;
  upsertApp: (type: MicroAppType, partialApp: Partial<MicroApp>) => void;
  closeApp: (id: string) => void;
  bringToFront: (id: string) => void;
  handleResize: (id: string, size: { width: number; height: number }) => void;
  handleDragEnd: (event: any) => void;
  handleCommandSubmit: (command: string, activeAppContext?: string) => Promise<void>;
  triggerAppAction: (id: string) => void;
}

const agentReportHandlers: AgentReportHandlers = {
  'dr-syntax': (report: DrSyntaxOutput, store) => {
    store.upsertApp('dr-syntax', {
      id: `dr-syntax-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
  'crm': (report: CrmAgentReport, store) => {
    if (report.action === 'list') {
      store.upsertApp('contact-list', {
        id: 'singleton-contact-list',
        contentProps: { contacts: report.report }
      });
    } else if (report.action === 'create' || report.action === 'update') {
      const contactId = report.report.id;
      store.closeApp(`contact-editor-${contactId}`);
      store.closeApp('contact-editor-new');
      store.handleCommandSubmit('show me my contacts');
    } else if (report.action === 'delete') {
      store.handleCommandSubmit('show me my contacts');
    }
  },
  'billing': (report: BillingAgentReport, store) => {
    if (report.action === 'get_usage') {
        store.upsertApp('usage-monitor', {
            id: 'singleton-usage-monitor',
            contentProps: { usageDetails: report.report },
        });
    }
  },
  'winston-wolfe': (report: WinstonWolfeOutput, store) => {
    store.upsertApp('winston-wolfe', {
      id: `winston-wolfe-${new Date().getTime()}`,
      contentProps: { suggestedResponse: report.suggestedResponse },
    });
  }
};


export const useAppStore = create<AppStore>()((set, get) => ({
  apps: [],
  activeAppId: null,
  nextZIndex: 10,
  isLoading: false,
  tendyRainActive: false,
  screenShakeActive: false,
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
          const defaults = {
            id: `app-${Date.now()}`,
            type: type,
            title: `New ${type}`,
            description: `A new ${type} app.`,
            position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 50 },
            size: { width: 400, height: 300 },
            zIndex: zIndex,
          };
          state.apps.push({ ...defaults, ...partialApp });
        }
        state.activeAppId = partialApp.id || `app-${Date.now()}`;
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
    
    if (command.toLowerCase().trim() === 'the tendies are coming') {
        set({ tendyRainActive: true, screenShakeActive: true });
        setTimeout(() => set({ tendyRainActive: false, screenShakeActive: false }), 7000);
    }

    const { handleCommand } = await import('@/app/actions');
    const result = await handleCommand(command, activeAppContext);
    
    // Generate audio in parallel
    let audioPromise = null;
    if (result.responseText) {
        const isAlert = result.agentReports?.some(r => r.agent === 'aegis' && r.report.isAnomalous);
        audioPromise = generateSpeech({ text: result.responseText, mood: isAlert ? 'alert' : 'neutral' });
    }

    // Process agent reports
    if (result.agentReports) {
      for (const report of result.agentReports) {
        const handler = agentReportHandlers[report.agent];
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
