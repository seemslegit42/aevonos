

/**
 * @fileOverview This file defines the central tool registry for the BEEP agent.
 * It uses a factory pattern to create context-aware tool instances.
 */

import { Tool, DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { UserPsyche, UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';

import {
    AgentReportSchema,
    UserCommandOutputSchema,
} from './beep-schemas';

// Agent Imports
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { validateVin } from '@/ai/agents/vin-diesel';
import { generateSolution } from '@/ai/agents/winston-wolfe';
import { analyzeComms } from '@/ai/agents/kif-kroker';
import { createVandelayAlibi } from '@/ai/agents/vandelay';
import { analyzeCandidate } from '@/ai/agents/rolodex';
import { generateBusinessKit } from '@/ai/agents/jroc';
import { analyzeLaheyLog } from '@/ai/agents/lahey';
import { processDailyLog } from '@/ai/agents/foremanator';
import { analyzeCompliance } from '@/ai/agents/sterileish';
import { scanEvidence as scanEvidenceFlow } from '@/ai/agents/paper-trail';
import { processDocument } from '@/ai/agents/barbara';
import { auditFinances } from '@/ai/agents/auditor-generalissimo';
import { generateWingmanMessage } from '@/ai/agents/wingman';
import { performOsintScan } from '@/ai/agents/osint';
import { performInfidelityAnalysis } from '@/ai/agents/infidelity-analysis';
import { deployDecoy } from '@/ai/agents/decoy';
import { generateDossier } from '@/ai/agents/dossier-agent';
import { getKendraTake } from '@/ai/agents/kendra';
import { invokeOracle } from '@/ai/agents/orphean-oracle-flow';
import { analyzeInvite } from '@/ai/agents/lumbergh';
import { analyzeExpense } from '@/ai/agents/lucille-bluth';
import { generatePamRant } from './pam-poovey';
import { getStonksAdvice } from './stonks-bot';
import { analyzeCarShame } from '@/ai/agents/reno-mode';
import { processPatricktAction } from './patrickt-agent';
import { consultInventoryDaemon } from './inventory-daemon';
import { executeBurnBridgeProtocol } from './burn-bridge-agent';


// Tool Imports
import { createContactInDb, listContactsFromDb, deleteContactInDb, updateContactInDb } from '@/ai/tools/crm-tools';
import { getUsageDetailsForAgent, requestCreditTopUpInDb } from '@/services/billing-service';
import { getDatingProfile } from '@/ai/tools/dating-tools';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { createManualTransaction } from '@/services/ledger-service';
import { getSystemStatus, findUsersByVow, manageSyndicateAccess } from '@/ai/tools/demiurge-tools';


// Schema Imports
import { DrSyntaxInputSchema } from '@/ai/agents/dr-syntax-schemas';
import { CreateContactInputSchema, DeleteContactInputSchema, UpdateContactInputSchema } from '@/ai/tools/crm-schemas';
import { RequestCreditTopUpInputSchema } from '@/ai/tools/billing-schemas';
import { DatingProfileInputSchema } from '@/ai/tools/dating-schemas';
import { CreateSecurityAlertInputSchema } from '@/ai/tools/security-schemas';
import { VinDieselInputSchema } from './vin-diesel-schemas';
import { WinstonWolfeInputSchema } from './winston-wolfe-schemas';
import { KifKrokerAnalysisInputSchema } from './kif-kroker-schemas';
import { VandelayAlibiInputSchema } from './vandelay-schemas';
import { RolodexAnalysisInputSchema } from './rolodex-schemas';
import { JrocInputSchema } from './jroc-schemas';
import { LaheyAnalysisInputSchema } from './lahey-schemas';
import { ForemanatorLogInputSchema } from './foremanator-schemas';
import { SterileishAnalysisInputSchema } from './sterileish-schemas';
import { PaperTrailScanInputSchema } from './paper-trail-schemas';
import { BarbaraInputSchema } from './barbara-schemas';
import { AuditorInputSchema } from './auditor-generalissimo-schemas';
import { WingmanInputSchema } from './wingman-schemas';
import { KendraInputSchema } from './kendra-schemas';
import { OrpheanOracleInputSchema } from './orphean-oracle-schemas';
import { LumberghAnalysisInputSchema } from './lumbergh-schemas';
import { LucilleBluthInputSchema } from './lucille-bluth-schemas';
import { PamScriptInputSchema } from './pam-poovey-schemas';
import { CreateManualTransactionInputSchema } from '@/ai/tools/ledger-schemas';
import { StonksBotInputSchema } from './stonks-bot-schemas';
import { RenoModeAnalysisInputSchema } from './reno-mode-schemas';
import { PatricktAgentInputSchema } from './patrickt-agent-schemas';
import { InventoryDaemonInputSchema } from './inventory-daemon-schemas';
import { BurnBridgeInputSchema } from './burn-bridge-schemas';
import { FindUsersByVowInputSchema, ManageSyndicateInputSchema } from '@/ai/tools/demiurge-schemas';


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
  schema = UserCommandOutputSchema.omit({ agentReports: true }); // Agent reports are aggregated by the graph.
  
  async _call(input: z.infer<typeof this.schema>) {
    // This tool doesn't "do" anything except structure the output.
    // The return value is not used in the main graph loop.
    return JSON.stringify(input);
  }
}

/**
 * Creates and returns a context-aware array of tools for the BEEP agent.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getTools(context: AgentContext): Promise<Tool[]> {
    const { userId, workspaceId, psyche, role } = context;

    const createAgentTool = ({
        name,
        description,
        schema,
        agentName,
        agentFunc,
        reportAction,
    }: {
        name: string;
        description: string;
        schema: z.ZodSchema<any>;
        agentName: z.infer<typeof AgentReportSchema>['agent'];
        agentFunc: (toolInput: any) => Promise<any>;
        reportAction?: string;
    }) => {
        return new DynamicTool({
            name,
            description,
            schema,
            func: async (toolInput) => {
                const result = await agentFunc(toolInput);
                let reportData: any = result;
                if (reportAction) {
                    reportData = { action: reportAction, report: result };
                }
                const report: z.infer<typeof AgentReportSchema> = { agent: agentName, report: reportData };
                return JSON.stringify(report);
            },
        });
    };
    
    const allTools: Tool[] = [
        new FinalAnswerTool(),

        createAgentTool({
            name: 'critiqueContent',
            description: 'Sends content to Dr. Syntax for a harsh but effective critique. Use this when a user asks for a review, critique, or feedback on a piece of text, code, or a prompt. Extract the content and content type from the user command.',
            schema: DrSyntaxInputSchema.omit({ workspaceId: true, psyche: true }),
            agentName: 'dr-syntax',
            agentFunc: (toolInput) => drSyntaxCritique({ ...toolInput, workspaceId, psyche }),
        }),
        
        createAgentTool({
            name: 'createContact',
            description: 'Creates a new contact in the system. Use this when the user asks to "add a contact", "new contact", etc. Extract their details like name, email, and phone from the user command.',
            schema: CreateContactInputSchema,
            agentName: 'crm',
            reportAction: 'create',
            agentFunc: (toolInput) => createContactInDb(toolInput, workspaceId, userId),
        }),
        
        createAgentTool({
            name: 'updateContact',
            description: 'Updates an existing contact in the system. Use this when the user asks to "change a contact", "update details for", etc. You must provide the contact ID. If the user provides a name, use the listContacts tool first to find the correct ID.',
            schema: UpdateContactInputSchema,
            agentName: 'crm',
            reportAction: 'update',
            agentFunc: (toolInput) => updateContactInDb(toolInput, workspaceId, userId),
        }),
        
        createAgentTool({
            name: 'listContacts',
            description: 'Lists all contacts in the system. Use this when the user asks to "show contacts", "list all contacts", "see my contacts", etc.',
            schema: z.object({}),
            agentName: 'crm',
            reportAction: 'list',
            agentFunc: () => listContactsFromDb(workspaceId, userId),
        }),
        
        createAgentTool({
            name: 'deleteContact',
            description: 'Deletes a contact from the system by their ID. The user must provide the ID of the contact to delete. You should obtain this ID from a contact list if the user does not provide it.',
            schema: DeleteContactInputSchema,
            agentName: 'crm',
            reportAction: 'delete',
            agentFunc: (toolInput) => deleteContactInDb(toolInput, workspaceId, userId),
        }),

        createAgentTool({
            name: 'getUsageDetails',
            description: 'Gets the current billing and agent action usage details. Use this when the user asks about their usage, limits, plan, or billing.',
            schema: z.object({}),
            agentName: 'billing',
            reportAction: 'get_usage',
            agentFunc: () => getUsageDetailsForAgent(workspaceId, userId),
        }),
        
        createAgentTool({
            name: 'requestCreditTopUp',
            description: 'Logs a user\'s request to top up their credit balance via an out-of-band payment method like an e-Transfer. Use this when the user says "add credits", "buy credits", "top up my account", etc. Extract the amount from their command.',
            schema: RequestCreditTopUpInputSchema,
            agentName: 'billing',
            reportAction: 'request_top_up',
            agentFunc: (toolInput) => requestCreditTopUpInDb(toolInput, userId, workspaceId),
        }),
        
        createAgentTool({
            name: 'createManualTransaction',
            description: 'Creates a manual credit or debit transaction on the user\'s workspace account. Use this for explicit user requests like "charge me 10 credits for this" or "process a refund of 5 credits".',
            schema: CreateManualTransactionInputSchema,
            agentName: 'ledger',
            reportAction: 'create_manual_transaction',
            agentFunc: (toolInput) => createManualTransaction(toolInput, workspaceId, userId),
        }),
        
        createAgentTool({
            name: 'getDatingProfile',
            description: 'Fetches a dating app profile by its ID. Use this when the user wants to get information about a specific person on a dating app before crafting a message. For example, "get profile 123 from Hinge."',
            schema: DatingProfileInputSchema,
            agentName: 'dating',
            reportAction: 'get_profile',
            agentFunc: (toolInput) => getDatingProfile(toolInput, workspaceId, userId),
        }),

        createAgentTool({
            name: 'createSecurityAlert',
            description: 'Creates a security alert in the Aegis system. Use this when the Aegis anomaly scan returns a positive result for a threat. You must provide the type, explanation, and risk level of the alert based on the Aegis report.',
            schema: CreateSecurityAlertInputSchema,
            agentName: 'security',
            reportAction: 'create_alert',
            agentFunc: (toolInput) => createSecurityAlertInDb(toolInput, workspaceId, userId),
        }),
        
        createAgentTool({
            name: 'validateVin',
            description: 'Validates a Vehicle Identification Number (VIN) for compliance and decoding. Use this when the user asks to "validate a VIN", "check a VIN", or similar.',
            schema: VinDieselInputSchema.omit({ workspaceId: true }),
            agentName: 'vin-diesel',
            agentFunc: (toolInput) => validateVin({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'solveReputationProblem',
            description: 'Analyzes a negative online review and generates a professional, disarming response. Use this when a user wants to "fix a bad review", "handle a complaint", etc.',
            schema: WinstonWolfeInputSchema.omit({ workspaceId: true }),
            agentName: 'winston-wolfe',
            agentFunc: (toolInput) => generateSolution({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'analyzeTeamComms',
            description: 'Analyzes team communication snippets (e.g., from Slack or Teams) for morale, passive-aggression, and burnout probability. Use this for "checking team morale", "analyzing a conversation", etc.',
            schema: KifKrokerAnalysisInputSchema.omit({ workspaceId: true }),
            agentName: 'kif-kroker',
            agentFunc: (toolInput) => analyzeComms({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'createAlibi',
            description: 'Generates a fake, jargon-filled calendar invite to block off time. Use this for commands like "block my calendar", "create a fake meeting", "I need an hour".',
            schema: VandelayAlibiInputSchema.omit({ workspaceId: true }),
            agentName: 'vandelay',
            agentFunc: (toolInput) => createVandelayAlibi({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'analyzeCandidate',
            description: 'Analyzes a candidate summary against a job description. Use this to "check candidate fit", "analyze a resume", etc. You need to provide the candidate name, summary, and the job description.',
            schema: RolodexAnalysisInputSchema.omit({ workspaceId: true }),
            agentName: 'rolodex',
            agentFunc: (toolInput) => analyzeCandidate({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'generateBusinessKit',
            description: 'Generates a business name, tagline, and logo concept. Use this when the user asks to "start a business", "get legit", "make a company", etc. They need to provide the type of business and a logo style.',
            schema: JrocInputSchema.omit({ workspaceId: true }),
            agentName: 'jroc',
            agentFunc: (toolInput) => generateBusinessKit({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'investigateLog',
            description: 'Analyzes a log entry for suspicious activity with the cynical eye of an alcoholic ex-cop. Use this to investigate employee actions or any other log data.',
            schema: LaheyAnalysisInputSchema.omit({ workspaceId: true }),
            agentName: 'lahey-surveillance',
            agentFunc: (toolInput) => analyzeLaheyLog({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'logDailyReport',
            description: 'Logs a daily report for a construction site. Takes raw text and structures it. Use for commands like "log daily report for construction."',
            schema: ForemanatorLogInputSchema.omit({ workspaceId: true }),
            agentName: 'foremanator',
            agentFunc: (toolInput) => processDailyLog({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'analyzeComplianceLog',
            description: 'Analyzes a cleanroom or medical device manufacturing log for compliance issues with a sarcastic tone. Use for commands like "analyze this cleanroom log" or "is this calibration record compliant?".',
            schema: SterileishAnalysisInputSchema.omit({ workspaceId: true }),
            agentName: 'sterileish',
            agentFunc: (toolInput) => analyzeCompliance({ ...toolInput, workspaceId }),
        }),

        new DynamicTool({
            name: 'scanReceipt',
            description: 'Scans a receipt image and extracts transaction details. The user must provide a photo of the receipt as a data URI.',
            schema: PaperTrailScanInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await scanEvidenceFlow({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'paper-trail', report: result };
                return JSON.stringify(report);
            },
        }),

        createAgentTool({
            name: 'processDocumentForBarbara',
            description: 'Delegates a document processing or compliance task to Agent Barbara. Use this for tasks like validating VINs, drafting professional emails, or checking compliance. Specify the task and provide the document text.',
            schema: BarbaraInputSchema.omit({ workspaceId: true }),
            agentName: 'barbara',
            agentFunc: (toolInput) => processDocument({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'auditFinances',
            description: 'Audits a list of financial transactions with extreme prejudice. Use this for commands like \'audit my expenses\', \'review these transactions\', etc.',
            schema: AuditorInputSchema.omit({ workspaceId: true }),
            agentName: 'auditor',
            agentFunc: (toolInput) => auditFinances({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'generateWingmanMessage',
            description: 'Crafts the perfect message for a tricky social situation. The user must provide the situation context and a desired message mode (e.g., \'Charming AF\', \'Help Me Say No\').',
            schema: WingmanInputSchema.omit({ workspaceId: true }),
            agentName: 'wingman',
            agentFunc: (toolInput) => generateWingmanMessage({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'executeBurnBridgeProtocol',
            description: 'Executes the "Burn Bridge Protocol". This is a high-level, multi-agent process for comprehensive intelligence gathering on a target. It runs OSINT, behavioral analysis, deploys a decoy, and compiles a final dossier. Requires a target name, a situation description, and optional context.',
            schema: BurnBridgeInputSchema.omit({ workspaceId: true, userId: true }),
            agentName: 'dossier',
            agentFunc: (toolInput) => executeBurnBridgeProtocol({ ...toolInput, workspaceId, userId }),
        }),
        
        createAgentTool({
            name: 'getKendraTake',
            description: 'Gets an unhinged, but brilliant, marketing campaign strategy for a product idea from KENDRA.exe. Use this when a user has a product idea and wants marketing help.',
            schema: KendraInputSchema.omit({ workspaceId: true }),
            agentName: 'kendra',
            agentFunc: (toolInput) => getKendraTake({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'invokeOrpheanOracle',
            description: 'Consults the Orphean Oracle to translate raw business data into a profound, metaphorical, visual narrative. Use this when the user asks for a "story" about their data, or wants to "see" their business performance in a new way.',
            schema: OrpheanOracleInputSchema.omit({ workspaceId: true }),
            agentName: 'orphean-oracle',
            agentFunc: (toolInput) => invokeOracle({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'analyzeMeetingInvite',
            description: 'Analyzes a meeting invite for pointlessness and generates passive-aggressive decline memos. Use this when a user asks to "check a meeting invite" or "get me out of this meeting".',
            schema: LumberghAnalysisInputSchema.omit({ workspaceId: true }),
            agentName: 'lumbergh',
            agentFunc: (toolInput) => analyzeInvite({ ...toolInput, workspaceId }),
        }),
        
        createAgentTool({
            name: 'getLucilleBluthTake',
            description: 'Sends an expense to Lucille Bluth for a witty, judgmental, and condescending remark. Use this when a user wants to "log an expense", "categorize a purchase", etc. Extract the item description and cost from the user command.',
            schema: LucilleBluthInputSchema.omit({ workspaceId: true }),
            agentName: 'lucille-bluth',
            agentFunc: (toolInput) => analyzeExpense({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'getPamsTake',
            description: 'Delegates a task to Pam Poovey, the HR director. Use this for requests like \'get Pam to talk about onboarding\' or \'ask Pam about the attendance policy\'. Specify the HR topic.',
            schema: PamScriptInputSchema.omit({ workspaceId: true }),
            agentName: 'pam-poovey',
            agentFunc: (toolInput) => generatePamRant({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'getStonksAdvice',
            description: 'Gets unhinged, bullish, and financially irresponsible advice for a stock ticker. This is not financial advice.',
            schema: StonksBotInputSchema.omit({ workspaceId: true, userId: true }),
            agentName: 'stonks',
            agentFunc: (toolInput) => getStonksAdvice({ ...toolInput, workspaceId, userId }),
        }),

        createAgentTool({
            name: 'analyzeCarShame',
            description: "Analyzes a photo of a user's messy car to provide a shame rating, a roast, and a detailing recommendation.",
            schema: RenoModeAnalysisInputSchema.omit({ workspaceId: true }),
            agentName: 'reno-mode',
            agentFunc: (toolInput) => analyzeCarShame({ ...toolInput, workspaceId }),
        }),

        createAgentTool({
            name: 'managePatricktSaga',
            description: 'Logs events, gets roasts, or analyzes drama related to the "Patrickt" saga. Action can be LOG_EVENT, ANALYZE_DRAMA, or GENERATE_ROAST.',
            schema: PatricktAgentInputSchema.omit({ workspaceId: true, userId: true }),
            agentName: 'patrickt-app',
            agentFunc: (toolInput) => processPatricktAction({ ...toolInput, workspaceId, userId }),
        }),
        
        createAgentTool({
            name: 'consultInventoryDaemon',
            description: "Consults the specialist Inventory Daemon for any questions related to stock levels, purchase orders, or supply chain. Use for queries like 'How many Product X do we have?' or 'Reorder Product Y'.",
            schema: InventoryDaemonInputSchema,
            agentName: 'inventory-daemon',
            agentFunc: (toolInput) => consultInventoryDaemon(toolInput),
        }),
    ];

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true }
    });
    const isOwner = workspace?.ownerId === userId;

    if (isOwner) {
        allTools.push(
            createAgentTool({
                name: 'getSystemStatus',
                description: "Retrieves the current operational status of the entire ΛΞVON OS, including system load and agent performance. Only for the Architect.",
                schema: z.object({}),
                agentName: 'demiurge',
                reportAction: 'get_system_status',
                agentFunc: getSystemStatus,
            }),
            createAgentTool({
                name: 'findUsersByVow',
                description: "Finds users based on a keyword from their 'founding vow' or 'sacrifice' made during the Rite of Invocation. Only for the Architect.",
                schema: FindUsersByVowInputSchema,
                agentName: 'demiurge',
                reportAction: 'find_users_by_vow',
                agentFunc: findUsersByVow,
            }),
             createAgentTool({
                name: 'manageSyndicateAccess',
                description: "Performs high-level administrative actions on a group of users (a 'Syndicate' or 'Covenant'). Only for the Architect.",
                schema: ManageSyndicateInputSchema,
                agentName: 'demiurge',
                reportAction: 'manage_syndicate_access',
                agentFunc: manageSyndicateAccess,
            })
        );
    }
    
    return allTools;
}
