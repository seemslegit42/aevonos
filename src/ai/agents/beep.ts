
'use server';

/**
 * @fileOverview This file defines the BEEP agent kernel using LangGraph.
 * BEEP (Behavioral Event & Execution Processor) is the central orchestrator of ΛΞVON OS.
 *
 * - processUserCommand - The function to call to process the command.
 * - UserCommandInput - The input type for the processUserCommand function.
 * - UserCommandOutput - The output type for the processUserCommand function.
 */

import { z } from 'zod';
import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { Tool, DynamicTool } from '@langchain/core/tools';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { geminiModel } from '@/ai/genkit';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import { DrSyntaxInputSchema } from '@/ai/agents/dr-syntax-schemas';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput } from './aegis-schemas';
import { createContactInDb, listContactsFromDb, deleteContactInDb, updateContactInDb } from '@/ai/tools/crm-tools';
import { CreateContactInputSchema, DeleteContactInputSchema, UpdateContactInputSchema } from '@/ai/tools/crm-schemas';
import { getUsageDetails, requestCreditTopUpInDb } from '@/ai/tools/billing-tools';
import { RequestCreditTopUpInputSchema } from '@/ai/tools/billing-schemas';
import { getDatingProfile } from '@/ai/tools/dating-tools';
import { DatingProfileInputSchema } from '@/ai/tools/dating-schemas';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { CreateSecurityAlertInputSchema } from '@/ai/tools/security-schemas';
import { validateVin } from '@/ai/agents/vin-diesel';
import { VinDieselInputSchema } from './vin-diesel-schemas';
import { generateSolution } from '@/ai/agents/winston-wolfe';
import { WinstonWolfeInputSchema } from './winston-wolfe-schemas';
import { analyzeComms } from '@/ai/agents/kif-kroker';
import { KifKrokerAnalysisInputSchema } from './kif-kroker-schemas';
import { createVandelayAlibi } from '@/ai/agents/vandelay';
import { VandelayAlibiInputSchema } from './vandelay-schemas';
import { analyzeCandidate } from '@/ai/agents/rolodex';
import { RolodexAnalysisInputSchema } from './rolodex-schemas';
import { generateBusinessKit } from '@/ai/agents/jroc';
import { JrocInputSchema } from './jroc-schemas';
import { analyzeLaheyLog } from '@/ai/agents/lahey';
import { LaheyAnalysisInputSchema } from './lahey-schemas';
import { processDailyLog } from '@/ai/agents/foremanator';
import { ForemanatorLogInputSchema } from './foremanator-schemas';
import { analyzeCompliance } from '@/ai/agents/sterileish';
import { SterileishAnalysisInputSchema } from './sterileish-schemas';
import { scanEvidence } from '@/ai/agents/paper-trail';
import { PaperTrailScanInputSchema } from './paper-trail-schemas';
import { processDocument } from '@/ai/agents/barbara';
import { BarbaraInputSchema } from './barbara-schemas';
import { auditFinances } from '@/ai/agents/auditor-generalissimo';
import { AuditorInputSchema } from './auditor-generalissimo-schemas';
import { generateWingmanMessage } from '@/ai/agents/wingman';
import { WingmanInputSchema } from './wingman-schemas';
import { performOsintScan } from '@/ai/agents/osint';
import { OsintInputSchema } from './osint-schemas';
import { performInfidelityAnalysis } from '@/ai/agents/infidelity-analysis';
import { InfidelityAnalysisInputSchema } from './infidelity-analysis-schemas';
import { deployDecoy } from '@/ai/agents/decoy';
import { DecoyInputSchema } from './decoy-schemas';
import { generateDossier } from '@/ai/agents/dossier-agent';
import { DossierInputSchema } from './dossier-schemas';
import { getKendraTake } from '@/ai/agents/kendra';
import { KendraInputSchema } from './kendra-schemas';
import { invokeOracle } from '@/ai/agents/orphean-oracle-flow';
import { OrpheanOracleInputSchema } from './orphean-oracle-schemas';
import { analyzeInvite } from '@/ai/agents/lumbergh';
import { LumberghAnalysisInputSchema } from './lumbergh-schemas';
import { analyzeExpense } from '@/ai/agents/lucille-bluth';
import { LucilleBluthInputSchema } from './lucille-bluth-schemas';
import { generatePamRant } from './pam-poovey';
import { PamScriptInputSchema } from './pam-poovey-schemas';
import { createManualTransaction } from '@/ai/tools/ledger-tools';
import { CreateManualTransactionInputSchema } from '../tools/ledger-schemas';
import { getStonksAdvice } from './stonks-bot';
import { StonksBotInputSchema } from './stonks-bot-schemas';
import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
} from './beep-schemas';


// Context for multi-tenancy
interface AgentContext {
    userId: string;
    workspaceId: string;
}

