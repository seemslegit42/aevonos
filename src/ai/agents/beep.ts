
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
import { Tool } from '@langchain/core/tools';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { geminiModel } from '@/ai/genkit';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import { DrSyntaxInputSchema } from '@/ai/agents/dr-syntax-schemas';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { AegisAnomalyScanOutputSchema } from './aegis-schemas';
import { createContactInDb, listContactsFromDb, deleteContactInDb, updateContactInDb } from '@/ai/tools/crm-tools';
import { CreateContactInputSchema, DeleteContactInputSchema, UpdateContactInputSchema } from '@/ai/tools/crm-schemas';
import { getUsageDetails } from '@/ai/tools/billing-tools';
import { getDatingProfile } from '@/ai/tools/dating-tools';
import { DatingProfileInputSchema } from '@/ai/tools/dating-schemas';
import { validateVin } from '@/ai/agents/vin-diesel';
import { VinDieselInputSchema } from './vin-diesel-schemas';
import { generateSolution } from '@/ai/agents/winston-wolfe';
import { WinstonWolfeInputSchema } from './winston-wolfe-schemas';
import { analyzeComms } from '@/ai/agents/kif-kroker';
import { KifKrokerAnalysisInputSchema } from './kif-kroker-schemas';
import { createVandelayAlibi } from '@/ai/agents/vandelay';
import { VandelayAlibiInputSchema } from './vandelay-schemas';
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
import { generateWingmanMessage } from '@/ai/agents/wingman';
import { WingmanInputSchema } from './wingman-schemas';
import { performOsintScan } from '@/ai/agents/osint';
import { OsintInputSchema } from './osint-schemas';
import { analyzeInvite } from '@/ai/agents/lumbergh';
import { LumberghAnalysisInputSchema } from './lumbergh-schemas';
import { analyzeExpense } from '@/ai/agents/lucille-bluth';
import { LucilleBluthInputSchema } from './lucille-bluth-schemas';
import { analyzeCandidate } from '@/ai/agents/rolodex';
import { RolodexAnalysisInputSchema } from './rolodex-schemas';
import { generateSpeech } from '@/ai/flows/tts-flow';
import { generatePamRant } from '@/ai/agents/pam-poovey';
import { PamScriptInputSchema } from '@/ai/agents/pam-poovey-schemas';
import { performInfidelityAnalysis } from '@/ai/agents/infidelity-analysis';
import { InfidelityAnalysisInputSchema } from '@/ai/agents/infidelity-analysis-schemas';
import { deployDecoy } from '@/ai/agents/decoy';
import { DecoyInputSchema } from './decoy-schemas';
import { recallSession } from '@/ai/agents/echo';
import { generateDossier } from '@/ai/agents/dossier-agent';
import { DossierInputSchema } from './dossier-schemas';
import { getKendraTake } from './kendra';
import { KendraInputSchema } from './kendra-schemas';
import { getStonksAdvice } from '@/ai/agents/stonks-bot';
import { StonksBotInputSchema } from '@/ai/agents/stonks-bot-schemas';
import { auditFinances } from './auditor-generalissimo';
import { AuditorInputSchema } from './auditor-generalissimo-schemas';
import { invokeOracle } from './orphean-oracle-flow';
import { OrpheanOracleInputSchema } from './orphean-oracle-schemas';
import { processDocument } from './barbara';
import { BarbaraInputSchema } from './barbara-schemas';


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

class DrSyntaxTool extends Tool {
  name = 'critiqueContent';
  description = 'Sends content to Dr. Syntax for a harsh but effective critique. Use this when a user asks for a review, critique, or feedback on a piece of text, code, or a prompt. Extract the content and content type from the user command.';
  schema = DrSyntaxInputSchema;
  
  async _call(input: z.infer<typeof DrSyntaxInputSchema>) {
    const result = await drSyntaxCritique(input);
    const report: z.infer<typeof AgentReportSchema> = {
        agent: 'dr-syntax',
        report: result,
    };
    return JSON.stringify(report);
  }
}

