

/**
 * @fileOverview This file defines the central tool registry for the BEEP agent.
 * It uses a factory pattern to create context-aware tool instances and now
 * categorizes specialist agents for the hierarchical router.
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { UserPsyche, UserRole } from '@prisma/client';

import {
    UserCommandOutputSchema,
    TriageCategory,
} from '../agents/beep-schemas';

// Specialist Agent Imports and Schemas
import { consultDrSyntax, DrSyntaxAgentInputSchema } from './dr-syntax-agent';
import { consultStonksBot, StonksAgentInputSchema } from './stonks-bot-agent';
import { consultCrmAgent, CrmActionSchema } from './crm-agent';
import { consultWinstonWolfe, WinstonWolfeAgentInputSchema } from './winston-wolfe-agent';
import { consultKifKroker, KifKrokerAgentInputSchema } from './kif-kroker-agent';
import { consultVandelay, VandelayAgentInputSchema } from './vandelay-agent';
import { consultRolodex, RolodexAgentInputSchema } from './rolodex-agent';
import { consultJroc, JrocAgentInputSchema } from './jroc-agent';
import { consultLahey, LaheyAgentInputSchema } from './lahey-agent';
import { consultForemanator, ForemanatorAgentInputSchema } from './foremanator-agent';
import { consultSterileish, SterileishAgentInputSchema } from './sterileish-agent';
import { consultPaperTrail, PaperTrailAgentInputSchema } from './paper-trail-agent';
import { consultBarbara, BarbaraAgentInputSchema } from './barbara-agent';
import { consultAuditor, AuditorAgentInputSchema } from './auditor-agent';
import { consultWingman, WingmanAgentInputSchema } from './wingman-agent';
import { consultKendra, KendraAgentInputSchema } from './kendra-agent';
import { consultOrpheanOracle, OrpheanOracleAgentInputSchema } from './orphean-oracle-agent';
import { consultLumbergh, LumberghAgentInputSchema } from './lumbergh-agent';
import { consultLucille, LucilleBluthAgentInputSchema } from './lucille-bluth-agent';
import { consultPam, PamPooveyAgentInputSchema } from './pam-poovey-agent';
import { consultRenoMode, RenoModeAgentInputSchema } from './reno-mode-agent';
import { consultPatrickt, PatricktAgentInputSchema } from './patrickt-agent';
import { consultVinDiesel, VinDieselAgentInputSchema } from './vin-diesel-agent';
import { consultInventoryDaemon } from './inventory-daemon';
import { generateRitualQuests, RitualQuestInputSchema } from './ritual-quests-agent';
import { executeBurnBridgeProtocol, BurnBridgeInputSchema } from './burn-bridge-agent';
import { consultVaultDaemon, VaultQueryInputSchema } from './vault-daemon';
import { consultDemiurge, DemiurgeActionSchema } from './demiurge-agent';


// Context for multi-tenancy and personalization
interface AgentContext {
    userId: string;
    workspaceId: string;
    psyche: UserPsyche;
    role: UserRole;
}

// This tool is a container for the final structured output.
// The model is instructed to call this tool when its work is complete.
export class FinalAnswerTool extends Tool {
  name = 'final_answer';
  description = 'Call this tool when you have gathered all necessary information and are ready to provide the final response to the user. The output should conform to the UserCommandOutputSchema.';
  schema = UserCommandOutputSchema.omit({ agentReports: true, responseAudioUri: true }); // Agent reports are aggregated by the graph.
  
  async _call(input: z.infer<typeof this.schema>) {
    // This tool doesn't "do" anything except structure the output.
    // The return value is not used in the main graph loop.
    return JSON.stringify(input);
  }
}

/**
 * Creates and returns a context-aware array of tools for the BEEP agent's REASONER.
 * The Reasoner should only have access to essential tools, not tools that duplicate
 * the functionality of specialist agents.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getReasonerTools(context: AgentContext): Promise<Tool[]> {
    // The reasoner's only job is to synthesize the final answer.
    const allTools: Tool[] = [
        new FinalAnswerTool(),
    ];
    
    return allTools;
}

export type SpecialistAgentDefinition = {
    name: string;
    description: string;
    schema: z.ZodSchema<any>;
};

// --- NEW ---
/**
 * Provides a categorized map of all specialist agent definitions.
 * This structure supports the hierarchical routing logic in the BEEP agent.
 * @returns A record mapping TriageCategory to an array of SpecialistAgentDefinitions.
 */
