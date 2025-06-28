
import { create } from 'zustand';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { handleCommand } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SessionRecallOutput } from '@/ai/agents/echo-schemas';
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
import type { StonksBotOutput } from '@/ai/agents/stonks-bot-schemas';
import { type OrpheanOracleOutput } from '@/ai/agents/orphean-oracle-schemas';
import type { DossierOutput } from '@/ai/agents/dossier-schemas';
import { generateSpeech } from '@/ai/flows/tts-flow';

// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'file-explorer' 
  | 'terminal' 
  | 'ai-suggestion'
  | 'echo-recall'
  | 'aegis-control'
  | 'contact-list'
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
  | 'the-foremanator'
  | 'sterileish'
  | 'barbara'
  | 'auditor-generalissimo'
  | 'beep-wingman'
  | 'kendra'
  | 'stonks-bot'
  | 'aegis-threatscope'
  | 'aegis-command'
  | 'usage-monitor'
  | 'armory';

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

const defaultAppDetails: Record<MicroAppType, Omit<MicroApp, 'id' | 'position' | 'zIndex' | 'size' | 'contentProps'>> = {
  'file-explorer': { type: 'file-explorer', title: 'File Explorer', description: 'Access and manage your files.' },
  'terminal': { type: 'terminal', title: 'Terminal', description: 'Direct command-line access.' },
  'ai-suggestion': { type: 'ai-suggestion', title: 'AI Suggestion', description: 'Click to execute this command.' },
  'echo-recall': { type: 'echo-recall', title: 'Echo: Session Recall', description: "A summary of the last session's activity." },
  'aegis-control': { type: 'aegis-control', title: 'Aegis Security Report', description: "Analysis of the last command's security profile." },
  'contact-list': { type: 'contact-list', title: 'Contact List', description: 'A list of your contacts.' },
  'pam-poovey-onboarding': { type: 'pam-poovey-onboarding', title: 'Pam Poovey: Un-HR', description: 'Onboarding, complaints, and questionable life advice.' },
  'infidelity-radar': { type: 'infidelity-radar', title: 'Infidelity Radar', description: 'Because intuition deserves evidence.' },
  'vin-diesel': { type: 'vin-diesel', title: 'VIN Diesel', description: 'Turbocharged compliance. For family.' },
  'project-lumbergh': { type: 'project-lumbergh', title: 'Project Lumbergh', description: 'Yeah, about those meetings...' },
  'lucille-bluth': { type: 'lucille-bluth', title: 'The Lucille Bluth', description: 'Judgmental budgeting for your allowance.' },
  'rolodex': { type: 'rolodex', title: 'The Rolodex', description: "Let's put a pin in that candidate." },
  'winston-wolfe': { type: 'winston-wolfe', title: 'The Winston Wolfe', description: "Bad review? Thirty minutes away. I'll be there in ten." },
  'kif-kroker': { type: 'kif-kroker', title: 'The Kif Kroker', description: "Sigh. The team's conflict metrics are escalating again." },
  'vandelay': { type: 'vandelay', title: 'Vandelay Industries', description: 'Importing, exporting, and ghosting.' },
  'orphean-oracle': { type: 'orphean-oracle', title: 'The Orphean Oracle', description: 'The story hidden in your data.' },
  'paper-trail': { type: 'paper-trail', title: 'Paper Trail P.I.', description: 'The receipts don\'t lie.' },
  'jroc-business-kit': { type: 'jroc-business-kit', title: "J-ROC'S BIZ KIT™", description: 'Get dat cheddar legit, my dawg.' },
  'lahey-surveillance': { type: 'lahey-surveillance', title: 'Lahey Surveillance', description: 'I am the liquor. And I am watching.' },
  'the-foremanator': { type: 'the-foremanator', title: 'The Foremanator', description: 'He doesn’t sleep. He doesn’t eat. He just yells about deadlines.' },
  'sterileish': { type: 'sterileish', title: 'STERILE-ish™', description: 'We’re basically compliant.' },
  'barbara': { type: 'barbara', title: 'Agent Barbara™', description: 'The admin daemon you never knew you needed.' },
  'auditor-generalissimo': { type: 'auditor-generalissimo', title: 'The Auditor Generalissimo™', description: 'You are guilty until proven solvent.' },
  'beep-wingman': { type: 'beep-wingman', title: 'BEEP Wingman', description: "He's not your assistant. He's your closer." },
  'kendra': { type: 'kendra', title: 'KENDRA.exe', description: 'This is branding with beef.' },
  'stonks-bot': { type: 'stonks-bot', title: 'Stonks Bot 9000', description: 'Tendies incoming. Not financial advice.' },
  'aegis-threatscope': { type: 'aegis-threatscope', title: 'Aegis ThreatScope', description: 'Real-time threat feed from the Aegis subsystem.' },
  'aegis-command': { type: 'aegis-command', title: 'Aegis Command', description: 'Configure Aegis threat intelligence feeds.' },
  'usage-monitor': { type: 'usage-monitor', title: 'Usage Monitor', description: 'Track your Agent Action consumption.' },
  'armory': { type: 'armory', title: 'The Armory', description: 'A catalog of available micro-apps and tools.' },
};

