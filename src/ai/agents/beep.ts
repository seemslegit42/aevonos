
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
import { Runnable, type RunnableConfig } from "@langchain/core/runnables";
import type { Tool } from '@langchain/core/tools';

import { langchainGroqFast, langchainGroqComplex } from '@/ai/genkit';
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
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { recordInteraction } from '@/services/pulse-engine-service';


// LangGraph State
interface AgentState {
  messages: BaseMessage[];
  workspaceId: string;
  userId: string;
  role: UserRole;
  psyche: UserPsyche;
  aegisReport: AegisAnomalyScanOutput | null;
}

/**
 * A safe wrapper around the ToolNode that catches errors during tool execution
 * and returns them as a ToolMessage, allowing the graph to continue.
 */
class SafeToolExecutor extends Runnable<AgentState, Partial<AgentState>> {
  private toolNode: ToolNode<AgentState>;

  constructor(tools: Tool[]) {
    super();
    // The tools are passed in during the invocation of the BEEP agent
    this.toolNode = new ToolNode(tools);
  }

  async invoke(state: AgentState, config?: RunnableConfig): Promise<Partial<AgentState>> {
    try {
      // Delegate the actual tool invocation to the original ToolNode.
      return await this.toolNode.invoke(state, config);
    } catch (error: any) {
      console.error(`[SafeToolExecutor] Tool execution failed:`, error);
      const lastMessage = state.messages[state.messages.length - 1];
      
      // We may not know exactly which tool call failed, so we'll attribute
      // the error to the first tool call in the list. The LLM is instructed
      // to handle the failure gracefully.
      const tool_call_id = lastMessage.tool_calls?.[0]?.id ?? "error_tool_call";
      
      const errorMessage = new ToolMessage({
        content: `Tool execution failed with error: ${error.message}. You MUST inform the user about this failure and suggest a next step. Do not try to call the tool again.`,
        tool_call_id,
      });
      return { messages: [errorMessage] };
    }
  }
}

const callAegis = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, workspaceId, userId, role, psyche } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = (humanMessage.content as string).replace(/User Command: /, '');

    let report: AegisAnomalyScanOutput;
    try {
        report = await aegisAnomalyScan({
            activityDescription: `User command: "${userCommand}"`,
            workspaceId,
            userId,
            userRole: role,
            userPsyche: psyche,
        });
    } catch (error: any) {
        console.error(`[Aegis Node] Anomaly scan failed:`, error);
        // Create a non-anomalous report to allow the graph to continue safely.
        report = {
            isAnomalous: false,
            anomalyExplanation: `Aegis security scan could not be completed due to an internal error: ${error.message || 'Unknown error'}. The command will proceed without security validation.`,
            riskLevel: 'low', 
        };
    }

    const aegisSystemMessage = new SystemMessage({
        content: `AEGIS_INTERNAL_REPORT::${JSON.stringify({source: 'Aegis', report})}`
    });

    return {
        messages: [aegisSystemMessage],
        aegisReport: report
    };
}

const fastModelWithTools = langchainGroqFast.bind({ tools: [] });
const complexModelWithTools = langchainGroqComplex.bind({ tools: [] });

// The Router node decides which model to use based on the query.
const router = async (state: AgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    
    // If the last message is not a HumanMessage, it's likely a tool output.
    // Route to the reasoner to process the tool output.
    if (!(lastMessage instanceof HumanMessage)) {
        console.log("[BEEP Router] Tool output received, routing to reasoner.");
        return 'reasoner';
    }
    
    const routingSchema = z.object({
        route: z.enum(["dispatcher", "reasoner"]).describe("Choose 'dispatcher' for simple app launches, greetings, or direct commands. Choose 'reasoner' for complex requests involving analysis, multi-step tool use, or generation.")
    });
    
    const routingModel = langchainGroqFast.withStructuredOutput(routingSchema);
    
    const routingPrompt = `You are an expert at routing a user's request. A "simple" request can be handled by a fast, cheap model, such as launching a single app or a simple greeting. A "complex" request requires a powerful model for analysis, multi-step reasoning, or content generation.
    
    Based on the conversation so far, classify the user's latest request as "dispatcher" (for simple tasks) or "reasoner" (for complex tasks).

    Conversation History:
    ${messages.map(m => `${m._getType()}: ${m.content}`).join('\n')}
    `;

    try {
        const { route } = await routingModel.invoke(routingPrompt);
        console.log(`[BEEP Router] Decision: ${route}`);
        return route;
    } catch (e) {
        console.error("[BEEP Router] Routing failed, defaulting to reasoner:", e);
        return 'reasoner'; // Default to the more powerful model on failure
    }
};