export function getCategorizedSpecialistAgentDefinitions(): Record<TriageCategory, SpecialistAgentDefinition[]> {
    return {
        CRM: [
            { name: 'crm_agent', description: 'Manages contacts (create, list, update, delete).', schema: CrmActionSchema },
            { name: 'rolodex', description: "Analyzes a job candidate's profile against a job description.", schema: RolodexAgentInputSchema.pick({ candidateName: true, candidateSummary: true, jobDescription: true }) },
        ],
        FINANCE: [
            { name: 'stonks_bot', description: 'Provides unhinged financial "advice" on stocks.', schema: StonksAgentInputSchema.pick({ ticker: true, mode: true }) },
            { name: 'auditor', description: 'Performs a detailed audit on a list of financial transactions.', schema: AuditorAgentInputSchema.pick({ transactions: true }) },
            { name: 'vault_daemon', description: 'Handles requests about finance, revenue, profit, or spending.', schema: VaultQueryInputSchema.omit({ workspaceId: true, userId: true }) },
            { name: 'lucille_bluth', description: 'Gets a sarcastic take on an expense.', schema: LucilleBluthInputSchema.pick({ expenseDescription: true, expenseAmount: true, category: true }) },
        ],
        CONTENT_ANALYSIS: [
            { name: 'dr_syntax', description: 'Critiques content (prompt, code, copy).', schema: DrSyntaxAgentInputSchema.pick({ content: true, contentType: true }) },
            { name: 'wingman', description: 'Helps craft a message for a tricky social situation.', schema: WingmanInputSchema.pick({ situationContext: true, messageMode: true }) },
            { name: 'kendra', description: 'Generates a marketing campaign for a product idea.', schema: KendraAgentInputSchema.pick({ productIdea: true }) },
            { name: 'orphean_oracle', description: 'Generates a narrative, visual story about business data.', schema: OrpheanOracleInputSchema.pick({ userQuery: true }) },
            { name: 'pam_poovey', description: 'Generates HR-related rants or scripts in a specific persona.', schema: PamPooveyAgentInputSchema.pick({ topic: true }) },
        ],
        ADMINISTRATION: [
            { name: 'kif_kroker', description: 'Analyzes team comms in a Slack channel for morale issues.', schema: KifKrokerAgentInputSchema.pick({ channelId: true }) },
            { name: 'foremanator', description: 'Processes a construction daily log.', schema: ForemanatorAgentInputSchema.pick({ logText: true }) },
            { name: 'sterileish', description: 'Analyzes a cleanroom or compliance log.', schema: SterileishAnalysisInputSchema.pick({ logText: true, entryType: true }) },
            { name: 'barbara', description: 'Processes administrative and compliance documents.', schema: BarbaraInputSchema.pick({ documentText: true, task: true }) },
            { name: 'vin_diesel', description: 'Validates a Vehicle Identification Number (VIN).', schema: VinDieselAgentInputSchema.pick({ vin: true }) },
        ],
        ENTERTAINMENT: [
            { name: 'jroc', description: 'Generates a business name, tagline, and logo concept.', schema: JrocInputSchema.pick({ businessType: true, logoStyle: true }) },
            { name: 'lahey_surveillance', description: 'Investigates a suspicious employee log entry.', schema: LaheyAgentInputSchema.pick({ logEntry: true }) },
            { name: 'reno_mode', description: 'Analyzes a photo of a messy car.', schema: RenoModeAgentInputSchema.pick({ photoDataUri: true }) },
            { name: 'patrickt_app', description: 'Logs events, gets roasts, or analyzes drama in the "Patrickt" saga.', schema: PatricktAgentInputSchema.pick({ action: true, eventDescription: true, eventCategory: true, chatInput: true }).partial() },
            { name: 'lumbergh', description: 'Analyzes a meeting invite for pointlessness.', schema: LumberghAnalysisInputSchema.pick({ inviteText: true }) },
        ],
        WORKSPACE_MANAGEMENT: [
            { name: 'demiurge', description: "Performs god-level administrative actions on the workspace, such as querying system status or finding users by their vows. Only available to the workspace Architect.", schema: DemiurgeActionSchema },
            { name: 'ritual_quests', description: 'Gets the user their current ritual quests to guide their journey.', schema: RitualQuestInputSchema.omit({ workspaceId: true }) },
            { name: 'inventory_daemon', description: 'Handles requests about stock, inventory, or purchase orders.', schema: z.object({ query: z.string() }) },
        ],
        GENERAL_UTILITY: [
            { name: 'vandelay', description: 'Creates a fake calendar invite as an alibi.', schema: VandelayAlibiInputSchema.pick({ topicHint: true, addAttendees: true }).partial() },
            { name: 'paper_trail', description: 'Scans a receipt image for expense details.', schema: PaperTrailAgentInputSchema.pick({ receiptPhotoUri: true, caseFile: true }).partial() },
            { name: 'winston_wolfe', description: 'Solves online reputation problems, typically by generating a response to a negative review.', schema: WinstonWolfeAgentInputSchema.pick({ reviewText: true }) },
            { name: 'burn_bridge_protocol', description: 'Performs a full-spectrum investigation (OSINT, analysis, decoy) on a person.', schema: BurnBridgeInputSchema.omit({ workspaceId: true, userId: true }) },
        ],
        NOT_APPLICABLE: [],
    };
}
// --- END NEW ---

