
import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import React from 'react';

import { processUserCommand } from '@/ai/agents/beep';
import { recallSessionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { EchoRecallToast } from '@/components/echo-recall-toast';
import { DrSyntaxReportToast } from '@/components/dr-syntax-report-toast';
import type { SessionRecallOutput } from '@/ai/agents/echo';
import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { Contact } from '@/ai/tools/crm-schemas';
import type { UserCommandOutput, AgentReportSchema } from '@/ai/agents/beep-schemas';


// Define the types of MicroApps available in the OS
export type MicroAppType = 
  | 'file-explorer' 
  | 'terminal' 
  | 'ai-suggestion'
  | 'echo-control'
  | 'aegis-control'
  | 'contact-list'
  | 'pam-poovey-onboarding'
  | 'beep-wingman'
  | 'infidelity-radar'
  | 'vin-diesel'
  | 'project-lumbergh'
  | 'lucille-bluth'
  | 'rolodex'
  | 'winston-wolfe'
  | 'kif-kroker'
  | 'vandelay'
  | 'paper-trail';

// Define the shape of a MicroApp instance
export interface MicroApp {
  id: string; // A unique instance ID
  type: MicroAppType;
  title: string;
  description: string;
  contentProps?: any; // Props for content components, e.g., report data
}

// A simple, non-react-based unique ID generator for new app instances.
let appInstanceId = 0;
const generateId = () => `app-instance-${++appInstanceId}`;


const defaultAppDetails: Record<MicroAppType, Omit<MicroApp, 'id' | 'contentProps'>> = {
  'file-explorer': { type: 'file-explorer', title: 'File Explorer', description: 'Access and manage your files.' },
  'terminal': { type: 'terminal', title: 'Terminal', description: 'Direct command-line access.' },
  'ai-suggestion': { type: 'ai-suggestion', title: 'AI Suggestion', description: 'Click to execute this command.' },
  'echo-control': { type: 'echo-control', title: 'Recall Session', description: "Click to have Echo summarize the last session's activity." },
  'aegis-control': { type: 'aegis-control', title: 'Aegis Security Report', description: "Analysis of the last command's security profile." },
  'contact-list': { type: 'contact-list', title: 'Contact List', description: 'A list of your contacts.' },
  'pam-poovey-onboarding': { type: 'pam-poovey-onboarding', title: 'Pam Poovey: HR', description: 'Onboarding, complaints, and questionable life advice.' },
  'beep-wingman': { type: 'beep-wingman', title: 'BEEP™ Wingman', description: 'Dating Automation for High-Functioning Degenerates.' },
  'infidelity-radar': { type: 'infidelity-radar', title: 'Infidelity Radar', description: 'Because intuition deserves evidence.' },
  'vin-diesel': { type: 'vin-diesel', title: 'VIN Diesel', description: 'Turbocharged compliance. For family.' },
  'project-lumbergh': { type: 'project-lumbergh', title: 'Project Lumbergh', description: 'Yeah, about those meetings...' },
  'lucille-bluth': { type: 'lucille-bluth', title: 'The Lucille Bluth', description: 'Judgmental budgeting for your allowance.' },
  'rolodex': { type: 'rolodex', title: 'The Rolodex', description: "Let's put a pin in that candidate." },
  'winston-wolfe': { type: 'winston-wolfe', title: 'The Winston Wolfe', description: "Bad review? Thirty minutes away. I'll be there in ten." },
  'kif-kroker': { type: 'kif-kroker', title: 'The Kif Kroker', description: "Sigh. The team's conflict metrics are escalating again." },
  'vandelay': { type: 'vandelay', title: 'Vandelay Industries', description: 'Importing, exporting, and ghosting.' },
  'paper-trail': { type: 'paper-trail', title: 'Paper Trail', description: 'Every dollar tells a story. We find the plot holes.' },
};


interface AppState {
  apps: MicroApp[];
  isLoading: boolean;
  handleDragEnd: (event: DragEndEvent) => void;
  handleCommandSubmit: (command: string) => void;
  triggerAppAction: (appId: string) => void;
  handleSessionRecall: () => void;
}

// A registry for app actions, decoupling them from the component.
const appActionRegistry: Record<string, (get: () => AppState, set: (fn: (state: AppState) => AppState) => void, app: MicroApp) => void> = {
  'echo-control': (get) => get().handleSessionRecall(),
  'ai-suggestion': (get, set, app) => {
    get().handleCommandSubmit(app.title);
  },
};


export const useAppStore = create<AppState>((set, get) => {
    
  // === PRIVATE HELPERS (scoped to the store closure) ===

  /**
   * Updates an existing MicroApp or inserts a new one into the state.
   * This is a core utility for handling dynamic app manifestations.
   * @param newApp The MicroApp object to upsert.
   * @param position Optional: Where to insert the new app relative to another type.
   * @param relativeToType The type of app to position against.
   */
  const upsertMicroApp = (newApp: MicroApp, position?: 'after' | 'before', relativeToType?: MicroAppType) => {
    set(state => {
      const existingIndex = state.apps.findIndex(a => a.id === newApp.id);
      
      if (existingIndex > -1) {
        // Update existing app in-place
        const updatedApps = [...state.apps];
        updatedApps[existingIndex] = newApp;
        return { apps: updatedApps };
      }
      
      // Insert new app at a specific position if requested
      if (position && relativeToType) {
        const relativeIndex = state.apps.findIndex(a => a.type === relativeToType);
        if (relativeIndex > -1) {
          const newApps = [...state.apps];
          newApps.splice(relativeIndex + (position === 'after' ? 1 : 0), 0, newApp);
          return { apps: newApps };
        }
      }

      // Fallback: add to the end
      return { apps: [...state.apps, newApp] };
    });
  };

  /**
   * Handles the various response types from the CRM agent.
   * @param crmReport The report object from the CRM agent.
   */
  const processCrmReport = (crmReport: Extract<AgentReportSchema, { agent: 'crm' }>['report']) => {
    const { toast } = useToast.getState();
    const crmAppId = 'contact-list-main';

    switch (crmReport.action) {
      case 'create':
        toast({ title: 'CRM Agent', description: `Contact "${crmReport.report.firstName} ${crmReport.report.lastName}" created successfully.` });
        // Re-fetch the list to show the new contact. A more optimized approach might add it directly.
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
        break;

      case 'list':
        const contacts = crmReport.report;
        const contactListApp: MicroApp = {
          id: crmAppId,
          type: 'contact-list',
          title: 'Contact List',
          description: 'A list of your contacts.',
          contentProps: { contacts },
        };
        upsertMicroApp(contactListApp);
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

  /**
   * Processes an array of agent reports, dispatching toasts or updating app states.
   * @param reports The array of agent reports from BEEP.
   */
  const processAgentReports = (reports: UserCommandOutput['agentReports']) => {
    if (!reports) return;
    const { toast } = useToast.getState();

    const launchAppForReport = (type: MicroAppType, title: string, description: string, contentProps: any) => {
        const app: MicroApp = {
            id: generateId(),
            type,
            title,
            description,
            contentProps,
        };
        upsertMicroApp(app, 'after', 'aegis-control');
    };

    for (const report of reports) {
      switch (report.agent) {
        case 'aegis':
          const aegisApp: MicroApp = {
            id: 'aegis-report-main',
            type: 'aegis-control',
            title: defaultAppDetails['aegis-control'].title,
            description: '',
            contentProps: { ...report.report }
          };
          upsertMicroApp(aegisApp, 'after', 'echo-control');
          if (report.report.isAnomalous) {
            toast({ title: 'Aegis Alert', description: report.report.anomalyExplanation, variant: 'destructive' });
          }
          break;

        case 'dr-syntax':
          const drSyntaxReport: DrSyntaxOutput = report.report;
          toast({ title: `Dr. Syntax's Verdict (Rating: ${drSyntaxReport.rating}/10)`, description: React.createElement(DrSyntaxReportToast, drSyntaxReport) });
          break;

        case 'crm':
          processCrmReport(report.report);
          break;
        
        case 'billing':
            // Billing information is now handled directly in BEEP's textual response
            // and does not launch a Micro-App.
            break;
        
        case 'vin-diesel':
            launchAppForReport('vin-diesel', `VIN: ...${report.report.vin.slice(-6)}`, 'Validation Result', report.report);
            break;
        
        case 'winston-wolfe':
            launchAppForReport('winston-wolfe', 'Winston Wolfe', 'A solution is ready.', report.report);
            break;

        case 'kif-kroker':
            launchAppForReport('kif-kroker', 'Kif Kroker', 'Comms Analysis', report.report);
            break;

        case 'vandelay':
            launchAppForReport('vandelay', 'Vandelay Industries', 'Alibi Generated', report.report);
            break;
        
        case 'project-lumbergh':
            launchAppForReport('project-lumbergh', 'Project Lumbergh', 'Invite Analyzed', report.report);
            break;
        
        case 'lucille-bluth':
            launchAppForReport('lucille-bluth', 'The Lucille Bluth', 'Expense Judged', report.report);
            break;
        
        case 'rolodex':
            launchAppForReport('rolodex', 'The Rolodex', 'Candidate Analyzed', report.report);
            break;
        
        case 'infidelity-radar':
            launchAppForReport('infidelity-radar', 'Infidelity Radar', 'Analysis Complete', report.report);
            break;
            
        case 'beep-wingman':
            launchAppForReport('beep-wingman', 'BEEP Wingman', 'Opener Generated', report.report);
            break;
      }
    }
  };

  // === PUBLIC API of the store ===
  return {
    apps: [
      {
        id: 'echo-control-initial',
        type: 'echo-control',
        title: 'Recall Session',
        description: "Click to have Echo summarize the last session's activity.",
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
      set({ isLoading: true });
      
      // Clear previous suggestions and reports before executing a new command.
      set(state => ({
          apps: state.apps.filter(app => app.type !== 'ai-suggestion' && app.id !== 'aegis-report-main')
      }));

      try {
        const result = await processUserCommand({ userCommand: command });
        const { toast } = useToast.getState();
        
        if (result.responseText) {
            toast({ title: 'BEEP', description: result.responseText });
        }

        processAgentReports(result.agentReports);

        const appsToLaunch = result.appsToLaunch.map((appInfo) => {
          const defaults = defaultAppDetails[appInfo.type];
          return { id: generateId(), type: appInfo.type, title: appInfo.title || defaults.title, description: appInfo.description || defaults.description };
        });

        const suggestionApps = result.suggestedCommands.map((cmd) => ({
          id: generateId(),
          type: 'ai-suggestion',
          title: cmd,
          description: defaultAppDetails['ai-suggestion'].description,
        }));
        
        if (appsToLaunch.length > 0 || suggestionApps.length > 0) {
            set(state => ({
                apps: [...state.apps, ...appsToLaunch, ...suggestionApps],
            }));
        }

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
