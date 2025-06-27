

import { create } from 'zustand';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { processUserCommand } from '@/ai/agents/beep';
import { recallSessionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { EchoRecallToast } from '@/components/echo-recall-toast';
import type { SessionRecallOutput } from '@/ai/agents/echo';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { Contact } from '@/ai/tools/crm-schemas';
import type { UserCommandOutput, AgentReportSchema } from '@/ai/agents/beep-schemas';
import { OsintOutput } from '@/ai/agents/osint-schemas';
import type { WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';
import type { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import type { VandelayAlibiOutput } from '@/ai/agents/vandelay-schemas';
import type { LumberghAnalysisOutput } from '@/ai/agents/lumbergh-schemas';
import type { LucilleBluthOutput } from '@/ai/agents/lucille-bluth-schemas';
import type { RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';


// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'file-explorer' 
  | 'terminal' 
  | 'ai-suggestion'
  | 'echo-control'
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
  | 'oracle'
  | 'paper-trail'
  | 'jroc-business-kit'
  | 'lahey-surveillance'
  | 'the-foremanator'
  | 'sterileish'
  | 'dr-syntax'
  | 'beep-wingman'
  | 'aegis-threatscope';

// Define the shape of a MicroApp instance
export interface MicroApp {
  id: string; // A unique instance ID
  type: MicroAppType;
  title: string;
  description: string;
  position: { x: number; y: number };
  zIndex: number;
  contentProps?: any; // Props for content components, e.g., report data
}

// A simple, non-react-based unique ID generator for new app instances.
let appInstanceId = 0;
const generateId = () => `app-instance-${appInstanceId++}-${Date.now()}`;


const defaultAppDetails: Record<MicroAppType, Omit<MicroApp, 'id' | 'position' | 'zIndex' | 'contentProps'>> = {
  'file-explorer': { type: 'file-explorer', title: 'File Explorer', description: 'Access and manage your files.' },
  'terminal': { type: 'terminal', title: 'Terminal', description: 'Direct command-line access.' },
  'ai-suggestion': { type: 'ai-suggestion', title: 'AI Suggestion', description: 'Click to execute this command.' },
  'echo-control': { type: 'echo-control', title: 'Recall Session', description: "Click to have Echo summarize the last session's activity." },
  'aegis-control': { type: 'aegis-control', title: 'Aegis Security Report', description: "Analysis of the last command's security profile." },
  'aegis-threatscope': { type: 'aegis-threatscope', title: 'Aegis ThreatScope', description: 'Real-time security threat feed.' },
  'contact-list': { type: 'contact-list', title: 'Contact List', description: 'A list of your contacts.' },
  'pam-poovey-onboarding': { type: 'pam-poovey-onboarding', title: 'Pam Poovey: HR', description: 'Onboarding, complaints, and questionable life advice.' },
  'infidelity-radar': { type: 'infidelity-radar', title: 'Infidelity Radar', description: 'Because intuition deserves evidence.' },
  'vin-diesel': { type: 'vin-diesel', title: 'VIN Diesel', description: 'Turbocharged compliance. For family.' },
  'project-lumbergh': { type: 'project-lumbergh', title: 'Project Lumbergh', description: 'Yeah, about those meetings...' },
  'lucille-bluth': { type: 'lucille-bluth', title: 'The Lucille Bluth', description: 'Judgmental budgeting for your allowance.' },
  'rolodex': { type: 'rolodex', title: 'The Rolodex', description: "Let's put a pin in that candidate." },
  'winston-wolfe': { type: 'winston-wolfe', title: 'The Winston Wolfe', description: "Bad review? Thirty minutes away. I'll be there in ten." },
  'kif-kroker': { type: 'kif-kroker', title: 'The Kif Kroker', description: "Sigh. The team's conflict metrics are escalating again." },
  'vandelay': { type: 'vandelay', title: 'Vandelay Industries', description: 'Importing, exporting, and ghosting.' },
  'oracle': { type: 'oracle', title: 'The Oracle', description: 'Agentic pulse network status.' },
  'paper-trail': { type: 'paper-trail', title: 'Paper Trail P.I.', description: 'The receipts don\'t lie.' },
  'jroc-business-kit': { type: 'jroc-business-kit', title: "J-ROC'S BIZ KIT™", description: 'Get dat cheddar legit, my dawg.' },
  'lahey-surveillance': { type: 'lahey-surveillance', title: 'Lahey Surveillance', description: 'I am the liquor. And I am watching.' },
  'the-foremanator': { type: 'the-foremanator', title: 'The Foremanator', description: 'He doesn’t sleep. He doesn’t eat. He just yells about deadlines.' },
  'sterileish': { type: 'sterileish', title: 'STERILE-ish™', description: 'We’re basically compliant.' },
  'dr-syntax': { type: 'dr-syntax', title: 'Dr. Syntax', description: 'Harsh but effective structural critiques.' },
  'beep-wingman': { type: 'beep-wingman', title: 'BEEP Wingman', description: 'Generates compelling opening messages for dating apps.' },
};


export interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  beepOutput: UserCommandOutput | null;
  handleDragEnd: (event: DragEndEvent) => void;
  handleCommandSubmit: (command: string) => void;
  triggerAppAction: (appId: string) => void;
  handleSessionRecall: () => void;
  bringToFront: (appId: string) => void;
}

// A registry for app actions, decoupling them from the component.
const appActionRegistry: Record<string, (get: () => AppState, set: (fn: (state: AppState) => AppState) => void, app: MicroApp) => void> = {
  'echo-control': (get) => get().handleSessionRecall(),
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
    const existingAppsCount = get().apps.length;
    
    const newApp: MicroApp = {
        id: overrides.id || generateId(),
        type: type,
        title: overrides.title || defaults.title,
        description: overrides.description || defaults.description,
        contentProps: overrides.contentProps || {},
        position: overrides.position || { x: 40 + (existingAppsCount % 8) * 30, y: 40 + (existingAppsCount % 8) * 30 },
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

    for (const report of reports) {
      switch (report.agent) {
        case 'aegis':
          upsertApp('aegis-control', { id: 'aegis-report-main', contentProps: { ...report.report }});
          if (report.report.isAnomalous) {
            toast({ title: 'Aegis Alert', description: report.report.anomalyExplanation, variant: 'destructive' });
          }
          break;

        case 'dr-syntax':
          const drSyntaxReport: DrSyntaxOutput = report.report;
          upsertApp('dr-syntax', { 
              id: 'dr-syntax-main',
              title: `Critique Result (Rating: ${drSyntaxReport.rating}/10)`,
              description: `Critique for a piece of content.`,
              contentProps: drSyntaxReport
          });
          break;

        case 'crm':
          processCrmReport(report.report);
          break;
        
        case 'billing':
            break;
        
        case 'vin-diesel':
            upsertApp('vin-diesel', { id: 'vin-diesel-main', title: `VIN: ...${report.report.vin.slice(-6)}`, description: 'Validation Result', contentProps: report.report });
            break;
        
        case 'winston-wolfe':
            upsertApp('winston-wolfe', { id: 'winston-wolfe-main', contentProps: report.report });
            break;

        case 'kif-kroker':
            upsertApp('kif-kroker', { id: 'kif-kroker-main', contentProps: report.report });
            break;
        
        case 'vandelay':
            upsertApp('vandelay', { id: 'vandelay-main', contentProps: { alibi: report.report } });
            break;
        
        case 'jroc':
            upsertApp('jroc-business-kit', { id: 'jroc-main', title: `Biz Kit: ${report.report.businessName}`, description: 'Your legit-as-frig business kit.', contentProps: report.report });
            break;
        
        case 'lahey':
             upsertApp('lahey-surveillance', { id: 'lahey-main', title: `Lahey Report`, description: 'Shit-storm report.', contentProps: report.report });
             break;
        
        case 'foremanator':
            upsertApp('the-foremanator', { id: 'foremanator-main', title: 'Foremanator Site Log', description: 'Daily report processed.', contentProps: report.report });
            break;

        case 'sterileish':
            upsertApp('sterileish', { id: 'sterileish-main', title: 'STERILE-ish™ Report', description: 'Compliance analysis complete.', contentProps: report.report });
            break;
        
        case 'paper-trail':
            upsertApp('paper-trail', { id: 'paper-trail-main', title: `Case File`, description: 'Evidence processed.', contentProps: report.report });
            break;
            
        case 'wingman':
            upsertApp('beep-wingman', { id: 'wingman-main', title: 'BEEP Wingman Mission', description: 'Operation: Charm', contentProps: report.report });
            break;
        
        case 'osint':
            upsertApp('infidelity-radar', { id: 'infidelity-radar-main', contentProps: { osintReport: report.report }});
            break;
            
        case 'lumbergh':
             upsertApp('project-lumbergh', { id: 'lumbergh-main', contentProps: { ...report.report } });
             break;
        
        case 'lucille':
            upsertApp('lucille-bluth', { id: 'lucille-bluth-main', contentProps: { ...report.report } });
            break;

        case 'rolodex':
            upsertApp('rolodex', { id: 'rolodex-main', contentProps: { ...report.report } });
            break;
      }
    }
  };


  return {
    apps: [
      {
        id: 'echo-control-initial',
        type: 'echo-control',
        title: 'Recall Session',
        description: "Click to have Echo summarize the last session's activity.",
        position: { x: 20, y: 20 },
        zIndex: 1,
      },
    ],
    isLoading: false,
    beepOutput: null,
    bringToFront,

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

    handleSessionRecall: async () => {
      set({ isLoading: true });
      const { toast } = useToast.getState();
      try {
        const dummyActivity = `User opened File Explorer.\nUser ran 'critique this copy' in Dr. Syntax.\nUser ran an Aegis scan at 14:32.\nUser launched Loom Studio to inspect 'Client Onboarding' workflow.`;
        const result: SessionRecallOutput = await recallSessionAction({ sessionActivity: dummyActivity });
        toast({ title: 'Echo Remembers', description: React.createElement(EchoRecallToast, result) });
      } catch (error) {
        console.error('Error recalling session:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Echo could not recall the session.' });
      } finally {
        set({ isLoading: false });
      }
    },

    handleCommandSubmit: async (command: string) => {
      if (!command) return;
      set({ isLoading: true, beepOutput: null });
      
      set(state => ({
          apps: state.apps.filter(app => app.type !== 'ai-suggestion')
      }));

      try {
        const result = await processUserCommand({ userCommand: command });
        set({ beepOutput: result });
        const { toast } = useToast.getState();
        
        if (result.responseText) {
            toast({ title: 'BEEP', description: result.responseText });
        }

        processAgentReports(result.agentReports);

        result.appsToLaunch.forEach(appInfo => {
            const defaults = defaultAppDetails[appInfo.type];
            launchApp(appInfo.type, {
                title: appInfo.title || defaults.title,
                description: appInfo.description || defaults.description,
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
