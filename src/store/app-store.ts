import { create } from 'zustand';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { handleCommand } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { microAppManifests } from '@/config/micro-apps';

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
  | 'validator';

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
const manifestMap = new Map(microAppManifests.map(m => [m.id, m]));

export interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  beepOutput: BeepState | null;
  tendyRainActive: boolean;
  screenShakeActive: boolean;
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
        size: overrides.size || defaults.defaultSize,
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

  const processCrmReport = (crmReport: Extract<AgentReportSchema, { agent: 'crm' }>['report']) => {
    const { toast } = useToast.getState();

    switch (crmReport.action) {
      case 'create':
        toast({ title: 'CRM Agent', description: `Contact "${crmReport.report.firstName} ${crmReport.report.lastName}" created successfully.` });
        get().closeApp('contact-editor-new');
        get().handleCommandSubmit('list all contacts');
        break;
      
      case 'update':
        const updatedContact = crmReport.report;
        toast({ title: 'CRM Agent', description: `Contact "${updatedContact.firstName} ${updatedContact.lastName}" was updated.` });
        get().closeApp(`contact-editor-${updatedContact.id}`);
        get().handleCommandSubmit('list all contacts');
        break;

      case 'list':
        const contacts = crmReport.report;
        upsertApp('contact-list', { id: 'contact-list-main', contentProps: { contacts } });
        break;

      case 'delete':
        const { success } = crmReport.report;
        if (success) {
          toast({ title: 'CRM Agent', description: 'Contact deleted successfully.' });
          get().handleCommandSubmit('list all contacts');
        } else {
          toast({ variant: 'destructive', title: 'CRM Agent Error', description: 'Failed to delete contact.' });
        }
        break;
    }
  };


  const processAgentReports = (reports: UserCommandOutput['agentReports']) => {
    if (!reports) return;
    const { toast } = useToast.getState();

    const infidelityRadarId = 'infidelity-radar-main';
    const infidelityApp = get().apps.find(a => a.id === infidelityRadarId);
    let infidelityProps = infidelityApp?.contentProps || {};

    for (const report of reports) {
      const defaults = manifestMap.get(report.agent as MicroAppType);

      switch (report.agent) {
        case 'aegis':
          launchApp('aegis-control', { contentProps: { ...report.report }});
          if (report.report.isAnomalous) {
            toast({ title: 'Aegis Alert', description: report.report.anomalyExplanation, variant: 'destructive' });
            // Haptic feedback for mobile devices to signal a critical alert
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
          break;

        case 'dr-syntax':
          upsertApp('dr-syntax', {
            id: `dr-syntax-report-${Date.now()}`,
            contentProps: report.report as DrSyntaxOutput,
          });
          break;

        case 'crm':
          processCrmReport(report.report);
          break;
        
        case 'billing':
            upsertApp('usage-monitor', {
                id: 'singleton-usage-monitor',
                contentProps: report.report.report
            });
            break;
        
        case 'vin-diesel':
            launchApp('vin-diesel', { title: `VIN: ...${report.report.vin.slice(-6)}`, description: 'Validation Result', contentProps: report.report });
            break;
        
        case 'winston-wolfe':
            launchApp('winston-wolfe', { contentProps: report.report as WinstonWolfeOutput });
            break;

        case 'kif-kroker':
            launchApp('kif-kroker', { contentProps: report.report as KifKrokerAnalysisOutput });
            break;
        
        case 'vandelay':
            launchApp('vandelay', { contentProps: { alibi: report.report as VandelayAlibiOutput } });
            break;
        
        case 'jroc':
            launchApp('jroc-business-kit', { title: `Biz Kit: ${report.report.businessName}`, description: 'Your legit-as-frig business kit.', contentProps: report.report as JrocOutput });
            break;
        
        case 'lahey-surveillance':
             launchApp('lahey-surveillance', { title: `Lahey Report`, description: 'Shit-storm report.', contentProps: report.report as LaheyAnalysisOutput });
             break;
        
        case 'foremanator':
            launchApp('foremanator', { title: 'Foremanator Site Log', description: 'Daily report processed.', contentProps: report.report });
            break;

        case 'sterileish':
            launchApp('sterileish', { title: 'STERILE-ish™ Report', description: 'Compliance analysis complete.', contentProps: report.report as SterileishAnalysisOutput });
            break;
        
        case 'paper-trail':
            const paperTrailAppId = 'paper-trail-main';
            const paperTrailApp = get().apps.find(a => a.id === paperTrailAppId);
            const existingLog = paperTrailApp?.contentProps?.evidenceLog || [];
            const newLog = [report.report, ...existingLog];
            upsertApp('paper-trail', { id: paperTrailAppId, title: 'Paper Trail P.I.', contentProps: { evidenceLog: newLog as PaperTrailScanOutput[] } });
            break;
        
        case 'barbara':
            launchApp('barbara', { contentProps: report.report as BarbaraOutput });
            break;

        case 'auditor':
            launchApp('auditor-generalissimo', { title: "Auditor's Report", description: "Financial records have been judged.", contentProps: report.report as AuditorOutput });
            break;

        case 'wingman':
            launchApp('beep-wingman', { contentProps: report.report as WingmanOutput });
            break;
        
        case 'kendra':
            launchApp('kendra', { title: 'KENDRA.exe: Campaign Generated', description: 'Your unhinged marketing plan.', contentProps: report.report as KendraOutput });
            break;
        
        case 'orphean-oracle':
            launchApp('orphean-oracle', {
                title: 'Oracle\'s Vision',
                description: 'A data constellation.',
                contentProps: report.report as OrpheanOracleOutput
            });
            break;
        
        case 'lumbergh':
            launchApp('project-lumbergh', { contentProps: report.report as LumberghAnalysisOutput });
            break;

        case 'lucille-bluth':
            launchApp('lucille-bluth', { contentProps: report.report as LucilleBluthOutput });
            break;

        case 'pam-poovey':
            launchApp('pam-poovey-onboarding', { contentProps: report.report as PamAudioOutput });
            break;
        
        case 'rolodex':
            upsertApp('rolodex', {
                id: 'rolodex-main',
                contentProps: report.report as RolodexAnalysisOutput
            });
            break;
            
        case 'osint':
            infidelityProps.osintReport = report.report as OsintOutput;
            break;
        case 'infidelity-analysis':
            infidelityProps.analysisResult = report.report as InfidelityAnalysisOutput;
            break;
        case 'decoy':
            infidelityProps.decoyResult = report.report as DecoyOutput;
            break;
        case 'dossier':
            infidelityProps.dossierReport = report.report as DossierOutput;
            break;
        case 'legal-dossier':
            infidelityProps.legalDossierReport = report.report as DossierOutput;
            break;
        
        case 'stonks':
            upsertApp('stonks-bot', { id: 'singleton-stonks-bot', contentProps: report.report });
            break;
      }
    }

    if (Object.keys(infidelityProps).length > 0) {
        upsertApp('infidelity-radar', {
            id: infidelityRadarId,
            contentProps: infidelityProps
        });
    }
  };


  return {
    apps: [],
    isLoading: false,
    beepOutput: null,
    tendyRainActive: false,
    screenShakeActive: false,
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

      if (command.toLowerCase().trim() === 'the tendies are coming') {
        set({ tendyRainActive: true, screenShakeActive: true });
        setTimeout(() => set({ screenShakeActive: false }), 500); // shake for 0.5s
        setTimeout(() => set({ tendyRainActive: false }), 5000); // rain for 5s
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