export function getSpecialistAgentDefinitions(): SpecialistAgentDefinition[] {
    // Return a flattened list of all categorized definitions for the general planner.
    return Object.values(getCategorizedSpecialistAgentDefinitions()).flat();
}

export const specialistAgentMap: Record<string, (input: any, context: AgentContext) => Promise<any>> = {
    crm_agent: (input: any, context: AgentContext) => consultCrmAgent({ ...input, ...context }),
    dr_syntax: (input: any, context: AgentContext) => consultDrSyntax({ ...input, ...context }),
    stonks_bot: (input: any, context: AgentContext) => consultStonksBot({ ...input, ...context }),
    winston_wolfe: (input: any, context: AgentContext) => consultWinstonWolfe({ ...input, ...context }),
    kif_kroker: (input: any, context: AgentContext) => consultKifKroker({ ...input, ...context }),
    vandelay: (input: any, context: AgentContext) => consultVandelay({ ...input, ...context }),
    rolodex: (input: any, context: AgentContext) => consultRolodex({ ...input, ...context }),
    jroc: (input: any, context: AgentContext) => consultJroc({ ...input, ...context }),
    lahey_surveillance: (input: any, context: AgentContext) => consultLahey({ ...input, ...context }),
    foremanator: (input: any, context: AgentContext) => consultForemanator({ ...input, ...context }),
    sterileish: (input: any, context: AgentContext) => consultSterileish({ ...input, ...context }),
    paper_trail: (input: any, context: AgentContext) => consultPaperTrail({ ...input, ...context }),
    barbara: (input: any, context: AgentContext) => consultBarbara({ ...input, ...context }),
    auditor: (input: any, context: AgentContext) => consultAuditor({ ...input, ...context }),
    wingman: (input: any, context: AgentContext) => consultWingman({ ...input, ...context }),
    kendra: (input: any, context: AgentContext) => consultKendra({ ...input, ...context }),
    orphean_oracle: (input: any, context: AgentContext) => consultOrpheanOracle({ ...input, ...context }),
    lumbergh: (input: any, context: AgentContext) => consultLumbergh({ ...input, ...context }),
    lucille_bluth: (input: any, context: AgentContext) => consultLucille({ ...input, ...context }),
    pam_poovey: (input: any, context: AgentContext) => consultPam({ ...input, ...context }),
    reno_mode: (input: any, context: AgentContext) => consultRenoMode({ ...input, ...context }),
    patrickt_app: (input: any, context: AgentContext) => consultPatrickt({ ...input, ...context }),
    vin_diesel: (input: any, context: AgentContext) => consultVinDiesel({ ...input, ...context }),
    inventory_daemon: (input: any, context: AgentContext) => consultInventoryDaemon({ ...input, ...context }),
    ritual_quests: (input: any, context: AgentContext) => generateRitualQuests({ ...input, ...context }),
    burn_bridge_protocol: (input: any, context: AgentContext) => executeBurnBridgeProtocol({ ...input, ...context }),
    vault_daemon: (input: any, context: AgentContext) => consultVaultDaemon({ ...input, ...context }),
    demiurge: (input: any, context: AgentContext) => consultDemiurge({ ...input, ...context }),
};
