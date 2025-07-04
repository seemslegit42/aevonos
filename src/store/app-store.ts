
'use client';

import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { produce } from 'immer';
import { artifactManifests } from '@/config/artifacts';
import { toast } from '@/hooks/use-toast';
import { agentReportHandlers } from './agent-report-handler';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { calculateNewAppPosition } from '@/lib/app-window-utils';


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

/**
 * The central client-side state management for the application.
 * Manages the state of all open Micro-Apps, agent interactions, and UI state.
 */
export interface AppStore {
  /** An array of all currently open Micro-Apps on the canvas. */
  apps: MicroApp[];
  /** The ID of the currently focused Micro-App. */
  activeAppId: string | null;
  /** The next z-index value to be assigned to a new or focused app, ensuring it appears on top. */
  nextZIndex: number;
  /** Flag indicating if BEEP is currently processing a command. */
  isLoading: boolean;
  /** The most recent output from the BEEP agent. */
  beepOutput: UserCommandOutput | null;
  /** The position where the last new app was opened, used for cascading new windows. */
  lastAppPosition: { x: number; y: number } | null;

  /**
   * Creates a new Micro-App or updates an existing one. If an app with the same ID exists,
   * it's updated with the provided properties and brought to the front. If not, a new app
   * is created with a calculated cascading position and size.
   * @param type The type of the Micro-App to create (e.g., 'terminal').
   * @param partialApp An object containing properties to override the defaults, such as `id` or `contentProps`.
   */
  upsertApp: (type: MicroAppType, partialApp: Partial<MicroApp>) => void;
  
  /**
   * Closes a Micro-App, removing it from the canvas.
   * @param id The unique ID of the Micro-App to close.
   */
  closeApp: (id: string) => void;

  /**
   * Brings a specific Micro-App to the front of the view stack.
   * @param id The unique ID of the Micro-App to bring to the front.
   */
  bringToFront: (id: string) => void;

  /**
   * Updates the size of a Micro-App.
   * @param id The unique ID of the Micro-App to resize.
   * @param size The new width and height of the app.
   */
  handleResize: (id: string, size: { width: number; height: number }) => void;

  /**
   * Updates the position of a Micro-App after a drag-and-drop operation.
   * @param event The event object from the DndContext.
   */
  handleDragEnd: (event: any) => void;

  /**
   * Submits a natural language command to the BEEP agent for processing.
   * This is the primary method for user interaction with the OS's intelligence layer.
   * @param command The natural language command string from the user.
   * @param activeAppContext The optional type of the currently active app for contextual awareness.
   */
  handleCommandSubmit: (command: string, activeAppContext?: string) => Promise<void>;

  /**
   * A placeholder for future functionality where an app can trigger an internal action.
   * @param id The unique ID of the app triggering the action.
   */
  triggerAppAction: (id: string) => void;
}


export const useAppStore = create<AppStore>()((set, get) => ({
  apps: [],
  activeAppId: null,
  nextZIndex: 10,
  isLoading: false,
  beepOutput: null,
  lastAppPosition: null,

  upsertApp: (type, partialApp) => {
    set(
      produce((state: AppStore) => {
        const existingAppIndex = state.apps.findIndex(
          (app) => app.id === partialApp.id
        );
        const zIndex = state.nextZIndex + 1;

        if (existingAppIndex > -1) {
          // If app exists, update it and bring to front
          const existingApp = state.apps[existingAppIndex];
          state.apps[existingAppIndex] = {
            ...existingApp,
            ...partialApp,
            // Merge contentProps instead of overwriting
            contentProps: {
                ...existingApp.contentProps,
                ...partialApp.contentProps,
            },
            zIndex,
          };
        } else {
          // This logic can only run on the client.
          if (typeof window === 'undefined') return;

          // If app is new, calculate its position and size
          const { position, size } = calculateNewAppPosition({
              appType: type,
              lastPosition: state.lastAppPosition,
          });

          // Update last position for cascading
          const isMobile = window.innerWidth < 768;
          state.lastAppPosition = isMobile ? null : position;
          
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
         // If the closed app was the last one, reset the cascading position
        if (state.apps.length === 0) {
            state.lastAppPosition = null;
        }
      })
    );
  },

  bringToFront: (id) => {
    set(
      produce((state: AppStore) => {
        const appIndex = state.apps.findIndex((app) => app.id === id);
        if (appIndex > -1 && state.apps[appIndex].zIndex < state.nextZIndex) {
            const zIndex = state.nextZIndex + 1;
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
    
    // Show a toast for text-only responses
    if (result.responseText && (!result.appsToLaunch || result.appsToLaunch.length === 0)) {
        toast({
            title: "BEEP",
            description: result.responseText,
        });
    }

    // Process agent reports using the new handler
    if (result.agentReports) {
      for (const report of result.agentReports) {
        // Look up the handler for the specific agent report type
        const handler = agentReportHandlers[report.agent as keyof typeof agentReportHandlers];
        if (handler) {
          // Pass the specific report data and the entire store instance to the handler
          handler(report.report as any, get());
        }
      }
    }
    
    if (result.appsToLaunch) {
        for (const app of result.appsToLaunch) {
            get().upsertApp(app.type, app);
        }
    }

    set({ beepOutput: result });
    set({ isLoading: false });
  },

  triggerAppAction: (id) => {
    console.log(`Action triggered for app: ${id}`);
    // This is a placeholder for future functionality.
  },
}));