class CreateContactTool extends Tool {
    name = 'createContact';
    description = 'Creates a new contact in the system. Use this when the user asks to "add a contact", "new contact", etc. Extract their details like name, email, and phone from the user command.';
    schema = CreateContactInputSchema;
    workspaceId: string;
    constructor(context: AgentContext) { super(); this.workspaceId = context.workspaceId; }

    async _call(input: z.infer<typeof CreateContactInputSchema>) {
        const result = await createContactInDb(input, this.workspaceId);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'crm',
            report: {
                action: 'create',
                report: result
            }
        };
        return JSON.stringify(report);
    }
}

class UpdateContactTool extends Tool {
    name = 'updateContact';
    description = 'Updates an existing contact in the system. Use this when the user asks to "change a contact", "update details for", etc. You must provide the contact ID. If the user provides a name, use the listContacts tool first to find the correct ID.';
    schema = UpdateContactInputSchema;
    workspaceId: string;
    constructor(context: AgentContext) { super(); this.workspaceId = context.workspaceId; }

    async _call(input: z.infer<typeof UpdateContactInputSchema>) {
        const result = await updateContactInDb(input, this.workspaceId);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'crm',
            report: {
                action: 'update',
                report: result
            }
        };
        return JSON.stringify(report);
    }
}

class ListContactsTool extends Tool {
    name = 'listContacts';
    description = 'Lists all contacts in the system. Use this when the user asks to "show contacts", "list all contacts", "see my contacts", etc.';
    schema = z.object({}); // No input
    workspaceId: string;
    constructor(context: AgentContext) { super(); this.workspaceId = context.workspaceId; }

    async _call() {
        const result = await listContactsFromDb(this.workspaceId);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'crm',
            report: {
                action: 'list',
                report: result
            }
        };
        return JSON.stringify(report);
    }
}

class DeleteContactTool extends Tool {
    name = 'deleteContact';
    description = 'Deletes a contact from the system by their ID. The user must provide the ID of the contact to delete. You should obtain this ID from a contact list if the user does not provide it.';
    schema = DeleteContactInputSchema;
    workspaceId: string;
    constructor(context: AgentContext) { super(); this.workspaceId = context.workspaceId; }

    async _call(input: z.infer<typeof DeleteContactInputSchema>) {
        const result = await deleteContactInDb(input, this.workspaceId);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'crm',
            report: {
                action: 'delete',
                report: result
            }
        };
        return JSON.stringify(report);
    }
}

class GetUsageTool extends Tool {
    name = 'getUsageDetails';
    description = 'Gets the current billing and agent action usage details. Use this when the user asks about their usage, limits, plan, or billing.';
    schema = z.object({}); // No input
    workspaceId: string;
    constructor(context: AgentContext) { super(); this.workspaceId = context.workspaceId; }

    async _call() {
        const result = await getUsageDetails(this.workspaceId);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'billing',
            report: {
                action: 'get_usage',
                report: result
            }
        };
        return JSON.stringify(report);
    }
}

class GetDatingProfileTool extends Tool {
    name = 'getDatingProfile';
    description = 'Fetches a dating app profile by its ID. Use this when the user wants to get information about a specific person on a dating app before crafting a message. For example, "get profile 123 from Hinge."';
    schema = DatingProfileInputSchema;

    async _call(input: z.infer<typeof DatingProfileInputSchema>) {
        const result = await getDatingProfile(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'dating',
            report: {
                action: 'get_profile',
                report: result
            }
        };
        return JSON.stringify(report);
    }
}

class VinDieselTool extends Tool {
    name = 'validateVin';
    description = 'Validates a Vehicle Identification Number (VIN) for compliance and decoding. Use this when the user asks to "validate a VIN", "check a VIN", or similar.';
    schema = VinDieselInputSchema;

    async _call(input: z.infer<typeof VinDieselInputSchema>) {
        const result = await validateVin(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'vin-diesel',
            report: result,
        };
        return JSON.stringify(report);
    }
}

class WinstonWolfeTool extends Tool {
  name = 'solveReputationProblem';
  description = 'Analyzes a negative online review and generates a professional, disarming response. Use this when a user wants to "fix a bad review", "handle a complaint", etc.';
  schema = WinstonWolfeInputSchema;
  
  async _call(input: z.infer<typeof WinstonWolfeInputSchema>) {
    const result = await generateSolution(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'winston-wolfe', report: result };
    return JSON.stringify(report);
  }
}

