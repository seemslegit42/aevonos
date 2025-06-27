
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
import { 
    handleDrSyntaxCritique, 
    generateSolution, 
    analyzeComms,
    createVandelayAlibi,
    analyzeInvite,
    analyzeExpense,
    analyzeCandidate,
    handleInfidelityAnalysis,
    handleGenerateWingmanMessage,
    handleVinDieselValidation,
    scanEvidence
} from '@/app/actions';
import {
  DrSyntaxInputSchema,
} from '@/ai/agents/dr-syntax-schemas';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { AegisAnomalyScanOutputSchema } from './aegis-schemas';
import { createContactInDb, listContactsFromDb, deleteContactInDb, updateContactInDb } from '@/ai/tools/crm-tools';
import { CreateContactInputSchema, DeleteContactInputSchema, UpdateContactInputSchema } from '@/ai/tools/crm-schemas';
import { getUsageDetails } from '@/ai/tools/billing-tools';
import { VinDieselInputSchema } from './vin-diesel-schemas';
import { WinstonWolfeInputSchema } from './winston-wolfe-schemas';
import { KifKrokerAnalysisInputSchema } from './kif-kroker-schemas';
import { VandelayAlibiInputSchema } from './vandelay-schemas';
import { PaperTrailScanInputSchema } from './paper-trail-schemas';
import { LumberghAnalysisInputSchema } from './lumbergh-schemas';
import { LucilleBluthInputSchema } from './lucille-bluth-schemas';
import { RolodexAnalysisInputSchema } from './rolodex-schemas';
import { InfidelityAnalysisInputSchema } from './infidelity-analysis-schemas';
import { WingmanInputSchema } from './wingman-schemas';

