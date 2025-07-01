
import { create } from 'zustand';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { handleCommand } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { artifactManifests } from '@/config/artifacts';

import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { Contact } from '@/ai/tools/crm-schemas';
import type { UserCommandOutput, AgentReportSchema } from '@/ai/agents/beep-schemas';
import type { OsintOutput } from '@/ai/agents/osint-schemas';
import type { WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';
import type { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import type { VandelayAlibiOutput } from '@/ai/agents/vandelay-schemas';
import type { LumberghAnalysisOutput } from '@/ai/agents/lumbergh-schemas';
import type { LucilleBluthOutput } from '@/ai/agents/lucille-bluth-schemas';
import type { RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';
import type { PamAudioOutput } from '@/ai/agents/pam-poovey-schemas';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import type { DecoyOutput } from '@/ai/agents/decoy-schemas';
import type { JrocOutput } from '@/ai/agents/jroc-schemas';
import type { LaheyAnalysisOutput } from '@/ai/agents/lahey-schemas';
import type { SterileishAnalysisOutput } from '@/ai/agents/sterileish-schemas';
import type { PaperTrailScanOutput } from '@/ai/agents/paper-trail-schemas';
import type { BarbaraOutput } from '@/ai/agents/barbara-schemas';
import type { AuditorOutput } from '@/ai/agents/auditor-generalissimo-schemas';
import type { WingmanOutput } from '@/ai/agents/wingman-schemas';
import type { KendraOutput } from '@/ai/agents/kendra-schemas';
import { type OrpheanOracleOutput } from '@/ai/agents/orphean-oracle-schemas';
import type { DossierOutput } from '@/ai/agents/dossier-schemas';
import { generateSpeech } from '@/ai/flows/tts-flow';
import { StonksBotOutput } from '@/ai/agents/stonks-bot-schemas';
import { RenoModeAnalysisOutput } from '@/ai/agents/reno-mode-schemas';

// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'file-explorer' 
  | 'terminal' 
  | 'ai-suggestion'
  | 'aegis-control'
  | 'contact-list'
  | 'contact-editor'
  | 'pam-poovey-onboarding'
  | 'infidelity-radar'
  | 'vin-diesel'
  | 'project-lumbergh'
  | 'lucille-bluth'
  | 'rolodex'
  | 'winston-wolfe'
  | 'kif-kroker'
  | 'vandelay'
  | 'orphean-oracle'
  | 'paper-trail'
  | 'jroc-business-kit'
  | 'lahey-surveillance'
  | 'foremanator'
  | 'sterileish'
  | 'barbara'
  | 'auditor-generalissimo'
  | 'beep-wingman'
  | 'kendra'
  | 'aegis-threatscope'
  | 'aegis-command'
  | 'usage-monitor'
  | 'dr-syntax'
  | 'armory'
  | 'stonks-bot'
  | 'user-profile-settings'
  | 'workspace-settings'
  | 'top-up'
  | 'oracle-of-delphi-valley'
  | 'admin-console'
  | 'validator'
  | 'reno-mode'
  | 'patrickt-app'
  | 'howards-sidekick'
  | 'sisyphus-ascent'
  | 'merchant-of-cabbage'
  | 'obelisk-marketplace';

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
  tendyRainActive: boolean;
  screenShakeActive: boolean;
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
        'crm': (report) => {
            const { toast } = useToast.getState();
            switch (report.action) {
                case 'create':
                    toast({ title: 'CRM Agent', description: `Contact "${report.report.firstName} ${report.report.lastName}" created successfully.` });
                    get().closeApp('contact-editor-new');
                    get().handleCommandSubmit('list all contacts');
                    break;
                case 'update':
                    const updatedContact = report.report;
                    toast({ title: 'CRM Agent', description: `Contact "${updatedContact.firstName} ${updatedContact.lastName}" was updated.` });
                    get().closeApp(`contact-editor-${updatedContact.id}`);
                    get().handleCommandSubmit('list all contacts');
                    break;
                case 'list':
                    upsertApp('contact-list', { id: 'contact-list-main', contentProps: { contacts: report.report as Contact[] } });
                    break;
                case 'delete':
                    if (report.report.success) {
                        toast({ title: 'CRM Agent', description: 'Contact deleted successfully.' });
                        get().handleCommandSubmit('list all contacts');
                    } else {
                        toast({ variant: 'destructive', title: 'CRM Agent Error', description: 'Failed to delete contact.' });
                    }
                    break;
            }
        },
        'billing': (report) => {
            upsertApp('usage-monitor', { id: 'singleton-usage-monitor', contentProps: report.report });
        },
        'dr-syntax': (report: DrSyntaxOutput) => {
            upsertApp('dr-syntax', { id: `dr-syntax-report-${Date.now()}`, contentProps: report });
        },
        'vin-diesel': (report: WinstonWolfeOutput) => {
            launchApp('vin-diesel', { title: `VIN: ...${report.vin.slice(-6)}`, description: 'Validation Result', contentProps: report });
        },
        'winston-wolfe': (report: WinstonWolfeOutput) => {
            launchApp('winston-wolfe', { contentProps: report });
        },
        'kif-kroker': (report: KifKrokerAnalysisOutput) => {
            launchApp('kif-kroker', { contentProps: report });
        },
        'vandelay': (report: VandelayAlibiOutput) => {
            launchApp('vandelay', { contentProps: { alibi: report } });
        },
        'jroc': (report: JrocOutput) => {
            launchApp('jroc-business-kit', { title: `Biz Kit: ${report.businessName}`, description: 'Your legit-as-frig business kit.', contentProps: report });
        },
        'lahey-surveillance': (report: LaheyAnalysisOutput) => {
            launchApp('lahey-surveillance', { title: `Lahey Report`, description: 'Shit-storm report.', contentProps: report });
        },
        'foremanator': (report: LaheyAnalysisOutput) => {
            launchApp('foremanator', { title: 'Foremanator Site Log', description: 'Daily report processed.', contentProps: report });
        },
        'sterileish': (report: SterileishAnalysisOutput) => {
            launchApp('sterileish', { title: 'STERILE-ish™ Report', description: 'Compliance analysis complete.', contentProps: report });
        },
        'paper-trail': (report: PaperTrailScanOutput) => {
            const paperTrailAppId = 'paper-trail-main';
            const paperTrailApp = get().apps.find(a => a.id === paperTrailAppId);
            const existingLog = paperTrailApp?.contentProps?.evidenceLog || [];
            const newLog = [report, ...existingLog];
            upsertApp('paper-trail', { id: paperTrailAppId, title: 'Paper Trail P.I.', contentProps: { evidenceLog: newLog } });
        },
        'barbara': (report: BarbaraOutput) => {
            launchApp('barbara', { contentProps: report });
        },
        'auditor': (report: AuditorOutput) => {
            launchApp('auditor-generalissimo', { title: "Auditor's Report", description: "Financial records have been judged.", contentProps: report });
        },
        'wingman': (report: WingmanOutput) => {
            launchApp('beep-wingman', { contentProps: report });
        },
        'kendra': (report: KendraOutput) => {
            launchApp('kendra', { title: 'KENDRA.exe: Campaign Generated', description: 'Your unhinged marketing plan.', contentProps: report });
        },
        'orphean-oracle': (report: OrpheanOracleOutput) => {
            launchApp('orphean-oracle', { title: 'Oracle\'s Vision', description: 'A data constellation.', contentProps: report });
        },
        'lumbergh': (report: LumberghAnalysisOutput) => {
            launchApp('project-lumbergh', { contentProps: report });
        },
        'lucille-bluth': (report: LucilleBluthOutput) => {
            launchApp('lucille-bluth', { contentProps: report });
        },
        'pam-poovey': (report: PamAudioOutput) => {
            launchApp('pam-poovey-onboarding', { contentProps: report });
        },
        'rolodex': (report: RolodexAnalysisOutput) => {
            upsertApp('rolodex', { id: 'rolodex-main', contentProps: report });
        },
        'stonks': (report: StonksBotOutput) => {
            upsertApp('stonks-bot', { id: 'singleton-stonks-bot', contentProps: report });
        },
        'reno-mode': (report: RenoModeAnalysisOutput) => {
            launchApp('reno-mode', { contentProps: report });
        },
        'patrickt-app': (report: any) => {
            console.log("Received Patrickt report:", report);
        },
        'osint': (report: OsintOutput) => {
            const infidelityRadarId = 'infidelity-radar-main';
            const infidelityApp = get().apps.find(a => a.id === infidelityRadarId);
            let infidelityProps = infidelityApp?.contentProps || {};
            infidelityProps.osintReport = report;
            upsertApp('infidelity-radar', { id: infidelityRadarId, contentProps: infidelityProps });
        },
        'infidelity-analysis': (report: InfidelityAnalysisOutput) => {
            const infidelityRadarId = 'infidelity-radar-main';
            const infidelityApp = get().apps.find(a => a.id === infidelityRadarId);
            let infidelityProps = infidelityApp?.contentProps || {};
            infidelityProps.analysisResult = report;
            upsertApp('infidelity-radar', { id: infidelityRadarId, contentProps: infidelityProps });
        },
        'decoy': (report: DecoyOutput) => {
            const infidelityRadarId = 'infidelity-radar-main';
            const infidelityApp = get().apps.find(a => a.id === infidelityRadarId);
            let infidelityProps = infidelityApp?.contentProps || {};
            infidelityProps.decoyResult = report;
            upsertApp('infidelity-radar', { id: infidelityRadarId, contentProps: infidelityProps });
        },
        'dossier': (report: DossierOutput) => {
            const infidelityRadarId = 'infidelity-radar-main';
            const infidelityApp = get().apps.find(a => a.id === infidelityRadarId);
            let infidelityProps = infidelityApp?.contentProps || {};
            infidelityProps.dossierReport = report;
            upsertApp('infidelity-radar', { id: infidelityRadarId, contentProps: infidelityProps });
        },
        'legal-dossier': (report: DossierOutput) => {
            const infidelityRadarId = 'infidelity-radar-main';
            const infidelityApp = get().apps.find(a => a.id === infidelityRadarId);
            let infidelityProps = infidelityApp?.contentProps || {};
            infidelityProps.legalDossierReport = report;
            upsertApp('infidelity-radar', { id: infidelityRadarId, contentProps: infidelityProps });
        },
    };

  const processAgentReports = (reports: UserCommandOutput['agentReports']) => {
    if (!reports) return;
    for (const report of reports) {
      const handler = agentReportHandlerRegistry[report.agent];
      if (handler) {
        // We cast the report data to `any` here because TypeScript has trouble
        // with the complexity of the discriminated union within this dynamic context.
        // The BEEP agent's output schema ensures this is type-safe at runtime.
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
    tendyRainActive: false,
    screenShakeActive: false,
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

      const lowerCaseCommand = command.toLowerCase().trim();

      if (lowerCaseCommand === 'the tendies are coming') {
        set({ tendyRainActive: true, screenShakeActive: true });
        setTimeout(() => set({ screenShakeActive: false }), 500); // shake for 0.5s
        setTimeout(() => set({ tendyRainActive: false }), 5000); // rain for 5s
      } else if (lowerCaseCommand === 'show me the shitstorm') {
        set({ screenShakeActive: true });
        setTimeout(() => set({ screenShakeActive: false }), 700);
      }
      
      set({ isLoading: true, beepOutput: null });
      
      set(state => ({
          apps: state.apps.filter(app => app.type !== 'ai-suggestion')
      }));

      try {
        const result = await handleCommand(command);
        
        // Set text-only result first for immediate UI feedback.
        set({ beepOutput: result });

        // Asynchronously generate and add audio URI to the state.
        if (result.responseText) {
          let mood: 'neutral' | 'alert' | 'confirmation' = 'neutral';
          const lowerCaseResponse = result.responseText.toLowerCase();

          if (result.agentReports?.some(r => r.agent === 'aegis' && r.report.isAnomalous)) {
            mood = 'alert';
          } else if (
            lowerCaseResponse.includes('success') || 
            lowerCaseResponse.includes('confirmed') || 
            lowerCaseResponse.includes('created') || 
            lowerCaseResponse.includes('unlocked')
          ) {
            mood = 'confirmation';
          }
          
          generateSpeech({ text: result.responseText, mood }).then(({ audioDataUri }) => {
            if (audioDataUri) {
              set(state => ({
                beepOutput: state.beepOutput ? { ...state.beepOutput, responseAudioUri: audioDataUri } : null,
              }));
            }
          });
        }
        
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
