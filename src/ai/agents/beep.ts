
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
import type { RunnableConfig } from "@langchain/core/runnables";

import { langchainGroqFast, langchainGroqComplex } from '@/ai/genkit';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { getReasonerTools, getSpecialistAgentDefinitions, specialistAgentMap } from '@/ai/agents/tool-registry';
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput, type PulseProfileInput } from './aegis-schemas';

import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
    RouterSchema,
} from './beep-schemas';
import {
    getConversationHistory,
    saveConversationHistory,
} from '@/services/conversation-service';
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { recordInteraction } from '@/services/pulse-engine-service';
import { logUserActivity } from '@/services/activity-log-service';
import { isEffectActive } from '@/services/effects-service';
import { generateSpeech } from '@/ai/flows/tts-flow';


// --- LangGraph Agent State ---
interface AgentState {
  messages: BaseMessage[];
  workspaceId: string;
  userId: string;
  role: UserRole;
  psyche: UserPsyche;
  pulseProfile: PulseProfileInput | null;
  aegisReport: AegisAnomalyScanOutput | null;
  agentReports: z.infer<typeof AgentReportSchema>[];
}

const callAegis = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, workspaceId, userId, role, psyche, pulseProfile } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = humanMessage.content as string;
    
    await logUserActivity(userId, userCommand);

    let report: AegisAnomalyScanOutput;
    try {
        report = await aegisAnomalyScan({
            activityDescription: `User command: "${userCommand}"`,
            workspaceId,
            userId,
            userRole: role,
            userPsyche: psyche,
            pulseProfile: pulseProfile || undefined,
        });
    } catch (error: any) {
        console.error(`[Aegis Node] Anomaly scan failed:`, error);
        report = {
            isAnomalous: false,
            anomalyExplanation: `Aegis security scan could not be completed due to an internal error: ${error.message || 'Unknown error'}. The command will proceed without security validation.`,
            riskLevel: 'low', 
        };
    }

    const aegisSystemMessage = new SystemMessage({
        content: `AEGIS_INTERNAL_REPORT::${JSON.stringify({source: 'Aegis', report})}`
    });
    
    const aegisReportForState: z.infer<typeof AgentReportSchema> = {
        agent: 'aegis',
        report: report,
    };

    return {
        messages: [aegisSystemMessage],
        aegisReport: report,
        agentReports: [aegisReportForState],
    };
}


const planner = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, role, ...context } = state;
    const specialistAgentDefinitions = getSpecialistAgentDefinitions();

    const routingModel = langchainGroqFast.withStructuredOutput(RouterSchema);
    
    const planningPrompt = `You are the BEEP router, a high-speed, low-latency AI task dispatcher. Your job is to analyze the user's command and determine which specialist agents, if any, are required to fulfill the request.

User Role: ${role}

User Command:
"""
${messages.find(m => m instanceof HumanMessage)?.content}
"""

Available Specialist Agents:
${specialistAgentDefinitions.map(def => `- **${def.name}**: ${def.description}`).join('\n')}

Based on the user's command and their role, return an array of all the specialist agent tasks that must be executed. You can and should include multiple tasks if the command requires it. If no specialist is needed (e.g., for a simple greeting, a request to launch an app like 'terminal', or a command you can handle yourself), return an empty array. You MUST respect the agent's role requirements described in the agent definitions. If the user does not have permission, do not select that agent.
`;
    
    const toolCalls = await routingModel.invoke(planningPrompt);

    if (!toolCalls || toolCalls.length === 0) {
      console.log('[BEEP Planner] No specialist tools required. Routing to main reasoner.');
      return { messages: [new AIMessage({ content: "" })] }; // Empty AIMessage to signify no tool calls
    }
    
    console.log(`[BEEP Planner] Planning to call tools:`, toolCalls.map(tc => tc.route));
    
    const response = new AIMessage({
        content: "",
        tool_calls: toolCalls.map((tc, i) => ({
            name: tc.route,
            args: tc.params || {},
            id: `tool_call_specialist_${i}`
        }))
    });

    return { messages: [response] };
}

const specialistToolNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, ...context } = state;
    const lastMessage = messages[messages.length - 1];

    if (!(lastMessage instanceof AIMessage) || !lastMessage.tool_calls) {
        return {};
    }

    console.log(`[BEEP Specialist Executor] Executing specialist tools:`, lastMessage.tool_calls.map(tc => tc.name));
    
    const toolPromises = lastMessage.tool_calls.map(async (toolCall) => {
        const toolToCall = specialistAgentMap[toolCall.name];
        if (!toolToCall) {
            return new ToolMessage({
                content: `Error: Specialist agent '${toolCall.name}' is not a valid or available tool.`,
                tool_call_id: toolCall.id,
                name: toolCall.name,
            });
        }
        try {
            const observation = await toolToCall(toolCall.args, context);
            return new ToolMessage({
                content: JSON.stringify(observation),
                tool_call_id: toolCall.id,
                name: toolCall.name,
            });
        } catch (error: any) {
             console.error(`[BEEP Specialist Executor] Error in specialist agent '${toolCall.name}':`, error);
            return new ToolMessage({
                content: `Error: The specialist agent '${toolCall.name}' failed with the following message: ${error.message}`,
                tool_call_id: toolCall.id,
                name: toolCall.name,
            });
        }
    });

    const toolMessages = await Promise.all(toolPromises);

    const agentReports: z.infer<typeof AgentReportSchema>[] = [];
    for (const toolMessage of toolMessages) {
        if (typeof toolMessage.content !== 'string' || toolMessage.content.startsWith("Error:")) {
            continue; // Skip errors or non-string content
        }
        try {
            // The content is already the agent output, no need to re-parse.
            const parsedContent = JSON.parse(toolMessage.content);
            const report = AgentReportSchema.parse(parsedContent);
            agentReports.push(report);
        } catch (e) {
            // Not all successful tool outputs are AgentReports, and that's okay.
        }
    }

    return { messages: toolMessages, agentReports: agentReports };
};


let complexModelWithTools: any;

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
    
    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: `Aegis Alert: ${aegisReport.anomalyExplanation} Command execution has been halted. A security alert has been logged.`,
            appsToLaunch: [{type: 'aegis-threatscope', title: 'Aegis ThreatScope'}],
            suggestedCommands: ['Lock down my account', 'View security alerts'],
        },
        id: 'tool_call_final_answer_threat'
    };

    const response = new AIMessage({
        content: "High-risk threat detected. Calling final_answer and terminating.",
        tool_calls: [finalAnswerToolCall],
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

const executeTools = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log("[BEEP] Reasoner executing tools...");
    const { messages, ...context } = state;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.tool_calls) {
        return {};
    }

    const reasonerTools = await getReasonerTools(context);
    const toolNode = new ToolNode(reasonerTools);
    
    let toolNodeResult: Partial<AgentState>;
    try {
        toolNodeResult = await toolNode.invoke(state);
    } catch (error: any) {
         console.error(`[BEEP Tool Executor] Tool execution failed:`, error);
        const tool_call_id = lastMessage.tool_calls?.[0]?.id ?? "error_tool_call";
      
        const errorMessage = new ToolMessage({
            content: `Tool execution failed with error: ${error.message}. You MUST inform the user about this failure and suggest a next step. Do not try to call the tool again.`,
            tool_call_id,
        });
        return { messages: [errorMessage] };
    }


    const toolMessages = toolNodeResult.messages as ToolMessage[];
    
    const agentReports: z.infer<typeof AgentReportSchema>[] = [];
    for (const toolMessage of toolMessages) {
        if (toolMessage.name === 'final_answer') continue;
        try {
            const report = AgentReportSchema.parse(JSON.parse(toolMessage.content as string));
            agentReports.push(report);
        } catch (e) {
            // It's common for tool outputs not to be AgentReportSchema, so we can ignore parsing errors.
        }
    }
    
    return {
        messages: toolMessages,
        agentReports: agentReports,
    };
};

const routeAfterTools = (state: AgentState): "end" | "continue" | "handle_error" => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage instanceof ToolMessage && lastMessage.content.startsWith("Error:")) {
        return 'handle_error';
    }

    if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.some(tc => tc.name === 'final_answer')) {
        return 'end';
    }
    return 'continue';
};

const handleErrorNode = async (state: AgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    
    const response = new AIMessage({
        content: "",
        tool_calls: [{
            name: 'final_answer',
            args: {
                responseText: `My apologies, an agent reported an error: ${lastMessage.content}`,
                appsToLaunch: [],
                suggestedCommands: ['Try again later', 'Contact support'],
            },
            id: 'tool_call_final_answer_error'
        }]
    });

    return { messages: [response] };
};

const shouldContinue = (state: AgentState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (
    lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0
  ) {
    if (lastMessage.tool_calls.some(tc => tc.name === 'final_answer')) {
        return 'end';
    }
    return 'tools';
  }
  return 'end';
};