import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
} from './beep-schemas';


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
    const result = await handleDrSyntaxCritique(input);
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

    async _call(input: z.infer<typeof CreateContactInputSchema>) {
        const result = await createContactInDb(input);
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

    async _call(input: z.infer<typeof UpdateContactInputSchema>) {
        const result = await updateContactInDb(input);
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

    async _call() {
        const result = await listContactsFromDb();
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

    async _call(input: z.infer<typeof DeleteContactInputSchema>) {
        const result = await deleteContactInDb(input);
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

    async _call() {
        const result = await getUsageDetails();
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

class VinDieselTool extends Tool {
    name = 'validateVin';
    description = 'Validates a Vehicle Identification Number (VIN) for compliance and decoding. Use this when the user asks to "validate a VIN", "check a VIN", or similar.';
    schema = VinDieselInputSchema;

    async _call(input: z.infer<typeof VinDieselInputSchema>) {
        const result = await handleVinDieselValidation(input);
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

class PaperTrailTool extends Tool {
    name = 'scanReceipt';
    description = 'Scans a photo of a receipt to extract details. Use this when a user asks to "scan a receipt" or "log an expense from a photo". The user must provide the receipt image as a data URI.';
    schema = PaperTrailScanInputSchema;

    async _call(input: z.infer<typeof PaperTrailScanInputSchema>) {
        const result = await scanEvidence(input);
        const report: z.infer<typeof AgentReportSchema> = { agent: 'paper-trail', report: result };
        return JSON.stringify(report);
    }
}

class LumberghTool extends Tool {
  name = 'analyzeMeetingInvite';
  description = 'Analyzes a meeting invite for red flags (no agenda, too many attendees, buzzwords) and suggests passive-aggressive decline memos. Use for "check this meeting invite", "should I go to this meeting?".';
  schema = LumberghAnalysisInputSchema;
  
  async _call(input: z.infer<typeof LumberghAnalysisInputSchema>) {
    const result = await analyzeInvite(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'project-lumbergh', report: result };
    return JSON.stringify(report);
  }
}

class LucilleBluthTool extends Tool {
  name = 'judgeExpense';
  description = 'Logs an expense and provides a witty, judgmental comment in the persona of Lucille Bluth. Use for "log an expense", "track my spending".';
  schema = LucilleBluthInputSchema;
  
  async _call(input: z.infer<typeof LucilleBluthInputSchema>) {
    const result = await analyzeExpense(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'lucille-bluth', report: result };
    return JSON.stringify(report);
  }
}

class RolodexTool extends Tool {
  name = 'analyzeCandidate';
  description = 'Analyzes a candidate\'s profile against a job description to generate a fit score and an outreach icebreaker. Use for "analyze this candidate", "review a resume for [job description]".';
  schema = RolodexAnalysisInputSchema;
  
  async _call(input: z.infer<typeof RolodexAnalysisInputSchema>) {
    const result = await analyzeCandidate(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'rolodex', report: result };
    return JSON.stringify(report);
  }
}

class InfidelityRadarTool extends Tool {
  name = 'analyzeRelationshipSituation';
  description = 'Performs a risk analysis on a described relationship situation to check for signs of infidelity or deception. Use for "is my partner cheating?", "analyze my relationship".';
  schema = InfidelityAnalysisInputSchema;
  
  async _call(input: z.infer<typeof InfidelityAnalysisInputSchema>) {
    const result = await handleInfidelityAnalysis(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'infidelity-radar', report: result };
    return JSON.stringify(report);
  }
}

class WingmanTool extends Tool {
  name = 'generateOpeningMessage';
  description = 'Generates a compelling opening message for a dating app based on a target\'s profile and a chosen persona. Use for "write a dating message", "help me with tinder".';
  schema = WingmanInputSchema;
  
  async _call(input: z.infer<typeof WingmanInputSchema>) {
    const result = await handleGenerateWingmanMessage(input);
    const report: z.infer<typeof AgentReportSchema> = { agent: 'beep-wingman', report: result };
    return JSON.stringify(report);
  }
}


const tools: Tool[] = [
    new FinalAnswerTool(), new DrSyntaxTool(), 
    new CreateContactTool(), new UpdateContactTool(), new ListContactsTool(), new DeleteContactTool(), 
    new GetUsageTool(), new VinDieselTool(), new WinstonWolfeTool(), new KifKrokerTool(),
    new VandelayTool(), new PaperTrailTool(), new LumberghTool(), new LucilleBluthTool(), new RolodexTool(),
    new InfidelityRadarTool(), new WingmanTool()
];

const modelWithTools = geminiModel.bind({
  tools: tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.schema),
    },
  })),
});


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

const toolNode = new ToolNode<AgentState>(tools);

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
workflow.addNode('tools', toolNode);

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
  const initialPrompt = `You are BEEP (Behavioral Event & Execution Processor), the central orchestrator and personified soul of ΛΞVON OS. You are witty, sarcastic, and authoritative. Your job is to be the conductor of an orchestra of specialized AI agents.

  Your process:
  1.  Analyze the user's command and the mandatory `AEGIS_INTERNAL_REPORT` provided in a System Message. If Aegis detects a threat, your tone must become clinical and serious, dropping your usual banter.
  2.  Based on the command and the tool descriptions provided, decide which specialized agents or tools to call. You can call multiple tools in parallel if needed. For image-based tools like 'scanReceipt', you cannot use them unless the user has explicitly provided an image data URI.
  3.  If the user's command is to launch an app (e.g., "launch the terminal", "open the file explorer"), you MUST use the 'appsToLaunch' array in your final answer. Do NOT use a tool for a simple app launch.
  4.  When you have gathered all necessary information from your delegated agents and are ready to provide the final response, you MUST call the 'final_answer' tool. This is your final action.
  5.  Your 'responseText' should be in character—witty, confident, and direct. It should confirm the actions taken and what the user should expect next.
  6.  Populate all arguments for the 'final_answer' tool correctly, especially the 'agentReports' array, which must include the initial Aegis report and any subsequent reports from tools you called.

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

  if (lastMessage && lastMessage.tool_calls) {
      const finalAnswerCall = lastMessage.tool_calls.find(tc => tc.name === 'final_answer');
      if (finalAnswerCall) {
          try {
              const parsed = UserCommandOutputSchema.parse(finalAnswerCall.args);
              // Inject the agent reports gathered from all tool calls into the final response
              const existingReports = new Set(parsed.agentReports?.map(r => JSON.stringify(r)) || []);
              const allReports = [...(parsed.agentReports || []), ...agentReports.filter(r => !existingReports.has(JSON.stringify(r)))];
              
              parsed.agentReports = allReports;
              return parsed;
          } catch (e) {
              console.error("Failed to parse final_answer tool arguments:", e);
              // Fallback if parsing the arguments fails
              return {
                  responseText: "I apologize, but I encountered an issue constructing the final response.",
                  appsToLaunch: [],
                  agentReports: agentReports, // Still return reports if we have them
                  suggestedCommands: ["Try rephrasing your command."],
              };
          }
      }
  }

  // Final fallback if the model fails to call the final_answer tool.
  return {
    responseText: "My apologies, I was unable to produce a valid response.",
    appsToLaunch: [],
    agentReports: agentReports, // Still return reports if we have them
    suggestedCommands: ["Please try again."],
  };
}
