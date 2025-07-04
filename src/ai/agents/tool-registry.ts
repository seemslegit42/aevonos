

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
import { getUsageDetailsForAgent, requestCreditTopUpInDb } from '@/services/billing-service';
import { getDatingProfile } from '@/ai/tools/dating-tools';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { createManualTransaction } from '@/services/ledger-service';
import { getSystemStatus, findUsersByVow, manageSyndicateAccess } from '@/ai/tools/demiurge-tools';
import { transmuteCredits } from '@/ai/tools/proxy-tools';

// Specialist Agent Imports
import { consultDrSyntax, DrSyntaxAgentInputSchema } from './dr-syntax-agent';
import { consultStonksBot, StonksAgentInputSchema } from './stonks-bot-agent';
import { consultCrmAgent } from './crm-agent';
import { generateSolution, WinstonWolfeInputSchema } from './winston-wolfe';
import { analyzeComms, KifKrokerAnalysisInputSchema } from './kif-kroker';
import { createVandelayAlibi, VandelayAlibiInputSchema } from './vandelay';
import { analyzeCandidate, RolodexAnalysisInputSchema } from './rolodex';
import { generateBusinessKit, JrocInputSchema } from './jroc';
import { analyzeLaheyLog, LaheyAnalysisInputSchema } from './lahey';
import { processDailyLog, ForemanatorLogInputSchema } from './foremanator';
import { analyzeCompliance, SterileishAnalysisInputSchema } from './sterileish';
import { scanEvidence, PaperTrailScanInputSchema } from './paper-trail';
import { processDocument, BarbaraInputSchema } from './barbara';
import { auditFinances, AuditorInputSchema } from './auditor-generalissimo';
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


// Tool Schema Imports
import { RequestCreditTopUpInputSchema } from '@/ai/tools/billing-schemas';
import { DatingProfileInputSchema } from '@/ai/tools/dating-schemas';
import { CreateSecurityAlertInputSchema } from '@/ai/tools/security-schemas';
import { CreateManualTransactionInputSchema } from '@/ai/tools/ledger-schemas';
import { FindUsersByVowInputSchema, ManageSyndicateInputSchema } from '@/ai/tools/demiurge-schemas';
import { TransmuteCreditsInputSchema } from '../tools/proxy-schemas';


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
 * The Reasoner should only have access to essential tools, not tools that duplicate
 * the functionality of specialist agents.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getReasonerTools(context: AgentContext): Promise<Tool[]> {
    const { userId, workspaceId, psyche, role } = context;

    const allTools: Tool[] = [
        new FinalAnswerTool(),
        
        new Tool({
            name: 'createSecurityAlert',
            description: 'Creates a security alert in the Aegis system. Use this when the Aegis anomaly scan returns a positive result for a threat. You must provide the type, explanation, and risk level of the alert based on the Aegis report.',
            schema: CreateSecurityAlertInputSchema,
            func: (toolInput) => createSecurityAlertInDb(toolInput, workspaceId, userId),
        }),
    ];

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true }
    });
    const isOwner = workspace?.ownerId === userId;

    if (isOwner) {
        allTools.push(
            new Tool({
                name: 'getSystemStatus',
                description: "Retrieves the current operational status of the entire ΛΞVON OS, including system load and agent performance. Only for the Architect.",
                schema: z.object({}),
                func: getSystemStatus,
            }),
            new Tool({
                name: 'findUsersByVow',
                description: "Finds users based on a keyword from their 'founding vow' or 'sacrifice' made during the Rite of Invocation. Only for the Architect.",
                schema: FindUsersByVowInputSchema,
                func: findUsersByVow,
            }),
             new Tool({
                name: 'manageSyndicateAccess',
                description: "Performs high-level administrative actions on a group of users (a 'Syndicate' or 'Covenant'). Only for the Architect.",
                schema: ManageSyndicateInputSchema,
                func: manageSyndicateAccess,
            })
        );
    }
    
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
        { name: 'dr_syntax', description: 'Critiques content (prompt, code, copy).', schema: DrSyntaxInputSchema.pick({ content: true, contentType: true }) },
        { name: 'stonks_bot', description: 'Provides unhinged financial "advice" on stocks.', schema: StonksBotInputSchema.pick({ ticker: true, mode: true }) },
        { name: 'winston_wolfe', description: 'Solves online reputation problems, typically by generating a response to a negative review.', schema: WinstonWolfeInputSchema.pick({ reviewText: true }) },
        { name: 'kif_kroker', description: 'Analyzes team comms in a Slack channel for morale issues.', schema: KifKrokerAnalysisInputSchema.pick({ channelId: true }) },
        { name: 'vandelay', description: 'Creates a fake calendar invite as an alibi.', schema: VandelayAlibiInputSchema.pick({ topicHint: true, addAttendees: true }).partial() },
        { name: 'rolodex', description: "Analyzes a job candidate's profile against a job description.", schema: RolodexAnalysisInputSchema.pick({ candidateName: true, candidateSummary: true, jobDescription: true }) },
        { name: 'jroc', description: 'Generates a business name, tagline, and logo concept.', schema: JrocInputSchema.pick({ businessType: true, logoStyle: true }) },
        { name: 'lahey_surveillance', description: 'Investigates a suspicious employee log entry.', schema: LaheyAnalysisInputSchema.pick({ logEntry: true }) },
        { name: 'foremanator', description: 'Processes a construction daily log.', schema: ForemanatorLogInputSchema.pick({ logText: true }) },
        { name: 'sterileish', description: 'Analyzes a cleanroom or compliance log.', schema: SterileishAnalysisInputSchema.pick({ logText: true, entryType: true }) },
        { name: 'paper_trail', description: 'Scans a receipt image for expense details.', schema: PaperTrailScanInputSchema.pick({ receiptPhotoUri: true, caseFile: true }).partial() },
        { name: 'barbara', description: 'Processes administrative and compliance documents.', schema: BarbaraInputSchema.pick({ documentText: true, task: true }) },
        { name: 'auditor', description: 'Performs a detailed audit on a list of financial transactions.', schema: AuditorInputSchema.pick({ transactions: true }) },
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
    ];
}

