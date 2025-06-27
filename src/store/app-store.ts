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
  | 'infidelity-radar';

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
  'contact-list': { type: 'contact-list', title: 'Contact List', description: 'A list of contacts from the CRM.' },
  'pam-poovey-onboarding': { type: 'pam-poovey-onboarding', title: 'Pam Poovey: HR', description: 'Onboarding, complaints, and questionable life advice.' },
  'beep-wingman': { type: 'beep-wingman', title: 'BEEP™ Wingman', description: 'Dating Automation for High-Functioning Degenerates.' },
  'infidelity-radar': { type: 'infidelity-radar', title: 'Infidelity Radar', description: 'Because intuition deserves evidence.' },
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


export const useAppStore = create<AppState>((set, get) => ({
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
      // Dummy data for now. In a real scenario, this would come from a persisted log.
      const dummyActivity = `User opened File Explorer.
User ran 'critique this copy' in Dr. Syntax.
User ran an Aegis scan at 14:32.
User launched Loom Studio to inspect 'Client Onboarding' workflow.`;

      const result: SessionRecallOutput = await recallSessionAction({ sessionActivity: dummyActivity });
      
      toast({
        title: 'Echo Remembers',
        description: React.createElement(EchoRecallToast, result),
      });
    } catch (error) {
      console.error('Error recalling session:', error);
      toast({
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
    
    // Clear previous suggestions before executing a new command.
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
          id: generateId(),
          type: appInfo.type,
          title: appInfo.title || defaults.title,
          description: appInfo.description || defaults.description,
        };
      });

      // Handle agent reports
      if (result.agentReports) {
        // First, find and process the Aegis report to create or update its micro-app
        const aegisReport = result.agentReports.find(r => r.agent === 'aegis')?.report;

        if (aegisReport) {
            const aegisAppId = 'aegis-report-main';
            const newAegisApp: MicroApp = {
                id: aegisAppId,
                type: 'aegis-control',
                title: defaultAppDetails['aegis-control'].title,
                description: '', // Description is handled by the content component
                contentProps: { ...aegisReport }
            };

            set(state => {
                const existingApp = state.apps.find(a => a.id === aegisAppId);
                if (existingApp) {
                    return { apps: state.apps.map(a => a.id === aegisAppId ? newAegisApp : a) };
                } else {
                    const echoIndex = state.apps.findIndex(a => a.type === 'echo-control');
                    const newApps = [...state.apps];
                    newApps.splice(echoIndex !== -1 ? echoIndex + 1 : 0, 0, newAegisApp);
                    return { apps: newApps };
                }
            });

            // Also show a toast, but only if anomalous
            if (aegisReport.isAnomalous) {
                toast({
                    title: 'Aegis Alert',
                    description: aegisReport.anomalyExplanation,
                    variant: 'destructive',
                });
            }
        }

        for (const agentReport of result.agentReports) {
          if (agentReport.agent === 'aegis') {
            continue; // Handled above
          }
          if (agentReport.agent === 'dr-syntax') {
            const report: DrSyntaxOutput = agentReport.report;
            toast({
                title: `Dr. Syntax's Verdict (Rating: ${report.rating}/10)`,
                description: React.createElement(DrSyntaxReportToast, report)
            });
          }
          if (agentReport.agent === 'crm') {
            const crmReport = agentReport.report;
            if (crmReport.action === 'create') {
                toast({
                  title: 'CRM Agent',
                  description: `Contact "${crmReport.report.firstName} ${crmReport.report.lastName}" created successfully.`,
                });
            } else if (crmReport.action === 'update') {
                const updatedContact = crmReport.report;
                toast({
                    title: 'CRM Agent',
                    description: `Contact "${updatedContact.firstName} ${updatedContact.lastName}" was updated.`,
                });
                set(state => ({
                    apps: state.apps.map(app => {
                        if (app.type === 'contact-list' && app.contentProps?.contacts) {
                            return {
                                ...app,
                                contentProps: {
                                    ...app.contentProps,
                                    contacts: app.contentProps.contacts.map((c: Contact) => c.id === updatedContact.id ? updatedContact : c)
                                }
                            };
                        }
                        return app;
                    })
                }));
            } else if (crmReport.action === 'list') {
                const contacts = crmReport.report;
                const appId = 'contact-list-main';
                set(state => {
                    const existingApp = state.apps.find(a => a.id === appId);
                    if (existingApp) {
                        return {
                            apps: state.apps.map(a => a.id === appId ? {...a, title: "Contact List", description: "A list of your contacts.", contentProps: { contacts }} : a)
                        };
                    } else {
                        const newApp: MicroApp = {
                            id: appId,
                            type: 'contact-list',
                            title: 'Contact List',
                            description: 'A list of your contacts.',
                            contentProps: { contacts },
                        };
                        return { apps: [...state.apps, newApp] };
                    }
                });
            } else if (crmReport.action === 'delete') {
                const { id: deletedId, success } = crmReport.report;
                if (success) {
                    toast({ title: 'CRM Agent', description: 'Contact deleted successfully.' });
                    set(state => ({
                        apps: state.apps.map(app => {
                            if (app.type === 'contact-list' && app.contentProps?.contacts) {
                                return {
                                    ...app,
                                    contentProps: {
                                        ...app.contentProps,
                                        contacts: app.contentProps.contacts.filter((c: Contact) => c.id !== deletedId)
                                    }
                                };
                            }
                            return app;
                        })
                    }));
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'CRM Agent Error',
                        description: 'Failed to delete contact.',
                    });
                }
            }
          }
        }
      }

      const suggestionApps: MicroApp[] = result.suggestedCommands.map((cmd) => ({
        id: generateId(),
        type: 'ai-suggestion',
        title: cmd,
        description: defaultAppDetails['ai-suggestion'].description,
      }));

      set(state => ({
        apps: [...state.apps, ...appsToLaunch, ...suggestionApps],
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