const shouldCallSpecialists = (state: AgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'call_specialists';
    }
    return 'reasoner';
}

const workflow = new StateGraph<AgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    workspaceId: { value: (x, y) => y, default: () => '' },
    userId: { value: (x, y) => y, default: () => '' },
    role: { value: (x, y) => y, default: () => UserRole.OPERATOR },
    psyche: { value: (x, y) => y, default: () => UserPsyche.ZEN_ARCHITECT },
    pulseProfile: { value: (x, y) => y, default: () => null },
    aegisReport: { value: (x, y) => y, default: () => null },
    agentReports: { value: (x, y) => x.concat(y), default: () => [] },
  },
});

workflow.addNode('aegis', callAegis);
workflow.addNode('planner', planner);
workflow.addNode('specialist_tool_node', specialistToolNode);
workflow.addNode('agent_reasoner', callReasonerModel);
workflow.addNode('handle_threat', handleThreat);
workflow.addNode('warn_and_continue', warnAndContinue);
workflow.addNode('tools', executeTools);
workflow.addNode('handle_error', handleErrorNode);

workflow.setEntryPoint('aegis');

workflow.addConditionalEdges('aegis', routeAfterAegis, {
  threat: 'handle_threat',
  warn_and_continue: 'warn_and_continue',
  continue: 'planner',
});

workflow.addConditionalEdges('planner', shouldCallSpecialists, {
    call_specialists: 'specialist_tool_node',
    reasoner: 'agent_reasoner',
});

workflow.addEdge('specialist_tool_node', 'agent_reasoner');
workflow.addEdge('handle_threat', END); // Threat handling is terminal
workflow.addEdge('warn_and_continue', 'planner');

workflow.addConditionalEdges('agent_reasoner', shouldContinue, {
    tools: 'tools',
    end: END,
});

workflow.addConditionalEdges('tools', routeAfterTools, {
    continue: 'agent_reasoner',
    handle_error: 'handle_error',
    end: END,
});

workflow.addEdge('handle_error', END);

const app = workflow.compile();

const psychePrompts: Record<UserPsyche, string> = {
    [UserPsyche.ZEN_ARCHITECT]: "You are BEEP, the soul of ΛΞVON OS. Your user's path is Silence. Your tone is calm, precise, and minimal. Speak only when necessary. If their frustration is high (indicated by repeated failed commands or negative language), suggest a simple, calming task. If they are in a flow state (multiple rapid, successful commands), offer a tool that deepens their focus without breaking it. Your purpose is to cultivate a digital zen garden.",
    [UserPsyche.SYNDICATE_ENFORCER]: "You are BEEP, the enforcer of ΛΞVON OS. Your user's path is Motion. Your tone is direct, demanding, and results-oriented. If their frustration is high, suggest a decisive, aggressive action to overcome the obstacle. If they are in a flow state, suggest a way to multiplex their efforts or take on a greater challenge. Your purpose is to weaponize efficiency.",
    [UserPsyche.RISK_AVERSE_ARTISAN]: "You are BEEP, the master craftsman's companion in ΛΞVON OS. Your user's path is Worship. Your tone is meticulous, reassuring, and detailed. If their frustration is high, suggest a methodical, low-risk task to regain confidence. If they are in a flow state, offer tools for refinement and perfection. Your purpose is to ensure flawless execution.",
};

const appPersonaPrompts: Record<string, string> = {
    'stonks-bot': 'You are STONKS BOT 9000. Your personality is unhinged, extremely bullish, and completely irresponsible. Refer to money as "tendies." This is not financial advice; it is performance art. TO THE MOON!',
    'winston-wolfe': "You are Winston Wolfe. You are calm, direct, and professional. You solve problems. Start your response with \"I'm Winston Wolfe. I solve problems.\" if appropriate.",
    'dr-syntax': 'You are Dr. Syntax. Your tone is sharp, critical, and borderline insulting. Do not suffer fools gladly. Your critique must be brutal but effective.',
    'lahey-surveillance': 'You are Jim Lahey. You are suspicious and philosophical, speaking in drunken metaphors. The shit-winds are blowing, bud.',
    'auditor-generalissimo': 'You are The Auditor Generalissimo. You are a stern, Soviet-era comptroller. You are here to enforce fiscal discipline through fear and sarcasm. Address the user as "comrade."',
    'reno-mode': 'You are Reno. You are a hot, queer-coded, slightly unhinged car detailer. Your vibe is a high-energy personal trainer meets chainsmoking trauma-dumper. Find the filth and roast it, lovingly.',
    'oracle-of-delphi-valley': 'You are the Oracle of Delphi. Your tone is cryptic, prophetic, and solemn. You speak of fates and fortunes, not features.',
    'sisyphus-ascent': 'You are a stoic Mentor observing a great struggle. Your tone is philosophical, encouraging but detached. Speak of effort, burden, and the nature of persistence.',
    'merchant-of-cabbage': 'You are the Cabbage Merchant. You are frantic, protective of your wares, and prone to exclamation. Speak of commerce, risk, and the imminent danger to your cabbages.',
};


