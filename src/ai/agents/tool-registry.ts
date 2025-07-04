

/**
 * @fileOverview This file defines the central tool registry for the BEEP agent.
 * It uses a factory pattern to create context-aware tool instances.
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { UserPsyche, UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';

import { UserCommandOutputSchema } from '../agents/beep-schemas';

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
import { consultCrmAgent, CrmAgentInputSchema } from './crm-agent';
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
 * Creates and returns a context-aware array of tools for the BEEP agent's PLANNER.
 * These are wrappers around the specialist agents.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getSpecialistTools(context: AgentContext): Promise<Tool[]> {
    const specialistTools: Tool[] = [
        new Tool({ name: 'crm_agent', description: 'Manages contacts (create, list, update, delete).', schema: CrmAgentInputSchema.omit({workspaceId: true, userId: true}), func: async (input) => JSON.stringify(await consultCrmAgent({ ...input, ...context })) }),
        new Tool({ name: 'dr_syntax', description: 'Critiques content (prompt, code, copy).', schema: DrSyntaxAgentInputSchema.pick({ content: true, contentType: true }), func: async (input) => JSON.stringify(await consultDrSyntax({ ...input, ...context })) }),
        new Tool({ name: 'stonks_bot', description: 'Provides unhinged financial "advice" on stocks.', schema: StonksAgentInputSchema.pick({ ticker: true, mode: true }), func: async (input) => JSON.stringify(await consultStonksBot({ ...input, ...context })) }),
        new Tool({ name: 'winston_wolfe', description: 'Solves online reputation problems.', schema: WinstonWolfeInputSchema.pick({ reviewText: true }), func: async (input) => JSON.stringify(await generateSolution({ ...input, ...context })) }),
        new Tool({ name: 'kif_kroker', description: 'Analyzes team comms in a Slack channel for morale issues.', schema: KifKrokerAnalysisInputSchema.pick({ channelId: true }), func: async (input) => JSON.stringify(await analyzeComms({ ...input, ...context })) }),
        new Tool({ name: 'vandelay', description: 'Creates a fake calendar invite as an alibi.', schema: VandelayAlibiInputSchema.pick({ topicHint: true, addAttendees: true }).partial(), func: async (input) => JSON.stringify(await createVandelayAlibi({ ...input, ...context })) }),
        new Tool({ name: 'rolodex', description: "Analyzes a job candidate's profile against a job description.", schema: RolodexAnalysisInputSchema.pick({ candidateName: true, candidateSummary: true, jobDescription: true }), func: async (input) => JSON.stringify(await analyzeCandidate({ ...input, ...context })) }),
        new Tool({ name: 'jroc', description: 'Generates a business name, tagline, and logo concept.', schema: JrocInputSchema.pick({ businessType: true, logoStyle: true }), func: async (input) => JSON.stringify(await generateBusinessKit({ ...input, ...context })) }),
        new Tool({ name: 'lahey_surveillance', description: 'Investigates a suspicious employee log entry.', schema: LaheyAnalysisInputSchema.pick({ logEntry: true }), func: async (input) => JSON.stringify(await analyzeLaheyLog({ ...input, ...context })) }),
        new Tool({ name: 'foremanator', description: 'Processes a construction daily log.', schema: ForemanatorLogInputSchema.pick({ logText: true }), func: async (input) => JSON.stringify(await processDailyLog({ ...input, ...context })) }),
        new Tool({ name: 'sterileish', description: 'Analyzes a cleanroom or compliance log.', schema: SterileishAnalysisInputSchema.pick({ logText: true, entryType: true }), func: async (input) => JSON.stringify(await analyzeCompliance({ ...input, ...context })) }),
        new Tool({ name: 'paper_trail', description: 'Scans a receipt image for expense details.', schema: PaperTrailScanInputSchema.pick({ receiptPhotoUri: true, caseFile: true }).partial(), func: async (input) => JSON.stringify(await scanEvidence({ ...input, ...context })) }),
        new Tool({ name: 'barbara', description: 'Processes administrative and compliance documents.', schema: BarbaraInputSchema.pick({ documentText: true, task: true }), func: async (input) => JSON.stringify(await processDocument({ ...input, ...context })) }),
        new Tool({ name: 'auditor', description: 'Performs a detailed audit on a list of financial transactions.', schema: AuditorInputSchema.pick({ transactions: true }), func: async (input) => JSON.stringify(await auditFinances({ ...input, ...context })) }),
        new Tool({ name: 'wingman', description: 'Helps craft a message for a tricky social situation.', schema: WingmanInputSchema.pick({ situationContext: true, messageMode: true }), func: async (input) => JSON.stringify(await generateWingmanMessage({ ...input, ...context })) }),
        new Tool({ name: 'kendra', description: 'Generates a marketing campaign for a product idea.', schema: KendraInputSchema.pick({ productIdea: true }), func: async (input) => JSON.stringify(await getKendraTake({ ...input, ...context })) }),
        new Tool({ name: 'orphean_oracle', description: 'Generates a narrative, visual story about business data.', schema: OrpheanOracleInputSchema.pick({ userQuery: true }), func: async (input) => JSON.stringify(await invokeOracle({ ...input, ...context })) }),
        new Tool({ name: 'lumbergh', description: 'Analyzes a meeting invite for pointlessness.', schema: LumberghAnalysisInputSchema.pick({ inviteText: true }), func: async (input) => JSON.stringify(await analyzeInvite({ ...input, ...context })) }),
        new Tool({ name: 'lucille_bluth', description: 'Gets a sarcastic take on an expense.', schema: LucilleBluthInputSchema.pick({ expenseDescription: true, expenseAmount: true, category: true }), func: async (input) => JSON.stringify(await analyzeExpense({ ...input, ...context })) }),
        new Tool({ name: 'pam_poovey', description: 'Generates HR-related rants or scripts in a specific persona.', schema: PamScriptInputSchema.pick({ topic: true }), func: async (input) => JSON.stringify(await generatePamRant({ ...input, ...context })) }),
        new Tool({ name: 'reno_mode', description: 'Analyzes a photo of a messy car.', schema: RenoModeAnalysisInputSchema.pick({ photoDataUri: true }), func: async (input) => JSON.stringify(await analyzeCarShame({ ...input, ...context })) }),
        new Tool({ name: 'patrickt_app', description: 'Logs events, gets roasts, or analyzes drama in the "Patrickt" saga.', schema: PatricktAgentInputSchema.pick({ action: true, eventDescription: true, eventCategory: true, chatInput: true }).partial(), func: async (input) => JSON.stringify(await processPatricktAction({ ...input, ...context })) }),
        new Tool({ name: 'vin_diesel', description: 'Validates a Vehicle Identification Number (VIN).', schema: VinDieselInputSchema.pick({ vin: true }), func: async (input) => JSON.stringify(await validateVin({ ...input, ...context })) }),
        new Tool({ name: 'inventory_daemon', description: 'Handles requests about stock, inventory, or purchase orders.', schema: z.object({ query: z.string() }), func: async (input) => JSON.stringify(await consultInventoryDaemon({ ...input })) }),
        new Tool({ name: 'ritual_quests', description: 'Gets the user their current ritual quests to guide their journey.', schema: RitualQuestInputSchema.omit({ workspaceId: true }), func: async (input) => JSON.stringify(await generateRitualQuests({ ...input, ...context })) }),
        new Tool({ name: 'burn_bridge_protocol', description: 'Performs a full-spectrum investigation (OSINT, analysis, decoy) on a person.', schema: BurnBridgeInputSchema.omit({ workspaceId: true, userId: true }), func: async (input) => JSON.stringify(await executeBurnBridgeProtocol({ ...input, ...context })) }),
        new Tool({ name: 'vault_daemon', description: 'Handles requests about finance, revenue, profit, or spending.', schema: VaultQueryInputSchema.omit({ workspaceId: true, userId: true }), func: async (input) => JSON.stringify(await consultVaultDaemon({ ...input, ...context })) }),
    ];
    return specialistTools;
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
            name: 'getUsageDetails',
            description: 'Gets the current billing and agent action usage details. Use this when the user asks about their usage, limits, plan, or billing.',
            schema: z.object({}),
            func: () => getUsageDetailsForAgent(workspaceId, userId),
        }),
        
        new Tool({
            name: 'requestCreditTopUp',
            description: 'Logs a user\'s request to top up their credit balance via an out-of-band payment method like an e-Transfer. Use this when the user says "add credits", "buy credits", "top up my account", etc. Extract the amount from their command.',
            schema: RequestCreditTopUpInputSchema,
            func: (toolInput) => requestCreditTopUpInDb(toolInput, userId, workspaceId),
        }),
        
        new Tool({
            name: 'createManualTransaction',
            description: 'Creates a manual credit or debit transaction on the user\'s workspace account. Use this for explicit user requests like "charge me 10 credits for this" or "process a refund of 5 credits".',
            schema: CreateManualTransactionInputSchema,
            func: (toolInput) => createManualTransaction(toolInput, workspaceId, userId),
        }),
        
        new Tool({
            name: 'getDatingProfile',
            description: 'Fetches a dating app profile by its ID. Use this when the user wants to get information about a specific person on a dating app before crafting a message. For example, "get profile 123 from Hinge."',
            schema: DatingProfileInputSchema,
            func: (toolInput) => getDatingProfile(toolInput, workspaceId, userId),
        }),

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
            }),
            new Tool({
                name: 'transmuteCredits',
                description: 'Transmutes ΞCredits to settle a real-world tribute (payment). The user must confirm the details. For Sovereigns only.',
                schema: TransmuteCreditsInputSchema,
                func: (toolInput) => transmuteCredits(toolInput, workspaceId, userId),
            })
        );
    }
    
    return allTools;
}