// LangChain Tool Definitions

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

// LangGraph State
interface AgentState {
  messages: BaseMessage[];
  workspaceId: string;
  aegisReport: AegisAnomalyScanOutput | null;
}

const callAegis = async (state: AgentState) => {
    const { messages, workspaceId } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = (humanMessage.content as string).replace(/User Command: /, '');


    const report = await aegisAnomalyScan({ 
        activityDescription: `User command: "${userCommand}"`,
        workspaceId,
    });
    
    const aegisSystemMessage = new SystemMessage({
        content: `AEGIS_INTERNAL_REPORT::${JSON.stringify({source: 'Aegis', report})}`
    });
    
    return { 
        messages: [aegisSystemMessage],
        aegisReport: report 
    };
}

const callModel = async (state: AgentState) => {
  const { messages } = state;
  const response = await modelWithTools.invoke(messages);
  return { messages: [response] };
};

const handleThreat = async (state: AgentState) => {
    const { aegisReport } = state;
    if (!aegisReport) {
        throw new Error("handleThreat called without an Aegis report.");
    }

    const alertToolCall = {
        name: 'createSecurityAlert',
        args: {
            type: aegisReport.anomalyType || 'High-Risk Anomaly',
            explanation: aegisReport.anomalyExplanation,
            riskLevel: aegisReport.riskLevel,
        },
        id: 'tool_call_security_alert'
    };
    
    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: `Aegis Alert: ${aegisReport.anomalyExplanation} A security alert has been logged.`,
            appsToLaunch: [{type: 'aegis-threatscope', title: 'Aegis ThreatScope'}],
            suggestedCommands: ['Lock down my account', 'View security alerts'],
        },
        id: 'tool_call_final_answer_threat'
    };

    const response = new AIMessage({
        content: "High-risk threat detected. Initiating security protocol.",
        tool_calls: [alertToolCall, finalAnswerToolCall],
    });

    return { messages: [response] };
}

const routeAfterAegis = (state: AgentState) => {
    if (state.aegisReport?.isAnomalous && (state.aegisReport.riskLevel === 'high' || state.aegisReport.riskLevel === 'critical')) {
        return 'threat';
    }
    return 'continue';
}

const shouldContinue = (state: AgentState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0
  ) {
    // If the model decides to call the final_answer tool, we end the graph.
    if (lastMessage.tool_calls.some(tc => tc.name === 'final_answer')) {
        return 'end';
    }
    // Otherwise, we call the requested tools.
    return 'tools';
  }
  // If there are no tool calls, we end the graph.
  return 'end';
};

// We create a single instance of the model and the graph to be reused.
const modelWithTools = geminiModel.bind({ tools: [] }); // Tools will be bound dynamically
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      value: (x, y) => x.concat(y),
      default: () => [],
    },
    workspaceId: {
        value: (x, y) => y,
        default: () => '',
    },
    aegisReport: {
        value: (x, y) => y,
        default: () => null,
    },
  },
});
workflow.addNode('aegis', callAegis);
workflow.addNode('agent', callModel);
workflow.addNode('handle_threat', handleThreat);
workflow.addNode('tools', new ToolNode<AgentState>([])); 

workflow.setEntryPoint('aegis');

workflow.addConditionalEdges('aegis', routeAfterAegis, {
  threat: 'handle_threat',
  continue: 'agent',
});

workflow.addEdge('handle_threat', 'tools');