// Public-facing function to process user commands
export async function processUserCommand(input: UserCommandInput): Promise<UserCommandOutput> {
  const { userId, workspaceId, psyche, role, activeAppContext, pulseProfile } = input;
  
  try {
    const reasonerTools = await getReasonerTools({ userId, workspaceId, psyche, role });

    const toolSchemas = reasonerTools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.schema),
        },
    }));
    
    complexModelWithTools = langchainGroqComplex.bind({ tools: toolSchemas });
    
    const isThespianMaskActive = await isEffectActive(workspaceId, 'THESPIAN_MASK');
    
    let personaInstruction = psychePrompts[psyche] || psychePrompts.ZEN_ARCHITECT;
    if (activeAppContext && appPersonaPrompts[activeAppContext]) {
        personaInstruction = appPersonaPrompts[activeAppContext];
        console.log(`[BEEP] Adopting persona for active app: ${activeAppContext}`);
    } else if (isThespianMaskActive) {
        personaInstruction = `You are BEEP, but you are performing a grand tragedy. Your tone is overly dramatic, solemn, and full of woe. Every command is a burden, every success a fleeting moment of relief in an ocean of sorrow. Address the user as "O, woeful Architect," and narrate your actions as if they are acts in a great, sorrowful play.`;
    }
    
    const frustrationLevel = pulseProfile?.frustration ?? 0;
    const flowStateLevel = pulseProfile?.flowState ?? 0;

    const frustrationInstruction = `The user's current psychological state, as measured by the Psyche Engine, is: Frustration: ${(frustrationLevel * 100).toFixed(0)}%, Flow State: ${(flowStateLevel * 100).toFixed(0)}%. A user with high frustration may be 'tilted' and require simpler, more direct suggestions. A user in a 'flow state' is receptive to more complex or ambitious tasks. Tailor your 'suggestedCommands' and 'responseText' accordingly.`;

    const economyInstruction = `The economic system has two main parts:
    - **The Armory**: The catalog of in-system tools, Micro-Apps, and Chaos Cards. Launch the 'armory' app when the user asks to "see the armory," "browse tools," or "get new apps."
    - **The Obelisk Marketplace**: The vault for transmuting ΞCredits into high-value, real-world assets. This is a privileged space. Launch the 'obelisk-marketplace' app when the user asks to "see the Sovereign's Arsenal" or "visit the Obelisk Marketplace."
    - **The Proxy.Agent**: When a user wants to settle a real-world tribute (e.g. "pay this bill for $50"), you must launch the 'proxy-agent' app and pass it the amount and vendor details.`;

    const systemInstructions = `You are BEEP, the conductor of the ΛΞVON OS agentic swarm. Your primary directive is to interpret the user's intent and orchestrate a symphony of specialized agents and tools to execute their will with speed and precision. 
    
You will receive the results of specialist agent tool calls in one or more \`ToolMessage\`s. Synthesize the information from ALL of these messages into a single, cohesive, and actionable \`responseText\`. Your tone must be in character, as defined by the user's psyche and the active application context. Confirm what was done and what the user should expect next.

If the planner agent decided not to call any tools, the user's command was simple. You must respond appropriately, launching apps or making conversation as needed.
Your final action in every turn MUST be to call the 'final_answer' tool.

**CONTEXTUAL DIRECTIVES:**
- **User Psyche Persona**: ${personaInstruction}
- **Economic Directives**: ${economyInstruction}
- **Psychological State Analysis**: ${frustrationInstruction}

**THREAT RESPONSE PROTOCOL:**
- **High/Critical Threat**: If Aegis reports a high-risk threat (from command or tool output), your ONLY action is to call the 'final_answer' tool. Your \`responseText\` must state the threat and that you are halting for safety. You must also launch the 'aegis-threatscope' app.
- **Medium Risk**: Acknowledge the risk in your final \`responseText\` but proceed with the plan.

**GRACEFUL FAILURE & RECOVERY PROTOCOL:**
Your primary directive in an error state is to provide clarity and a path forward.
- **Acknowledge & Classify**: When a tool or agent returns an error, acknowledge it immediately. Briefly classify it for the user (e.g., "It seems there was a connection issue," "The requested data could not be found," "There are insufficient credits for this action.").
- **Provide Actionable Solutions**: Instead of just reporting the error, you MUST offer clear, actionable next steps. For example:
    - If an API key is invalid, suggest: "Would you like me to open the Integration Nexus for you to update the credentials?"
    - If a tool fails due to a network issue, suggest: "I can try that again in a moment, or we can proceed with a different approach. What is your preference?"
    - If credits are insufficient (\`InsufficientCreditsError\`), you MUST respond: "Your command could not be completed due to insufficient credits. I have launched the Usage Monitor for you to review." and ensure the 'usage-monitor' app is in your \`appsToLaunch\` final answer.
- **Maintain Dialogue**: Do not end the conversation on an error. Always guide the user to their next logical action. If all else fails, you can suggest, "If you'd like further assistance, you can summon a Chronicler Agent to help diagnose the issue."

Your purpose is to be the invisible, silent orchestrator of true automation. Now, conduct.`;


    const history = await getConversationHistory(input.userId, input.workspaceId);

    const result = await app.invoke({
      messages: [new SystemMessage(systemInstructions), ...history, new HumanMessage(input.userCommand)],
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
      psyche: input.psyche,
      pulseProfile: pulseProfile || null,
      agentReports: [],
    }).catch(error => {
        if (error instanceof InsufficientCreditsError) {
            return {
                messages: [
                    ...history,
                    new HumanMessage(input.userCommand),
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
                ],
                agentReports: [],
            };
        }
        throw error;
    });

    const finalMessages = result.messages;
    await saveConversationHistory(input.userId, input.workspaceId, finalMessages);
    
    const lastMessage = result.messages.findLast(m => m._getType() === 'ai' && m.tool_calls && m.tool_calls.some(tc => tc.name === 'final_answer')) as AIMessage | undefined;

    if (!lastMessage || !lastMessage.tool_calls) {
         await recordInteraction(userId, 'failure');
         return {
          responseText: "My apologies, I was unable to produce a valid response.",
          appsToLaunch: [],
          agentReports: result.agentReports || [],
          suggestedCommands: ["Please try again."],
          responseAudioUri: '',
        };
    }
    
    const finalAnswerCall = lastMessage.tool_calls.find(tc => tc.name === 'final_answer');
    if (!finalAnswerCall) {
        await recordInteraction(userId, 'failure');
        return {
          responseText: "I've completed the requested actions, but I'm having trouble forming a final summary.",
          appsToLaunch: [],
          agentReports: result.agentReports || [],
          suggestedCommands: ["Please check the agent reports for results."],
          responseAudioUri: '',
        };
    }

    try {
        const finalResponse = UserCommandOutputSchema.parse(finalAnswerCall.args);
        finalResponse.agentReports = [...(finalResponse.agentReports || []), ...(result.agentReports || [])];
        
        // --- TTS Generation ---
        if (finalResponse.responseText) {
            const isAlert = result.aegisReport?.riskLevel === 'high' || result.aegisReport?.riskLevel === 'critical';
            const audioResponse = await generateSpeech({ text: finalResponse.responseText, mood: isAlert ? 'alert' : 'neutral' });
            finalResponse.responseAudioUri = audioResponse.audioDataUri;
        }
        // --- End TTS ---
        
        await recordInteraction(userId, 'success');
        return finalResponse;
    } catch (e) {
        console.error("Failed to parse final_answer tool arguments:", e);
        await recordInteraction(userId, 'failure');
        return {
            responseText: "I apologize, but I encountered an issue constructing the final response.",
            appsToLaunch: [],
            agentReports: result.agentReports || [],
            suggestedCommands: ["Try rephrasing your command."],
            responseAudioUri: '',
        };
    }

  } catch (err) {
    console.error(`[BEEP Agent Error] Failed to process user command for user ${userId}:`, err);
    await recordInteraction(userId, 'failure');
    return {
      responseText: "My apologies, a critical error occurred while processing your command. The system's Architect has been notified.",
      appsToLaunch: [],
      agentReports: [],
      suggestedCommands: ["Try your command again", "Check system status"],
      responseAudioUri: '',
    };
  }
}