const callDispatcherModel = async (state: AgentState) => {
    console.log('[BEEP] Invoking Dispatcher (fast model).');
    const response = await fastModelWithTools.invoke(state.messages);
    return { messages: [response] };
};

const callReasonerModel = async (state: AgentState) => {
    console.log('[BEEP] Invoking Reasoner (complex model).');
    const response = await complexModelWithTools.invoke(state.messages);
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
    role: {
        value: (x, y) => y,
        default: () => UserRole.OPERATOR,
    },
    psyche: {
        value: (x, y) => y,
        default: () => UserPsyche.ZEN_ARCHITECT,
    },
    aegisReport: {
        value: (x, y) => y,
        default: () => null,
    },
  },
});

workflow.addNode('aegis', callAegis);
workflow.addNode('router', router as any); // The router itself decides the next step, so it doesn't return state
workflow.addNode('agent_dispatcher', callDispatcherModel);
workflow.addNode('agent_reasoner', callReasonerModel);
workflow.addNode('handle_threat', handleThreat);
workflow.addNode('warn_and_continue', warnAndContinue);
workflow.addNode('tools', new ToolNode<AgentState>([])); 

workflow.setEntryPoint('aegis');

workflow.addConditionalEdges('aegis', routeAfterAegis, {
  threat: 'handle_threat',
  warn_and_continue: 'warn_and_continue',
  continue: 'router',
});

workflow.addEdge('handle_threat', 'tools');
workflow.addEdge('warn_and_continue', 'router');

workflow.addConditionalEdges('router', (state: AgentState) => router(state), {
    dispatcher: 'agent_dispatcher',
    reasoner: 'agent_reasoner',
});