const defaultAppSizes: Record<MicroAppType, { width: number; height: number }> = {
  'file-explorer': { width: 400, height: 300 },
  'terminal': { width: 450, height: 300 },
  'ai-suggestion': { width: 320, height: 120 },
  'echo-recall': { width: 320, height: 250 },
  'aegis-control': { width: 320, height: 220 },
  'contact-list': { width: 680, height: 450 },
  'pam-poovey-onboarding': { width: 320, height: 350 },
  'infidelity-radar': { width: 360, height: 500 },
  'vin-diesel': { width: 320, height: 400 },
  'project-lumbergh': { width: 320, height: 400 },
  'lucille-bluth': { width: 320, height: 350 },
  'rolodex': { width: 340, height: 500 },
  'winston-wolfe': { width: 320, height: 380 },
  'kif-kroker': { width: 320, height: 420 },
  'vandelay': { width: 320, height: 280 },
  'orphean-oracle': { width: 400, height: 500 },
  'paper-trail': { width: 340, height: 500 },
  'jroc-business-kit': { width: 320, height: 500 },
  'lahey-surveillance': { width: 400, height: 500 },
  'the-foremanator': { width: 340, height: 500 },
  'sterileish': { width: 340, height: 500 },
  'barbara': { width: 360, height: 500 },
  'auditor-generalissimo': { width: 360, height: 600 },
  'beep-wingman': { width: 360, height: 620 },
  'kendra': { width: 360, height: 500 },
  'stonks-bot': { width: 320, height: 380 },
  'aegis-threatscope': { width: 380, height: 450 },
  'aegis-command': { width: 380, height: 350 },
  'usage-monitor': { width: 320, height: 380 },
  'armory': { width: 800, height: 600 },
};

export interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  beepOutput: BeepState | null;
  handleDragEnd: (event: DragEndEvent) => void;
  handleResize: (appId: string, size: { width: number; height: number }) => void;
  handleCommandSubmit: (command: string) => void;
  triggerAppAction: (appId: string) => void;
  bringToFront: (appId: string) => void;
  upsertApp: (type: MicroAppType, props: Partial<Omit<MicroApp, 'type'>>) => MicroApp | undefined;
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
    const defaults = defaultAppDetails[type];
    const defaultSize = defaultAppSizes[type] || { width: 320, height: 400 };
    const existingAppsCount = get().apps.length;
    
    const newApp: MicroApp = {
        id: overrides.id || generateId(),
        type: type,
        title: overrides.title || defaults.title,
        description: overrides.description || defaults.description,
        contentProps: overrides.contentProps || {},
        position: overrides.position || { x: 40 + (existingAppsCount % 8) * 30, y: 40 + (existingAppsCount % 8) * 30 },
        size: overrides.size || defaultSize,
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


  const processCrmReport = (crmReport: Extract<AgentReportSchema, { agent: 'crm' }>['report']) => {
    const { toast } = useToast.getState();
    const crmAppId = 'contact-list-main';

    switch (crmReport.action) {
      case 'create':
        toast({ title: 'CRM Agent', description: `Contact "${crmReport.report.firstName} ${crmReport.report.lastName}" created successfully.` });
        get().handleCommandSubmit('list all contacts');
        break;
      
      case 'update':
        const updatedContact = crmReport.report;
        toast({ title: 'CRM Agent', description: `Contact "${updatedContact.firstName} ${updatedContact.lastName}" was updated.` });
        set(state => ({
          apps: state.apps.map(app => 
            (app.id === crmAppId && app.contentProps?.contacts)
              ? { ...app, contentProps: { ...app.contentProps, contacts: app.contentProps.contacts.map((c: Contact) => c.id === updatedContact.id ? updatedContact : c) } }
              : app
          )
        }));
        bringToFront(crmAppId);
        break;

      case 'list':
        const contacts = crmReport.report;
        upsertApp('contact-list', { id: crmAppId, contentProps: { contacts } });
        break;

      case 'delete':
        const { id: deletedId, success } = crmReport.report;
        if (success) {
          toast({ title: 'CRM Agent', description: 'Contact deleted successfully.' });
          set(state => ({
            apps: state.apps.map(app =>
              (app.id === crmAppId && app.contentProps?.contacts)
                ? { ...app, contentProps: { ...app.contentProps, contacts: app.contentProps.contacts.filter((c: Contact) => c.id !== deletedId) } }
                : app
            )
          }));
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
      switch (report.agent) {
        case 'aegis':
          launchApp('aegis-control', { contentProps: { ...report.report }});
          if (report.report.isAnomalous) {
            toast({ title: 'Aegis Alert', description: report.report.anomalyExplanation, variant: 'destructive' });
          }
          break;

        case 'dr-syntax':
          launchApp('ai-suggestion', {
            title: `Critique Result (Rating: ${report.report.rating}/10)`,
            description: `Critique: ${report.report.critique}\nSuggestion: ${report.report.suggestion}`,
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
             launchApp('lahey-surveillance', { title: `Lahey Report`, description: 'Shit-storm report.', contentProps: report.report });
             break;
        
        case 'foremanator':
            launchApp('the-foremanator', { title: 'Foremanator Site Log', description: 'Daily report processed.', contentProps: report.report });
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
        
        case 'stonks':
            launchApp('stonks-bot', { title: `Stonks: ${report.report.ticker}`, description: 'Your "financial" advice.', contentProps: report.report as StonksBotOutput });
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
    bringToFront,
    upsertApp,

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
        
        // Set text-only result first for immediate UI feedback.
        set({ beepOutput: result });

        // Asynchronously generate and add audio URI to the state.
        if (result.responseText) {
          generateSpeech({ text: result.responseText }).then(({ audioDataUri }) => {
            if (audioDataUri) {
              set(state => ({
                beepOutput: state.beepOutput ? { ...state.beepOutput, responseAudioUri: audioDataUri } : null,
              }));
            }
          });
        }
        
        const { toast } = useToast.getState();
        if (result.responseText) {
            toast({ title: 'BEEP', description: result.responseText });
        }

        processAgentReports(result.agentReports);

        result.appsToLaunch.forEach(appInfo => {
          upsertApp(appInfo.type, {
            id: `agent-app-${appInfo.type}`, // Use a consistent ID to make agent apps singletons
            title: appInfo.title || defaultAppDetails[appInfo.type].title,
            description: appInfo.description || defaultAppDetails[appInfo.type].description,
          });
        });

        result.suggestedCommands.forEach(cmd => {
            launchApp('ai-suggestion', {
                title: cmd,
                description: defaultAppDetails['ai-suggestion'].description,
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