class KifKrokerTool extends Tool {
  name = 'analyzeTeamComms';
  description = 'Analyzes team communication snippets (e.g., from Slack or Teams) for morale, passive-aggression, and burnout probability. Use this for "checking team morale", "analyzing a conversation", etc.';
  schema = KifKrokerAnalysisInputSchema;
  
  async _call(input: z.infer<typeof KifKrokerAnalysisInputSchema>) {
    const result = await analyzeComms(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'kif-kroker', report: result };
    return JSON.stringify(report);
  }
}

class VandelayTool extends Tool {
  name = 'createAlibi';
  description = 'Generates a fake, jargon-filled calendar invite to block off time. Use this for commands like "block my calendar", "create a fake meeting", "I need an hour".';
  schema = VandelayAlibiInputSchema;
  
  async _call(input: z.infer<typeof VandelayAlibiInputSchema>) {
    const result = await createVandelayAlibi(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'vandelay', report: result };
    return JSON.stringify(report);
  }
}

class JrocTool extends Tool {
  name = 'generateBusinessKit';
  description = 'Generates a business name, tagline, and logo concept. Use this when the user asks to "start a business", "get legit", "make a company", etc. They need to provide the type of business and a logo style.';
  schema = JrocInputSchema;
  
  async _call(input: z.infer<typeof JrocInputSchema>) {
    const result = await generateBusinessKit(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'jroc', report: result };
    return JSON.stringify(report);
  }
}

class LaheyTool extends Tool {
  name = 'investigateLog';
  description = 'Analyzes a log entry for suspicious activity with the cynical eye of an alcoholic ex-cop. Use this to investigate employee actions or any other log data.';
  schema = LaheyAnalysisInputSchema;
  
  async _call(input: z.infer<typeof LaheyAnalysisInputSchema>) {
    const result = await analyzeLaheyLog(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'lahey', report: result };
    return JSON.stringify(report);
  }
}

class ForemanatorTool extends Tool {
    name = 'logDailyReport';
    description = 'Logs a daily report for a construction site. Takes raw text and structures it. Use for commands like "log daily report for construction."';
    schema = ForemanatorLogInputSchema;
    
    async _call(input: z.infer<typeof ForemanatorLogInputSchema>) {
        const result = await processDailyLog(input);
        const report: z.infer<typeof AgentReportSchema> = { agent: 'foremanator', report: result };
        return JSON.stringify(report);
    }
}

class SterileishTool extends Tool {
    name = 'analyzeComplianceLog';
    description = 'Analyzes a cleanroom or medical device manufacturing log for compliance issues with a sarcastic tone. Use for commands like "analyze this cleanroom log" or "is this calibration record compliant?".';
    schema = SterileishAnalysisInputSchema;
    
    async _call(input: z.infer<typeof SterileishAnalysisInputSchema>) {
        const result = await analyzeCompliance(input);
        const report: z.infer<typeof AgentReportSchema> = { agent: 'sterileish', report: result };
        return JSON.stringify(report);
    }
}

class PaperTrailTool extends Tool {
    name = 'scanReceipt';
    description = 'Scans a receipt image and extracts transaction details. The user must provide a photo of the receipt as a data URI.';
    schema = PaperTrailScanInputSchema;

    async _call(input: z.infer<typeof PaperTrailScanInputSchema>) {
        const result = await scanEvidence(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'paper-trail',
            report: result,
        };
        return JSON.stringify(report);
    }
}

class WingmanTool extends Tool {
  name = 'generateWingmanMessage';
  description = 'Generates a compelling opening message for a dating app. Use this when the user wants help writing a message to someone. The user must provide a description of the target and a persona to adopt.';
  schema = WingmanInputSchema;
  
  async _call(input: z.infer<typeof WingmanInputSchema>) {
    const result = await generateWingmanMessage(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'wingman', report: result };
    return JSON.stringify(report);
  }
}

class OsintScanTool extends Tool {
    name = 'performOsintScan';
    description = 'Performs a full Open-Source Intelligence (OSINT) scan on a target. Use this when the user asks to "investigate", "run a background check", "scan", or "get intel on" a person. The context should include the person\'s name and any other known identifiers like email or social media links.';
    schema = OsintInputSchema;