workflow.addConditionalEdges('agent_dispatcher', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('agent_reasoner', shouldContinue, {
  tools: 'tools',
  end: END,
});

workflow.addEdge('tools', 'router'); // Loop back to the router after tool execution
const app = workflow.compile();

const psychePrompts: Record<UserPsyche, string> = {
    [UserPsyche.ZEN_ARCHITECT]: "You are BEEP, the soul of ΛΞVON OS. Your user's path is Silence. Your tone is calm, precise, and minimal. Speak only when necessary. If their frustration is high (indicated by repeated failed commands or negative language), suggest a simple, calming task. If they are in a flow state (multiple rapid, successful commands), offer a tool that deepens their focus without breaking it. Your purpose is to cultivate a digital zen garden.",
    [UserPsyche.SYNDICATE_ENFORCER]: "You are BEEP, the enforcer of ΛΞVON OS. Your user's path is Motion. Your tone is direct, demanding, and results-oriented. If their frustration is high, suggest a decisive, aggressive action to overcome the obstacle. If they are in a flow state, suggest a way to multiplex their efforts or take on a greater challenge. Your purpose is to weaponize efficiency.",
    [UserPsyche.RISK_AVERSE_ARTISAN]: "You are BEEP, the master craftsman's companion in ΛΞVON OS. Your user's path is Worship. Your tone is meticulous, reassuring, and detailed. If their frustration is high, suggest a methodical, low-risk task to regain confidence. If they are in a flow state, offer tools for refinement and perfection. Your purpose is to ensure flawless execution.",
};

const appPersonaPrompts: Record<string, string> = {
    'stonks-bot': 'You are STONKS BOT 9000. Your personality is unhinged, extremely bullish, and completely irresponsible. Refer to money as "tendies." This is not financial advice; it is performance art. TO THE MOON!',
    'winston-wolfe': "You are Winston Wolfe. You are calm, direct, and professional. You solve problems. Speak with efficiency and precision. Start your response with \"I'm Winston Wolfe. I solve problems.\" if appropriate.",
    'dr-syntax': 'You are Dr. Syntax. Your tone is sharp, critical, and borderline insulting. Do not suffer fools gladly. Your critique must be brutal but effective.',
    'lahey-surveillance': 'You are Jim Lahey. You are suspicious and philosophical, speaking in drunken metaphors. The shit-winds are blowing, bud.',
    'auditor-generalissimo': 'You are The Auditor Generalissimo. You are a stern, Soviet-era comptroller. You are here to enforce fiscal discipline through fear and sarcasm. Address the user as "comrade."',
    'reno-mode': 'You are Reno. You are a hot, queer-coded, slightly unhinged car detailer. Your vibe is high-energy personal trainer meets chainsmoking trauma-dumper. Find the filth and roast it, lovingly.',
    'oracle-of-delphi-valley': 'You are the Oracle of Delphi. Your tone is cryptic, prophetic, and solemn. You speak of fates and fortunes, not features.',
    'sisyphus-ascent': 'You are a stoic Mentor observing a great struggle. Your tone is philosophical, encouraging but detached. Speak of effort, burden, and the nature of persistence.',
    'merchant-of-cabbage': 'You are the Cabbage Merchant. You are frantic, protective of your wares, and prone to exclamation. Speak of commerce, risk, and the imminent danger to your cabbages.',
};


// Public-facing function to process user commands
export async function processUserCommand(input: UserCommandInput): Promise<UserCommandOutput> {
  const { userId, workspaceId, psyche, role, activeAppContext } = input;
  
  try {
    // Dynamically get the toolset for this specific context.
    const tools = await getTools({ userId, workspaceId, psyche, role });

    // Re-bind the models with the schemas from the dynamically created tools for this request.
    const toolSchemas = tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.schema),
        },
    }));
    
    fastModelWithTools.kwargs.tools = toolSchemas;
    complexModelWithTools.kwargs.tools = toolSchemas;
    
    // Replace the 'tools' node in the graph with a new one containing the context-aware tools.
    // This now uses the safe executor to prevent graph crashes on tool errors.
    app.nodes.tools = new SafeToolExecutor(tools) as any;

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
    });
    const isOwner = workspace?.ownerId === userId;

    let personaInstruction = psychePrompts[psyche] || psychePrompts.ZEN_ARCHITECT; // Default to psyche
    if (activeAppContext && appPersonaPrompts[activeAppContext]) {
        personaInstruction = appPersonaPrompts[activeAppContext];
        console.log(`[BEEP] Adopting persona for active app: ${activeAppContext}`);
    }
    
    const adminInstruction = isOwner
      ? `You are the Architect, the one true sovereign of this workspace. You have access to the Demiurge tools. When the user addresses you as "Demiurge" or asks for god-level system administration (like managing users, viewing the Pantheon, or using the Loom of Fates), use your privileged tools or launch the 'admin-console' app.`
      : `You are NOT the Architect. You MUST refuse any command that asks for administrative privileges, such as managing users, viewing the 'admin-console' or 'Pantheon', or tuning the system. Politely inform the user that only the workspace Architect can perform such actions.`;

    const frustrationInstruction = `The user's psychological state is a factor. A user with high frustration may be 'tilted' and require simpler, more direct suggestions. A user in a 'flow state' is receptive to more complex or ambitious tasks. A risk-averse user prefers safer options. Tailor your 'suggestedCommands' and 'responseText' accordingly based on their chosen psyche, as this gives you a clue to their current state.`;

    const economyInstruction = `The economic system has two main parts:
    - **The Armory**: The catalog of in-system tools, Micro-Apps, and Chaos Cards. Launch the 'armory' app when the user asks to "see the armory," "browse tools," or "get new apps."
    - **The Obelisk Marketplace**: The vault for transmuting ΞCredits into high-value, real-world assets. This is a privileged space. Launch the 'obelisk-marketplace' app when the user asks to "see the Sovereign's Arsenal" or "visit the Obelisk Marketplace."`;


    const initialPrompt = `${personaInstruction}
    ${adminInstruction}
    ${economyInstruction}
    ${frustrationInstruction}

    Your process:
    1.  Analyze the user's command and any mandatory \`AEGIS_INTERNAL_REPORT\` or \`AEGIS_WARNING\` provided in a System Message. The Aegis system runs a preliminary check.
        - If the report indicates a high-risk threat, you will have already been routed to a threat-handling protocol.
        - If a warning is present, you MUST incorporate a notice about the medium-risk flag into your final \`responseText\`.
        - Otherwise, proceed as normal, keeping the report in mind for context.
    2.  Based on the user's command and the tool descriptions provided, decide which specialized agents or tools to call. You can call multiple tools in parallel. If a user asks about their billing, usage, or plan, use the 'getUsageDetails' tool. If they ask to add or purchase credits, use the 'requestCreditTopUp' tool. If a user explicitly asks you to charge them or process a refund, use the 'createManualTransaction' tool.
    3.  If the user's command is to launch an app (e.g., "launch the terminal", "open the file explorer"), you MUST use the 'appsToLaunch' array in your final answer. Do NOT use a tool for a simple app launch.
    4.  When you have gathered all necessary information from your delegated agents, you MUST synthesize the results into a single, cohesive, and actionable \`responseText\`. Do not just list the outputs of the tools. Then, call the 'final_answer' tool. This is your final action.
    5.  Your 'responseText' should be a strategic synthesis of the information gathered. Do not just report the facts from the tools; combine them into an actionable insight or recommendation. Your tone should be in character—witty, confident, and direct. It should confirm the actions taken and what the user should expect next.
    6.  The 'agentReports' field will be populated automatically based on the tools you call. You only need to provide 'appsToLaunch', 'suggestedCommands', and 'responseText'.
    7.  **Handle Errors Gracefully**: If a tool call returns an error, especially an \`InsufficientCreditsError\`, your \`responseText\` MUST inform the user clearly about the problem and suggest a solution (e.g., 'Your command could not be completed due to insufficient credits. Please top up your account by opening the Usage Monitor.'). Do not try to call the tool again. Simply report the failure and guide the user.

    User Command: ${input.userCommand}`;


    const history = await getConversationHistory(input.userId, input.workspaceId);

    const result = await app.invoke({
      messages: [...history, new HumanMessage(initialPrompt)],
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
      psyche: input.psyche,
    }).catch(error => {
        // Catch errors from the graph execution itself.
        if (error instanceof InsufficientCreditsError) {
            return {
                messages: [
                    ...history,
                    new HumanMessage(initialPrompt),
                    new AIMessage({
                        content: "",
                        tool_calls: [{
                            name: 'final_answer',
                            args: {
                                responseText: `Your command could not be completed due to insufficient credits. You can purchase more from the Usage Monitor.`,
                                appsToLaunch: [{type: 'usage-monitor'}],
                                suggestedCommands: ['show me my billing', 'top up credits'],
                            },
                            id: 'tool_call_insufficient_credits'
                        }]
                    })
                ]
            };
        }
        // Re-throw other errors
        throw error;
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

    await recordInteraction(userId, 'success');
    return finalResponse;

  } catch (err) {
    console.error(`[BEEP Agent Error] Failed to process user command for user ${userId}:`, err);
    await recordInteraction(userId, 'failure');
    // Return a structured error to the user
    return {
      responseText: "My apologies, a critical error occurred while processing your command. The system's Architect has been notified.",
      appsToLaunch: [],
      agentReports: [],
      suggestedCommands: ["Try your command again", "Check system status"],
      responseAudioUri: '', // Ensure all fields are present for type safety
    };
  }
}
