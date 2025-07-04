

/**
 * @fileOverview This file defines the central tool registry for the BEEP agent.
 * It uses a factory pattern to create context-aware tool instances.
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { UserPsyche, UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';

import {
    UserCommandOutputSchema,
    CrmActionSchema,
} from '../agents/beep-schemas';

// Tool Service Imports
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';

// Specialist Agent Imports
import { consultDrSyntax, DrSyntaxAgentInputSchema } from './dr-syntax-agent';
import { consultStonksBot, StonksAgentInputSchema } from './stonks-bot-agent';
import { consultCrmAgent } from './crm-agent';
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
import { generateWingmanMessage, WingmanInputSchema } from './wingman';
import { getKendraTake, KendraInputSchema } from './kendra';
import { invokeOracle, OrpheanOracleInputSchema } from './orphean-oracle-flow';
import { analyzeInvite, LumberghAnalysisInputSchema } from './lumbergh';
import { analyzeExpense, LucilleBluthInputSchema } from './lucille-bluth';
import { generatePamRant, PamScriptInputSchema } from './pam-poovey';
import { analyzeCarShame, RenoModeAnalysisInputSchema } from './reno-mode';
import { processPatricktAction, PatricktAgentInputSchema } from './patrickt-agent';
import { validateVin, VinDieselInputSchema } from './vin-diesel';
import { consultInventoryDaemon } from './inventory-daemon';
import { generateRitualQuests, RitualQuestInputSchema } from './ritual-quests-agent';
import { executeBurnBridgeProtocol, BurnBridgeInputSchema } from './burn-bridge-agent';
import { consultVaultDaemon, VaultQueryInputSchema } from './vault-daemon';
import { consultDemiurge, DemiurgeActionSchema } from './demiurge-agent';


// Tool Schema Imports
import { CreateSecurityAlertInputSchema } from '@/ai/tools/security-schemas';


// Context for multi-tenancy and personalization
interface AgentContext {
    userId: string;
    workspaceId: string;
    psyche: UserPsyche;
    role: UserRole;
}

// This tool is a container for the final structured output.
// The model is instructed to call this tool when its work is complete.
class FinalAnswerTool extends Tool {
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
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getReasonerTools(context: AgentContext): Promise<Tool[]> {
    // The reasoner's only job is to synthesize the final answer.
    // All other actions should be handled by specialist agents.
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

export function getSpecialistAgentDefinitions(): SpecialistAgentDefinition[] {
    return [
        { name: 'crm_agent', description: 'Manages contacts (create, list, update, delete).', schema: CrmActionSchema },
        { name: 'dr_syntax', description: 'Critiques content (prompt, code, copy).', schema: DrSyntaxAgentInputSchema.pick({ content: true, contentType: true }) },
        { name: 'stonks_bot', description: 'Provides unhinged financial "advice" on stocks.', schema: StonksAgentInputSchema.pick({ ticker: true, mode: true }) },
        { name: 'winston_wolfe', description: 'Solves online reputation problems, typically by generating a response to a negative review.', schema: WinstonWolfeAgentInputSchema.pick({ reviewText: true }) },
        { name: 'kif_kroker', description: 'Analyzes team comms in a Slack channel for morale issues.', schema: KifKrokerAgentInputSchema.pick({ channelId: true }) },
        { name: 'vandelay', description: 'Creates a fake calendar invite as an alibi.', schema: VandelayAgentInputSchema.pick({ topicHint: true, addAttendees: true }).partial() },
        { name: 'rolodex', description: "Analyzes a job candidate's profile against a job description.", schema: RolodexAgentInputSchema.pick({ candidateName: true, candidateSummary: true, jobDescription: true }) },
        { name: 'jroc', description: 'Generates a business name, tagline, and logo concept.', schema: JrocAgentInputSchema.pick({ businessType: true, logoStyle: true }) },
        { name: 'lahey_surveillance', description: 'Investigates a suspicious employee log entry.', schema: LaheyAgentInputSchema.pick({ logEntry: true }) },
        { name: 'foremanator', description: 'Processes a construction daily log.', schema: ForemanatorAgentInputSchema.pick({ logText: true }) },
        { name: 'sterileish', description: 'Analyzes a cleanroom or compliance log.', schema: SterileishAgentInputSchema.pick({ logText: true, entryType: true }) },
        { name: 'paper_trail', description: 'Scans a receipt image for expense details.', schema: PaperTrailAgentInputSchema.pick({ receiptPhotoUri: true, caseFile: true }).partial() },
        { name: 'barbara', description: 'Processes administrative and compliance documents.', schema: BarbaraAgentInputSchema.pick({ documentText: true, task: true }) },
        { name: 'auditor', description: 'Performs a detailed audit on a list of financial transactions.', schema: AuditorAgentInputSchema.pick({ transactions: true }) },
        { name: 'wingman', description: 'Helps craft a message for a tricky social situation.', schema: WingmanInputSchema.pick({ situationContext: true, messageMode: true }) },
        { name: 'kendra', description: 'Generates a marketing campaign for a product idea.', schema: KendraInputSchema.pick({ productIdea: true }) },
        { name: 'orphean_oracle', description: 'Generates a narrative, visual story about business data.', schema: OrpheanOracleInputSchema.pick({ userQuery: true }) },
        { name: 'lumbergh', description: 'Analyzes a meeting invite for pointlessness.', schema: LumberghAnalysisInputSchema.pick({ inviteText: true }) },
        { name: 'lucille_bluth', description: 'Gets a sarcastic take on an expense.', schema: LucilleBluthInputSchema.pick({ expenseDescription: true, expenseAmount: true, category: true }) },
        { name: 'pam_poovey', description: 'Generates HR-related rants or scripts in a specific persona.', schema: PamScriptInputSchema.pick({ topic: true }) },
        { name: 'reno_mode', description: 'Analyzes a photo of a messy car.', schema: RenoModeAnalysisInputSchema.pick({ photoDataUri: true }) },
        { name: 'patrickt_app', description: 'Logs events, gets roasts, or analyzes drama in the "Patrickt" saga.', schema: PatricktAgentInputSchema.pick({ action: true, eventDescription: true, eventCategory: true, chatInput: true }).partial() },
        { name: 'vin_diesel', description: 'Validates a Vehicle Identification Number (VIN).', schema: VinDieselInputSchema.pick({ vin: true }) },
        { name: 'inventory_daemon', description: 'Handles requests about stock, inventory, or purchase orders.', schema: z.object({ query: z.string() }) },
        { name: 'ritual_quests', description: 'Gets the user their current ritual quests to guide their journey.', schema: RitualQuestInputSchema.omit({ workspaceId: true }) },
        { name: 'burn_bridge_protocol', description: 'Performs a full-spectrum investigation (OSINT, analysis, decoy) on a person.', schema: BurnBridgeInputSchema.omit({ workspaceId: true, userId: true }) },
        { name: 'vault_daemon', description: 'Handles requests about finance, revenue, profit, or spending.', schema: VaultQueryInputSchema.omit({ workspaceId: true, userId: true }) },
        {
            name: 'demiurge',
            description: "Performs god-level administrative actions on the workspace, such as querying system status or finding users by their vows. Only available to the workspace Architect.",
            schema: DemiurgeActionSchema,
        },
    ];
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
    wingman: (input: any, context: AgentContext) => generateWingmanMessage({ ...input, ...context }),
    kendra: (input: any, context: AgentContext) => getKendraTake({ ...input, ...context }),
    orphean_oracle: (input: any, context: AgentContext) => invokeOracle({ ...input, ...context }),
    lumbergh: (input: any, context: AgentContext) => analyzeInvite({ ...input, ...context }),
    lucille_bluth: (input: any, context: AgentContext) => analyzeExpense({ ...input, ...context }),
    pam_poovey: (input: any, context: AgentContext) => generatePamRant({ ...input, ...context }),
    reno_mode: (input: any, context: AgentContext) => analyzeCarShame({ ...input, ...context }),
    patrickt_app: (input: any, context: AgentContext) => processPatricktAction({ ...input, ...context }),
    vin_diesel: (input: any, context: AgentContext) => validateVin({ ...input, ...context }),
    inventory_daemon: (input: any, context: AgentContext) => consultInventoryDaemon({ ...input }),
    ritual_quests: (input: any, context: AgentContext) => generateRitualQuests({ ...input, ...context }),
    burn_bridge_protocol: (input: any, context: AgentContext) => executeBurnBridgeProtocol({ ...input, ...context }),
    vault_daemon: (input: any, context: AgentContext) => consultVaultDaemon({ ...input, ...context }),
    demiurge: (input: any, context: AgentContext) => consultDemiurge({ ...input, ...context }),
};