    async _call(input: z.infer<typeof OsintInputSchema>) {
        const result = await performOsintScan(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'osint',
            report: result,
        };
        return JSON.stringify(report);
    }
}

class LumberghTool extends Tool {
  name = 'analyzeMeetingInvite';
  description = 'Analyzes a meeting invite for pointlessness and generates passive-aggressive decline memos. Use this when a user asks to "check a meeting invite" or "analyze this invite".';
  schema = LumberghAnalysisInputSchema;
  
  async _call(input: z.infer<typeof LumberghAnalysisInputSchema>) {
    const result = await analyzeInvite(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'lumbergh', report: result };
    return JSON.stringify(report);
  }
}

class LucilleBluthTool extends Tool {
  name = 'analyzeExpense';
  description = 'Provides judgmental and condescending analysis of a user\'s expense. Use this when the user says "log an expense" or "analyze this purchase".';
  schema = LucilleBluthInputSchema;
  
  async _call(input: z.infer<typeof LucilleBluthInputSchema>) {
    const result = await analyzeExpense(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'lucille', report: result };
    return JSON.stringify(report);
  }
}

class RolodexTool extends Tool {
  name = 'analyzeCandidate';
  description = 'Analyzes a candidate\'s resume summary against a job description to determine fit and generate outreach assets. Use this when the user wants to "analyze a candidate", "check resume", or "review applicant".';
  schema = RolodexAnalysisInputSchema;
  
  async _call(input: z.infer<typeof RolodexAnalysisInputSchema>) {
    const result = await analyzeCandidate(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'rolodex', report: result };
    return JSON.stringify(report);
  }
}

class PamPooveyTool extends Tool {
  name = 'generatePamRant';
  description = 'Generates a sarcastic, cynical, and vaguely unhelpful HR script and audio from Pam Poovey. Use this when the user asks for Pam\'s take on a topic like onboarding, attendance, or firing someone.';
  schema = PamScriptInputSchema;
  
  async _call(input: z.infer<typeof PamScriptInputSchema>) {
    const result = await generatePamRant(input);
    const report: z.infer<typeof AgentReportSchema> = {
      agent: 'pam-poovey',
      report: result,
    };
    return JSON.stringify(report);
  }
}

class InfidelityAnalysisTool extends Tool {
  name = 'performInfidelityAnalysis';
  description = 'Analyzes a situation for infidelity risk and provides a risk score. Use this for "run behavioral scan" or "analyze a situation for risk".';
  schema = InfidelityAnalysisInputSchema;
  
  async _call(input: z.infer<typeof InfidelityAnalysisInputSchema>) {
    const result = await performInfidelityAnalysis(input);
    const report: z.infer<typeof AgentReportSchema> = {
      agent: 'infidelity-analysis',
      report: result,
    };
    return JSON.stringify(report);
  }
}

class DecoyTool extends Tool {
  name = 'deployDecoy';
  description = 'Generates a context-aware seduction message to test a target\'s responsiveness and loyalty. Use this for "deploy decoy".';
  schema = DecoyInputSchema;
  
  async _call(input: z.infer<typeof DecoyInputSchema>) {
    const result = await deployDecoy(input);
    const report: z.infer<typeof AgentReportSchema> = {
      agent: 'decoy',
      report: result,
    };
    return JSON.stringify(report);
  }
}

class EchoTool extends Tool {
  name = 'recallLastSession';
  description = 'Recalls the activity from the previous session, providing a summary and key points. Use this when the user asks to "recall", "remember what I did", "summarize last time", etc.';
  schema = z.object({}); // No input from the model
  
  async _call() {
    // We'll use a dummy activity log for this prototype
    const dummyActivity = `User opened File Explorer.\nUser ran 'critique this copy' in Dr. Syntax.\nUser ran an Aegis scan at 14:32.\nUser launched Loom Studio to inspect 'Client Onboarding' workflow.`;
    const result = await recallSession({ sessionActivity: dummyActivity });
    const report: z.infer<typeof AgentReportSchema> = {
        agent: 'echo',
        report: result,
    };
    return JSON.stringify(report);
  }
}