export const specialistAgentMap: Record<string, (input: any, context: AgentContext) => Promise<any>> = {
    crm_agent: (input: any, context: AgentContext) => consultCrmAgent({ ...input, ...context }),
    dr_syntax: (input: any, context: AgentContext) => consultDrSyntax({ ...input, ...context }),
    stonks_bot: (input: any, context: AgentContext) => consultStonksBot({ ...input, ...context }),
    winston_wolfe: (input: any, context: AgentContext) => generateSolution({ ...input, ...context }),
    kif_kroker: (input: any, context: AgentContext) => analyzeComms({ ...input, ...context }),
    vandelay: (input: any, context: AgentContext) => createVandelayAlibi({ ...input, ...context }),
    rolodex: (input: any, context: AgentContext) => analyzeCandidate({ ...input, ...context }),
    jroc: (input: any, context: AgentContext) => generateBusinessKit({ ...input, ...context }),
    lahey_surveillance: (input: any, context: AgentContext) => analyzeLaheyLog({ ...input, ...context }),
    foremanator: (input: any, context: AgentContext) => processDailyLog({ ...input, ...context }),
    sterileish: (input: any, context: AgentContext) => analyzeCompliance({ ...input, ...context }),
    paper_trail: (input: any, context: AgentContext) => scanEvidence({ ...input, ...context }),
    barbara: (input: any, context: AgentContext) => processDocument({ ...input, ...context }),
    auditor: (input: any, context: AgentContext) => auditFinances({ ...input, ...context }),
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
};


/**
 * Creates and returns a context-aware array of LangChain Tools for all specialist agents.
 * This is used by the BEEP planner to route commands.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getSpecialistTools(context: AgentContext): Promise<Tool[]> {
    const definitions = getSpecialistAgentDefinitions();
    const tools = definitions.map(def => {
        const func = specialistAgentMap[def.name];
        if (!func) {
            throw new Error(`No implementation found for specialist agent: ${def.name}`);
        }
        return new Tool({
            name: def.name,
            description: def.description,
            schema: def.schema,
            func: (input: any) => func(input, context),
        });
    });
    return tools;
}