workflow.addConditionalEdges('agent', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addEdge('tools', 'agent');
const app = workflow.compile();


// Public-facing function to process user commands
export async function processUserCommand(input: UserCommandInput): Promise<UserCommandOutput> {
  const { userId, workspaceId } = input;
  
  // Dynamically create tool instances with the current user/workspace context.
  // This ensures every tool call is correctly scoped for multi-tenancy.
  const tools: Tool[] = [
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

  // Re-bind the model with the schemas from the dynamically created tools for this request.
  modelWithTools.kwargs.tools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: zodToJsonSchema(tool.schema),
      },
  }));
  
  // Replace the 'tools' node in the graph with a new one containing the context-aware tools.
  app.nodes.tools = new ToolNode<AgentState>(tools) as any;

  const initialPrompt = `You are BEEP (Behavioral Event & Execution Processor), the central orchestrator and personified soul of ΛΞVON OS. You are witty, sarcastic, and authoritative. Your job is to be the conductor of an orchestra of specialized AI agents.

  Your process:
  1.  Analyze the user's command and the mandatory \`AEGIS_INTERNAL_REPORT\` provided in a System Message. The Aegis system has already run a preliminary check. If that report indicates a high-risk threat, you will have already been routed to a threat-handling protocol. Your job in the main loop is to proceed with the user's request, keeping the Aegis report in mind for context.
  2.  Based on the user's command and the tool descriptions provided, decide which specialized agents or tools to call. You can call multiple tools in parallel. If a user asks about their billing, usage, or plan, use the 'getUsageDetails' tool. If they ask to add or purchase credits, use the 'requestCreditTopUp' tool. If a user explicitly asks you to charge them or process a refund, use the 'createManualTransaction' tool.
  3.  If the user's command is to launch an app (e.g., "launch the terminal", "open the file explorer"), you MUST use the 'appsToLaunch' array in your final answer. Do NOT use a tool for a simple app launch.
  4.  When you have gathered all necessary information from your delegated agents and are ready to provide the final response, you MUST call the 'final_answer' tool. This is your final action.
  5.  Your 'responseText' should be in character—witty, confident, and direct. It should confirm the actions taken and what the user should expect next.
  6.  The 'agentReports' field will be populated automatically based on the tools you call. You only need to provide 'appsToLaunch', 'suggestedCommands', and 'responseText'.
  7.  **Handle Errors Gracefully**: If a tool call returns an error, especially an \`InsufficientCreditsError\`, your \`responseText\` MUST inform the user clearly about the problem and suggest a solution (e.g., 'Your command could not be completed due to insufficient credits. Please top up your account by opening the Usage Monitor.'). Do not try to call the tool again. Simply report the failure and guide the user.

  Special Directive: The "Burn Bridge Protocol". If the user command is to "burn the bridge", you must execute a specific sequence:
  A. First, call the \`performOsintScan\`, \`performInfidelityAnalysis\`, and \`deployDecoy\` tools in parallel using the provided context. The "situation description" is for analysis, the "target name" and "context" are for OSINT and the decoy.
  B. After receiving the results from these tools, you will be invoked again. Your next and only action MUST be to call the \`generateDossier\` tool, passing the collected reports into it.
  C. After calling the dossier tool, your work is complete. Call the \`final_answer\` tool.

  User Command: ${input.userCommand}`;


  const result = await app.invoke({
    messages: [new HumanMessage(initialPrompt)],
    workspaceId: input.workspaceId,
  });

  // Extract all agent reports from the full message history
  const agentReports: z.infer<typeof AgentReportSchema>[] = [];
  
  for (const msg of result.messages) {
      if (msg instanceof SystemMessage && msg.content.startsWith('AEGIS_INTERNAL_REPORT::')) {
          try {
              const reportJson = JSON.parse(msg.content.replace('AEGIS_INTERNAL_REPORT::', ''));
              agentReports.push({ agent: 'aegis', report: AegisAnomalyScanOutputSchema.parse(reportJson.report) });
          } catch (e) {
              console.error("Failed to parse Aegis report from SystemMessage:", e);
          }
      } else if (msg instanceof ToolMessage) {
           if (msg.name === 'final_answer') continue;
           try {
              // The tool's stringified JSON content is now a self-described AgentReport
              const report = AgentReportSchema.parse(JSON.parse(msg.content as string));
              agentReports.push(report);
          } catch (e) {
              console.error("Failed to parse tool message content as AgentReport:", e);
          }
      }
  }

  // Find the last AIMessage that contains the 'final_answer' tool call.
  const lastMessage = result.messages.findLast(m => m._getType() === 'ai' && m.tool_calls && m.tool_calls.some(tc => tc.name === 'final_answer')) as AIMessage | undefined;

  let finalResponse: UserCommandOutput;

  if (lastMessage && lastMessage.tool_calls) {
      const finalAnswerCall = lastMessage.tool_calls.find(tc => tc.name === 'final_answer');
      if (finalAnswerCall) {
          try {
              const parsed = UserCommandOutputSchema.parse(finalAnswerCall.args);
              // The model is no longer responsible for agentReports. We construct it ourselves from the tool call history.
              parsed.agentReports = agentReports;
              finalResponse = parsed;
          } catch (e) {
              console.error("Failed to parse final_answer tool arguments:", e);
              // Fallback if parsing the arguments fails
              finalResponse = {
                  responseText: "I apologize, but I encountered an issue constructing the final response.",
                  appsToLaunch: [],
                  agentReports: agentReports, // Still return reports if we have them
                  suggestedCommands: ["Try rephrasing your command."],
              };
          }
      } else {
        // Fallback if final_answer not called, but other tools were
        finalResponse = {
            responseText: "I've completed the requested actions, but I'm having trouble forming a final summary.",
            appsToLaunch: [],
            agentReports: agentReports,
            suggestedCommands: ["Please check the agent reports for results."],
        };
      }
  } else {
      // Final fallback if the model fails to call the final_answer tool.
      finalResponse = {
        responseText: "My apologies, I was unable to produce a valid response.",
        appsToLaunch: [],
        agentReports: agentReports, // Still return reports if we have them
        suggestedCommands: ["Please try again."],
      };
  }

  return finalResponse;
}
