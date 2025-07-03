
'use client';

import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { produce } from 'immer';
import type { User, Workspace } from '@prisma/client';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { AgentReport, UserCommandOutput } from '@/ai/agents/beep-schemas';
import type { CrmAgentReport } from '@/ai/agents/beep-schemas';
import type { BillingAgentReport } from '@/ai/agents/beep-schemas';
import { generateSpeech } from '@/ai/flows/tts-flow';
import type { WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';
import { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import { VandelayAlibiOutput } from '@/ai/agents/vandelay-schemas';
import { RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';
import { PaperTrailScanOutput } from '@/ai/agents/paper-trail-schemas';
import { JrocOutput } from '@/ai/agents/jroc-schemas';
import { LaheyAnalysisOutput } from '@/ai/agents/lahey-schemas';
import { ForemanatorLogOutput } from '@/ai/agents/foremanator-schemas';
import { SterileishAnalysisOutput } from '@/ai/agents/sterileish-schemas';
import { BarbaraOutput } from '@/ai/agents/barbara-schemas';
import { AuditorOutput } from '@/ai/agents/auditor-generalissimo-schemas';
import { WingmanOutput } from '@/ai/agents/wingman-schemas';
import { KendraOutput } from '@/ai/agents/kendra-schemas';
import { OrpheanOracleOutput } from '@/ai/agents/orphean-oracle-schemas';
import { LumberghAnalysisOutput } from '@/ai/agents/lumbergh-schemas';
import { LucilleBluthOutput } from '@/ai/agents/lucille-bluth-schemas';
import { PamAudioOutput } from '@/ai/agents/pam-poovey-schemas';
import { StonksBotOutput } from '@/ai/agents/stonks-bot-schemas';
import { RenoModeAnalysisOutput } from '@/ai/agents/reno-mode-schemas';
import { PatricktAgentOutput } from '@/ai/agents/patrickt-agent-schemas';
import { VinDieselOutput } from '@/ai/agents/vin-diesel-schemas';
import { InventoryDaemonOutput } from '@/ai/agents/inventory-daemon-schemas';
import { RitualQuestOutput } from '@/ai/agents/ritual-quests-schemas';
import { artifactManifests } from '@/config/artifacts';

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

type AgentReportHandlers = {
  [K in AgentReport['agent']]?: (report: Extract<AgentReport, { agent: K }>['report'], store: AppStore) => void;
};

interface AppStore {
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


const agentReportHandlers: AgentReportHandlers = {
  'dr-syntax': (report: DrSyntaxOutput, store) => {
    store.upsertApp('dr-syntax', {
      id: `dr-syntax-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
  'winston-wolfe': (report: WinstonWolfeOutput, store) => {
    store.upsertApp('winston-wolfe', {
      id: `winston-wolfe-${new Date().getTime()}`,
      contentProps: { suggestedResponse: report.suggestedResponse },
    });
  },
  'kif-kroker': (report: KifKrokerAnalysisOutput, store) => {
    store.upsertApp('kif-kroker', {
      id: `kif-kroker-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
  'vandelay': (report: VandelayAlibiOutput, store) => {
    store.upsertApp('vandelay', {
      id: `vandelay-report-${new Date().getTime()}`,
      contentProps: { alibi: report },
    });
  },
  'rolodex': (report: RolodexAnalysisOutput, store) => {
    store.upsertApp('rolodex', {
      id: `rolodex-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
   'paper-trail': (report: PaperTrailScanOutput, store) => {
    store.upsertApp('paper-trail', {
      id: `paper-trail-${new Date().getTime()}`,
      contentProps: { evidenceLog: [report] },
    });
  },
  'jroc': (report: JrocOutput, store) => {
    store.upsertApp('jroc-business-kit', {
        id: `jroc-kit-${new Date().getTime()}`,
        contentProps: report
    });
  },
  'lahey-surveillance': (report: LaheyAnalysisOutput, store) => {
    // Lahey app is a timeline, so we won't directly open a new one.
    // Future implementation could update a central timeline view.
  },
  'foremanator': (report: ForemanatorLogOutput, store) => {
      store.upsertApp('foremanator', {
          id: `foremanator-log-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'sterileish': (report: SterileishAnalysisOutput, store) => {
      store.upsertApp('sterileish', {
          id: `sterileish-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'barbara': (report: BarbaraOutput, store) => {
      store.upsertApp('barbara', {
          id: `barbara-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'auditor': (report: AuditorOutput, store) => {
      store.upsertApp('auditor-generalissimo', {
          id: `auditor-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'wingman': (report: WingmanOutput, store) => {
      store.upsertApp('beep-wingman', {
          id: `wingman-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'kendra': (report: KendraOutput, store) => {
      store.upsertApp('kendra', {
          id: `kendra-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'orphean-oracle': (report: OrpheanOracleOutput, store) => {
      store.upsertApp('orphean-oracle', {
          id: `oracle-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'lumbergh': (report: LumberghAnalysisOutput, store) => {
      store.upsertApp('project-lumbergh', {
          id: `lumbergh-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'lucille-bluth': (report: LucilleBluthOutput, store) => {
      store.upsertApp('lucille-bluth', {
          id: `lucille-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'pam-poovey': (report: PamAudioOutput, store) => {
      store.upsertApp('pam-poovey-onboarding', {
          id: `pam-rant-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'stonks': (report: StonksBotOutput, store) => {
      store.upsertApp('stonks-bot', {
          id: `stonks-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'reno-mode': (report: RenoModeAnalysisOutput, store) => {
      store.upsertApp('reno-mode', {
          id: `reno-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'patrickt-app': (report: PatricktAgentOutput, store) => {
      // The Patrickt app has its own internal state management
  },
   'vin-diesel': (report: VinDieselOutput, store) => {
      store.upsertApp('vin-diesel', {
          id: `vin-diesel-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'inventory-daemon': (report: InventoryDaemonOutput, store) => {
      // The daemon's response is part of BEEP's responseText, not a new app
  },
  'ritual-quests': (report: RitualQuestOutput, store) => {
    store.upsertApp('ritual-quests', {
      id: 'singleton-ritual-quests',
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
};


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