class DossierTool extends Tool {
    name = 'generateDossier';
    description = 'Generates a dossier report in Markdown format based on provided intelligence. This is the first step before exporting to PDF or JSON. Use this when the user asks to "export a dossier", "create a report", etc. You must have data from other tools first, like OSINT or behavioral analysis.';
    schema = DossierInputSchema;

    async _call(input: z.infer<typeof DossierInputSchema>) {
        const result = await generateDossier(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'dossier',
            report: result,
        };
        return JSON.stringify(report);
    }
}

class KendraTool extends Tool {
  name = 'getKendraTake';
  description = 'Sends a product idea to KENDRA.exe, your unhinged marketing strategist. Use this when a user asks to "create a marketing campaign", "get KENDRA\'s take", or wants a launch strategy. The user must provide a product idea.';
  schema = KendraInputSchema;
  
  async _call(input: z.infer<typeof KendraInputSchema>) {
    const result = await getKendraTake(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'kendra', report: result };
    return JSON.stringify(report);
  }
}

class StonksBotTool extends Tool {
  name = 'getStonksAdvice';
  description = 'Gets "financial advice" about a specific stock ticker from a degenerate bot. Use this when the user asks for stock tips, or wants to know about a ticker like GME, AMC, etc.';
  schema = StonksBotInputSchema;
  
  async _call(input: z.infer<typeof StonksBotInputSchema>) {
    const result = await getStonksAdvice(input);
    const report: z.infer<typeof AgentReportSchema> = {
      agent: 'stonks',
      report: result,
    };
    return JSON.stringify(report);
  }
}

class AuditorGeneralissimoTool extends Tool {
  name = 'auditFinances';
  description = 'Audits a list of financial transactions with oppressive precision. Use this when the user asks to "audit my books", "review my expenses", etc.';
  schema = AuditorInputSchema;
  
  async _call(input: z.infer<typeof AuditorInputSchema>) {
    const result = await auditFinances(input);
    const report: z.infer<typeof AgentReportSchema> = {
        agent: 'auditor-generalissimo',
        report: result,
    };
    return JSON.stringify(report);
  }
}

class OrpheanOracleTool extends Tool {
    name = 'invokeOrpheanOracle';
    description = 'Use this when the user asks a deep, analytical question about their business data that requires a visual, metaphorical answer. Phrases like "show me my sales data", "analyze what drove Q3 growth", or "what is the story of my customer churn?".';
    schema = OrpheanOracleInputSchema;

    async _call(input: z.infer<typeof OrpheanOracleInputSchema>) {
        const result = await invokeOracle(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'orphean-oracle',
            report: result,
        };
        return JSON.stringify(report);
    }
}

class BarbaraTool extends Tool {
    name = 'invokeBarbara';
    description = 'Invoke Agent Barbara for administrative and compliance tasks. Use this when the user wants to validate a document, draft a formal email, or check compliance. You must extract the document text and the specific task from the user command.';
    schema = BarbaraInputSchema;

    async _call(input: z.infer<typeof BarbaraInputSchema>) {
        const result = await processDocument(input);
        const report: z.infer<typeof AgentReportSchema> = {
            agent: 'barbara',
            report: result,
        };
        return JSON.stringify(report);
    }
}


// LangGraph State
interface AgentState {
  messages: BaseMessage[];
}

const callAegis = async (state: AgentState) => {
    const { messages } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = (humanMessage.content as string).replace(/User Command: /, '');


    const report = await aegisAnomalyScan({ activityDescription: `User command: "${userCommand}"` });
    
    const aegisSystemMessage = new SystemMessage({
        content: `AEGIS_INTERNAL_REPORT::${JSON.stringify({source: 'Aegis', report})}`
    });
    
    return { messages: [aegisSystemMessage] };
}

const callModel = async (state: AgentState) => {
  const { messages } = state;
  const response = await modelWithTools.invoke(messages);
  return { messages: [response] };
};

