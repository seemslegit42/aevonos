
/**
 * @fileOverview This file defines the central tool registry for the BEEP agent.
 * It uses a factory pattern to create context-aware tool instances.
 */

import { Tool, DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';

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
import { scanEvidence } from '@/ai/agents/paper-trail';
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


// Tool Imports
import { createContactInDb, listContactsFromDb, deleteContactInDb, updateContactInDb } from '@/ai/tools/crm-tools';
import { getUsageDetails, requestCreditTopUpInDb } from '@/ai/tools/billing-tools';
import { getDatingProfile } from '@/ai/tools/dating-tools';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { createManualTransaction } from '@/ai/tools/ledger-tools';


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
import { OsintInputSchema } from './osint-schemas';
import { InfidelityAnalysisInputSchema } from './infidelity-analysis-schemas';
import { DecoyInputSchema } from './decoy-schemas';
import { DossierInputSchema } from './dossier-schemas';
import { KendraInputSchema } from './kendra-schemas';
import { OrpheanOracleInputSchema } from './orphean-oracle-schemas';
import { LumberghAnalysisInputSchema } from './lumbergh-schemas';
import { LucilleBluthInputSchema } from './lucille-bluth-schemas';
import { PamScriptInputSchema } from './pam-poovey-schemas';
import { CreateManualTransactionInputSchema } from '../tools/ledger-schemas';
import { StonksBotInputSchema } from './stonks-bot-schemas';


// Context for multi-tenancy
interface AgentContext {
    userId: string;
    workspaceId: string;
}

// This tool is a container for the final structured output.
// The model is instructed to call this tool when its work is complete.
class FinalAnswerTool extends Tool {
  name = 'final_answer';
  description = 'Call this tool when you have gathered all necessary information and are ready to provide the final response to the user. The output should conform to the UserCommandOutputSchema.';
  schema = UserCommandOutputSchema;
  
  async _call(input: z.infer<typeof UserCommandOutputSchema>) {
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
export function getTools(context: AgentContext): Tool[] {
    const { userId, workspaceId } = context;
    
    return [
        new FinalAnswerTool(),
        new DynamicTool({
            name: 'critiqueContent',
            description: 'Sends content to Dr. Syntax for a harsh but effective critique. Use this when a user asks for a review, critique, or feedback on a piece of text, code, or a prompt. Extract the content and content type from the user command.',
            schema: DrSyntaxInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await drSyntaxCritique({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'dr-syntax', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'createContact',
            description: 'Creates a new contact in the system. Use this when the user asks to "add a contact", "new contact", etc. Extract their details like name, email, and phone from the user command.',
            schema: CreateContactInputSchema,
            func: async (toolInput) => {
                const result = await createContactInDb(toolInput, workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'crm', report: { action: 'create', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'updateContact',
            description: 'Updates an existing contact in the system. Use this when the user asks to "change a contact", "update details for", etc. You must provide the contact ID. If the user provides a name, use the listContacts tool first to find the correct ID.',
            schema: UpdateContactInputSchema,
            func: async (toolInput) => {
                const result = await updateContactInDb(toolInput, workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'crm', report: { action: 'update', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'listContacts',
            description: 'Lists all contacts in the system. Use this when the user asks to "show contacts", "list all contacts", "see my contacts", etc.',
            schema: z.object({}),
            func: async () => {
                const result = await listContactsFromDb(workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'crm', report: { action: 'list', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'deleteContact',
            description: 'Deletes a contact from the system by their ID. The user must provide the ID of the contact to delete. You should obtain this ID from a contact list if the user does not provide it.',
            schema: DeleteContactInputSchema,
            func: async (toolInput) => {
                const result = await deleteContactInDb(toolInput, workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'crm', report: { action: 'delete', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'getUsageDetails',
            description: 'Gets the current billing and agent action usage details. Use this when the user asks about their usage, limits, plan, or billing.',
            schema: z.object({}),
            func: async () => {
                const result = await getUsageDetails(workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'billing', report: { action: 'get_usage', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'requestCreditTopUp',
            description: 'Logs a user\'s request to top up their credit balance via an out-of-band payment method like an e-Transfer. Use this when the user says "add credits", "buy credits", "top up my account", etc. Extract the amount from their command.',
            schema: RequestCreditTopUpInputSchema,
            func: async (toolInput) => {
                const result = await requestCreditTopUpInDb(toolInput, userId, workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'billing', report: { action: 'request_top_up', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'createManualTransaction',
            description: 'Creates a manual credit or debit transaction on the user\'s workspace account. Use this for explicit user requests like "charge me 10 credits for this" or "process a refund of 5 credits".',
            schema: CreateManualTransactionInputSchema,
            func: async (toolInput) => {
                const result = await createManualTransaction(toolInput, workspaceId, userId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'ledger', report: { action: 'create_manual_transaction', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'getDatingProfile',
            description: 'Fetches a dating app profile by its ID. Use this when the user wants to get information about a specific person on a dating app before crafting a message. For example, "get profile 123 from Hinge."',
            schema: DatingProfileInputSchema,
            func: async (toolInput) => {
                const result = await getDatingProfile(toolInput, workspaceId);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'dating', report: { action: 'get_profile', report: result } };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'createSecurityAlert',
            description: 'Creates a security alert in the Aegis system. Use this when the Aegis anomaly scan returns a positive result for a threat. You must provide the type, explanation, and risk level of the alert based on the Aegis report.',
            schema: CreateSecurityAlertInputSchema,
            func: async (toolInput) => {
                const result = await createSecurityAlertInDb(toolInput, workspaceId);
                const report: z.infer<typeof AgentReportSchema> = {
                    agent: 'security',
                    report: {
                        action: 'create_alert',
                        report: {
                            alertId: result.id,
                            type: result.type,
                            riskLevel: result.riskLevel
                        }
                    }
                };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'validateVin',
            description: 'Validates a Vehicle Identification Number (VIN) for compliance and decoding. Use this when the user asks to "validate a VIN", "check a VIN", or similar.',
            schema: VinDieselInputSchema,
            func: async (toolInput) => {
                const result = await validateVin(toolInput);
                const report: z.infer<typeof AgentReportSchema> = { agent: 'vin-diesel', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'solveReputationProblem',
            description: 'Analyzes a negative online review and generates a professional, disarming response. Use this when a user wants to "fix a bad review", "handle a complaint", etc.',
            schema: WinstonWolfeInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await generateSolution({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'winston-wolfe', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'analyzeTeamComms',
            description: 'Analyzes team communication snippets (e.g., from Slack or Teams) for morale, passive-aggression, and burnout probability. Use this for "checking team morale", "analyzing a conversation", etc.',
            schema: KifKrokerAnalysisInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await analyzeComms({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'kif-kroker', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'createAlibi',
            description: 'Generates a fake, jargon-filled calendar invite to block off time. Use this for commands like "block my calendar", "create a fake meeting", "I need an hour".',
            schema: VandelayAlibiInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await createVandelayAlibi({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'vandelay', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'analyzeCandidate',
            description: 'Analyzes a candidate summary against a job description. Use this to "check candidate fit", "analyze a resume", etc. You need to provide the candidate name, summary, and the job description.',
            schema: RolodexAnalysisInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await analyzeCandidate({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'rolodex', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'generateBusinessKit',
            description: 'Generates a business name, tagline, and logo concept. Use this when the user asks to "start a business", "get legit", "make a company", etc. They need to provide the type of business and a logo style.',
            schema: JrocInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await generateBusinessKit({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'jroc', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'investigateLog',
            description: 'Analyzes a log entry for suspicious activity with the cynical eye of an alcoholic ex-cop. Use this to investigate employee actions or any other log data.',
            schema: LaheyAnalysisInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await analyzeLaheyLog({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'lahey-surveillance', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'logDailyReport',
            description: 'Logs a daily report for a construction site. Takes raw text and structures it. Use for commands like "log daily report for construction."',
            schema: ForemanatorLogInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await processDailyLog({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'foremanator', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'analyzeComplianceLog',
            description: 'Analyzes a cleanroom or medical device manufacturing log for compliance issues with a sarcastic tone. Use for commands like "analyze this cleanroom log" or "is this calibration record compliant?".',
            schema: SterileishAnalysisInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await analyzeCompliance({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'sterileish', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'scanReceipt',
            description: 'Scans a receipt image and extracts transaction details. The user must provide a photo of the receipt as a data URI.',
            schema: PaperTrailScanInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await scanEvidence({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'paper-trail', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'processDocumentForBarbara',
            description: 'Delegates a document processing or compliance task to Agent Barbara. Use this for tasks like validating VINs, drafting professional emails, or checking compliance. Specify the task and provide the document text.',
            schema: BarbaraInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await processDocument({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'barbara', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'auditFinances',
            description: 'Audits a list of financial transactions with extreme prejudice. Use this for commands like \'audit my expenses\', \'review these transactions\', etc.',
            schema: AuditorInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await auditFinances({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'auditor', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'generateWingmanMessage',
            description: 'Crafts the perfect message for a tricky social situation. The user must provide the situation context and a desired message mode (e.g., \'Charming AF\', \'Help Me Say No\').',
            schema: WingmanInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await generateWingmanMessage({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'wingman', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'performOsintScan',
            description: 'Performs an OSINT (Open-Source Intelligence) scan on a target person. Requires a name and optional context like email or social media URLs.',
            schema: OsintInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await performOsintScan({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'osint', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'performInfidelityAnalysis',
            description: 'Analyzes a situation description for behavioral red flags and calculates an infidelity risk score.',
            schema: InfidelityAnalysisInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await performInfidelityAnalysis({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'infidelity-analysis', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'deployDecoy',
            description: 'Deploys an AI decoy with a specific persona to engage a target and test loyalty.',
            schema: DecoyInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await deployDecoy({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'decoy', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'generateDossier',
            description: 'Compiles data from OSINT, behavioral analysis, and decoy reports into a formal dossier. Specify standard or legal mode.',
            schema: DossierInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await generateDossier({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: toolInput.mode === 'legal' ? 'legal-dossier' : 'dossier', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'getKendraTake',
            description: 'Gets an unhinged, but brilliant, marketing campaign strategy for a product idea from KENDRA.exe. Use this when a user has a product idea and wants marketing help.',
            schema: KendraInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await getKendraTake({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'kendra', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'invokeOrpheanOracle',
            description: 'Consults the Orphean Oracle to translate raw business data into a profound, metaphorical, visual narrative. Use this when the user asks for a "story" about their data, or wants to "see" their business performance in a new way.',
            schema: OrpheanOracleInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await invokeOracle({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'orphean-oracle', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'analyzeMeetingInvite',
            description: 'Analyzes a meeting invite for pointlessness and generates passive-aggressive decline memos. Use this when a user asks to "check a meeting invite" or "get me out of this meeting".',
            schema: LumberghAnalysisInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await analyzeInvite({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'lumbergh', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'getLucilleBluthTake',
            description: 'Sends an expense to Lucille Bluth for a witty, judgmental, and condescending remark. Use this when a user wants to "log an expense", "categorize a purchase", etc. Extract the item description and cost from the user command.',
            schema: LucilleBluthInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await analyzeExpense({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'lucille-bluth', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'getPamsTake',
            description: 'Delegates a task to Pam Poovey, the HR director. Use this for requests like \'get Pam to talk about onboarding\' or \'ask Pam about the attendance policy\'. Specify the HR topic.',
            schema: PamScriptInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await generatePamRant({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'pam-poovey', report: result };
                return JSON.stringify(report);
            },
        }),
        new DynamicTool({
            name: 'getStonksAdvice',
            description: 'Gets unhinged, bullish, and financially irresponsible advice for a stock ticker. This is not financial advice.',
            schema: StonksBotInputSchema.omit({ workspaceId: true }),
            func: async (toolInput) => {
                const result = await getStonksAdvice({ ...toolInput, workspaceId });
                const report: z.infer<typeof AgentReportSchema> = { agent: 'stonks', report: result };
                return JSON.stringify(report);
            },
        }),
    ];
}
