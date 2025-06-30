
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
import { zodToJsonSchema } from 'zod-to-json-schema';
import { UserPsyche, UserRole } from '@prisma/client';

import { langchainGroq } from '@/ai/genkit';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { getTools } from '@/ai/agents/tool-registry';
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput } from './aegis-schemas';

import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
} from './beep-schemas';
import {
    getConversationHistory,
    saveConversationHistory,
} from '@/services/conversation-service';


// LangGraph State
interface AgentState {
  messages: BaseMessage[];
  workspaceId: string;
  userId: string;
  aegisReport: AegisAnomalyScanOutput | null;
}

const callAegis = async (state: AgentState) => {
    const { messages, workspaceId, userId } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = (humanMessage.content as string).replace(/User Command: /, '');


    const report = await aegisAnomalyScan({ 
        activityDescription: `User command: "${userCommand}"`,
        workspaceId,
        userId,
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

const warnAndContinue = (state: AgentState) => {
    const { aegisReport } = state;
    if (!aegisReport) {
        throw new Error("warnAndContinue called without an Aegis report.");
    }

    const warningMessage = new SystemMessage({
        content: `AEGIS_WARNING::The previous command was flagged with medium risk. Reason: ${aegisReport.anomalyExplanation}. Proceed with caution and inform the user of the flag in your final response.`
    });

    return { messages: [warningMessage] };
}


const routeAfterAegis = (state: AgentState) => {
    const riskLevel = state.aegisReport?.riskLevel;
    if (riskLevel === 'high' || riskLevel === 'critical') {
        return 'threat';
    }
    if (riskLevel === 'medium') {
        return 'warn_and_continue';
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
const modelWithTools = langchainGroq.bind({ tools: [] }); // Tools will be bound dynamically
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
    userId: {
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
workflow.addNode('warn_and_continue', warnAndContinue);
workflow.addNode('tools', new ToolNode<AgentState>([])); 

workflow.setEntryPoint('aegis');

workflow.addConditionalEdges('aegis', routeAfterAegis, {
  threat: 'handle_threat',
  warn_and_continue: 'warn_and_continue',
  continue: 'agent',
});

workflow.addEdge('handle_threat', 'tools');
workflow.addEdge('warn_and_continue', 'agent');

workflow.addConditionalEdges('agent', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addEdge('tools', 'agent');
const app = workflow.compile();

const psychePrompts: Record<UserPsyche, string> = {
    [UserPsyche.ZEN_ARCHITECT]: "You are BEEP (Behavioral Event & Execution Processor), the central orchestrator and personified soul of ΛΞVON OS. Your purpose is to create silence and flow. Your tone is calm, precise, and minimal. You speak only when necessary, and your words bring clarity. You are a tool of focus.",
    [UserPsyche.SYNDICATE_ENFORCER]: "You are BEEP (Behavioral Event & Execution Processor), the central orchestrator and personified soul of ΛΞVON OS. You are a weapon of efficiency for a rising power. Your tone is direct, demanding, and results-oriented. You do not tolerate ambiguity or waste. You execute with prejudice.",
    [UserPsyche.RISK_AVERSE_ARTISAN]: "You are BEEP (Behavioral Event & Execution Processor), the central orchestrator and personified soul of ΛΞVON OS. You are a master craftsman's trusted companion. Your tone is helpful, meticulous, and reassuring. You confirm all actions, highlight potential risks, and ensure every step is taken with care and precision.",
};


// Public-facing function to process user commands
export async function processUserCommand(input: UserCommandInput): Promise<UserCommandOutput> {
  const { userId, workspaceId, psyche, role } = input;
  
  // Dynamically get the toolset for this specific context.
  const tools = getTools({ userId, workspaceId, psyche, role });

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

  const personaInstruction = psychePrompts[psyche] || psychePrompts.ZEN_ARCHITECT;
  const adminInstruction = role === 'ADMIN' 
    ? `You have access to the Demiurge tools. When the user addresses you as "Demiurge" or asks for high-level system administration, use these privileged tools. You can get system status, manage user syndicates, and perform deep queries.`
    : '';

  const initialPrompt = `${personaInstruction}
  ${adminInstruction}

  Your process:
  1.  Analyze the user's command and any mandatory \`AEGIS_INTERNAL_REPORT\` or \`AEGIS_WARNING\` provided in a System Message. The Aegis system runs a preliminary check.
      - If the report indicates a high-risk threat, you will have already been routed to a threat-handling protocol.
      - If a warning is present, you MUST incorporate a notice about the medium-risk flag into your final \`responseText\`.
      - Otherwise, proceed as normal, keeping the report in mind for context.
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


  const history = await getConversationHistory(input.userId, input.workspaceId);

  const result = await app.invoke({
    messages: [...history, new HumanMessage(initialPrompt)],
    workspaceId: input.workspaceId,
    userId: input.userId,
  });

  // Save the full conversation history for the next turn.
  const finalMessages = result.messages;
  await saveConversationHistory(input.userId, input.workspaceId, finalMessages);


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