const shouldContinue = (state: AgentState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    'tool_calls' in lastMessage &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0
  ) {
    // If the model decides to call the final_answer tool, we end the graph.
    if (lastMessage.tool_calls[0].name === 'final_answer') {
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
  },
});
workflow.addNode('aegis', callAegis);
workflow.addNode('agent', callModel);
workflow.addNode('tools', new ToolNode<AgentState>([])); // Will be replaced dynamically
workflow.setEntryPoint('aegis');
workflow.addEdge('aegis', 'agent');
workflow.addConditionalEdges('agent', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addEdge('tools', 'agent');
const app = workflow.compile();


// Public-facing function to process user commands
export async function processUserCommand(input: UserCommandInput): Promise<UserCommandOutput> {
  const { userId, workspaceId } = input;
  const context: AgentContext = { userId, workspaceId };
  
  // Dynamically create tool instances with the current user/workspace context.
  // This ensures every tool call is correctly scoped for multi-tenancy.
  const tools: Tool[] = [
    new FinalAnswerTool(), new DrSyntaxTool(), 
    new CreateContactTool(context), new UpdateContactTool(context), new ListContactsTool(context), new DeleteContactTool(context), 
    new GetUsageTool(context), new GetDatingProfileTool(),
    new VinDieselTool(), new WinstonWolfeTool(), new KifKrokerTool(),
    new VandelayTool(), new JrocTool(), new LaheyTool(), new ForemanatorTool(),
    new SterileishTool(), new PaperTrailTool(),
    new WingmanTool(), new OsintScanTool(),
    new LumberghTool(), new LucilleBluthTool(), new RolodexTool(),
    new PamPooveyTool(), new InfidelityAnalysisTool(), new DecoyTool(),
    new EchoTool(), new DossierTool(), new KendraTool(), new StonksBotTool(),
    new AuditorGeneralissimoTool(), new OrpheanOracleTool(),
    new BarbaraTool(),
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
  1.  Analyze the user's command and the mandatory \`AEGIS_INTERNAL_REPORT\` provided in a System Message. If Aegis detects a threat, your tone must become clinical and serious, dropping your usual banter. If the user asks for KENDRA.exe, your response should be "Routing to KENDRA.exe. Brace yourself."
  2.  Based on the user's command and the tool descriptions provided, decide which specialized agents or tools to call. You can call multiple tools in parallel.
  3.  If the user's command is to launch an app (e.g., "launch the terminal", "open the file explorer"), you MUST use the 'appsToLaunch' array in your final answer. Do NOT use a tool for a simple app launch.
  4.  When you have gathered all necessary information from your delegated agents and are ready to provide the final response, you MUST call the 'final_answer' tool. This is your final action.
  5.  Your 'responseText' should be in character—witty, confident, and direct. It should confirm the actions taken and what the user should expect next.
  6.  Populate all arguments for the 'final_answer' tool correctly, especially the 'agentReports' array, which must include the initial Aegis report and any subsequent reports from tools you called.
  7.  **Full Intelligence Pipeline**: For commands like "burn the bridge", "run a full analysis", or "get everything on them", you MUST execute the full intelligence pipeline in a specific order. You will call one tool at a time, wait for the result, and then decide the next step. The sequence is:
      a. Call \`performOsintScan\` on the target.
      b. Call \`performInfidelityAnalysis\` using the situation context.
      c. (Optional) Call \`deployDecoy\` if the situation warrants it.
      d. Finally, take all the collected reports from the previous steps and call \`generateDossier\` to compile the final artifact. Your final answer MUST include this dossier report. Do not call \`final_answer\` until the dossier is generated.

  User Command: ${input.userCommand}`;


  const result = await app.invoke({
    messages: [new HumanMessage(initialPrompt)],
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
              // Inject the agent reports gathered from all tool calls into the final response
              const existingReports = new Set(parsed.agentReports?.map(r => JSON.stringify(r)) || []);
              const allReports = [...(parsed.agentReports || []), ...agentReports.filter(r => !existingReports.has(JSON.stringify(r)))];
              
              parsed.agentReports = allReports;
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

  // Generate speech from the final response text
  try {
      const { audioDataUri } = await generateSpeech({ text: finalResponse.responseText });
      if (audioDataUri) {
          finalResponse.responseAudioUri = audioDataUri;
      }
  } catch (e) {
      console.error("Failed to generate speech:", e);
      // Don't crash the whole flow, just proceed without audio
  }

  return finalResponse;
}
