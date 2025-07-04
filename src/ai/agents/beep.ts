
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
import { getTools } from '@/ai/agents/tool-registry';
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput } from './aegis-schemas';
import { consultInventoryDaemon } from '@/ai/agents/inventory-daemon';
import { executeBurnBridgeProtocol } from '@/ai/agents/burn-bridge-agent';
import { consultVaultDaemon } from './vault-daemon';
import { consultCrmAgent } from './crm-agent';
import { consultDrSyntax } from './dr-syntax-agent';
import { consultStonksBot } from './stonks-bot-agent';


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
import { logUserActivity } from '@/services/activity-log-service';


// LangGraph State
interface AgentState {
  messages: BaseMessage[];
  workspaceId: string;
  userId: string;
  role: UserRole;
  psyche: UserPsyche;
  aegisReport: AegisAnomalyScanOutput | null;
  agentReports: z.infer<typeof AgentReportSchema>[];
}

const callAegis = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, workspaceId, userId, role, psyche } = state;
    const humanMessage = messages.find(m => m instanceof HumanMessage);
    if (!humanMessage) {
        throw new Error("Could not find user command for Aegis scan.");
    }
    const userCommand = humanMessage.content as string;
    
    // Log the activity before scanning it
    await logUserActivity(userId, userCommand);

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

const callAegisOnToolOutput = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, workspaceId, userId, role, psyche } = state;
    const toolMessage = messages.findLast(m => m instanceof ToolMessage);

    // If there's no tool message, or it's the final answer, do nothing.
    if (!toolMessage || toolMessage.name === 'final_answer') {
        return {};
    }

    const toolOutputContent = typeof toolMessage.content === 'string' 
        ? toolMessage.content 
        : JSON.stringify(toolMessage.content);
        
    // Avoid scanning huge outputs to prevent high cost and latency
    const truncatedOutput = toolOutputContent.length > 2000 ? toolOutputContent.substring(0, 2000) + '...' : toolOutputContent;

    let report: AegisAnomalyScanOutput;
    try {
        report = await aegisAnomalyScan({
            activityDescription: `An agent tool named '${toolMessage.name}' returned the following output: "${truncatedOutput}"`,
            workspaceId,
            userId,
            userRole: role,
            userPsyche: psyche,
        });
    } catch (error: any) {
        console.error(`[Aegis Tool Output Scan] Anomaly scan failed:`, error);
        report = {
            isAnomalous: false,
            anomalyExplanation: `Aegis scan on tool output could not be completed due to an internal error.`,
            riskLevel: 'low', 
        };
    }
    
    const aegisSystemMessage = new SystemMessage({
        content: `AEGIS_INTERNAL_REPORT::(Tool Output Scan)::${JSON.stringify({source: 'Aegis', report})}`
    });
    
    const aegisReportForState: z.infer<typeof AgentReportSchema> = {
        agent: 'aegis',
        report: report,
    };

    return { 
        messages: [aegisSystemMessage],
        agentReports: [aegisReportForState],
    };
};


const fastModelWithTools = langchainGroqFast.bind({ tools: [] });
const complexModelWithTools = langchainGroqComplex.bind({ tools: [] });

// The Router node decides which model to use or which specialist to delegate to.
const router = async (state: AgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    
    if (!(lastMessage instanceof HumanMessage) && !(lastMessage instanceof SystemMessage && lastMessage.content.includes('AEGIS_INTERNAL_REPORT'))) {
        console.log("[BEEP Router] Tool output received, routing to reasoner to process.");
        return 'reasoner';
    }
    
    const routingSchema = z.object({
        route: z.enum(["dispatcher", "reasoner", "inventory_daemon", "burn_bridge_protocol", "vault_daemon", "crm_agent", "dr_syntax", "stonks_bot"])
            .describe(`Choose 'dispatcher' for simple app launches, greetings, or direct commands.
Choose 'reasoner' for complex requests involving analysis or multi-step tool use.
Choose 'inventory_daemon' for any request about stock levels, product inventory, or purchase orders.
Choose 'burn_bridge_protocol' for explicit requests to "burn the bridge" or conduct a full-spectrum investigation on a person.
Choose 'vault_daemon' for any request about finances, revenue, profit, spending, or where money is being wasted.
Choose 'crm_agent' for any request about contacts (creating, listing, updating, deleting).
Choose 'dr_syntax' for any request involving critique, review, or feedback on text, code, or prompts.
Choose 'stonks_bot' for any request about stock prices or financial "advice".`)
    });
    
    const routingModel = langchainGroqFast.withStructuredOutput(routingSchema);
    
    const routingPrompt = `You are an expert at routing a user's request to the correct specialist agent or model.

    Based on the conversation so far, classify the user's latest request.

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

const callInventoryDaemon = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log('[BEEP] Delegating to Inventory Daemon.');
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    
    const daemonResponse = await consultInventoryDaemon({ query: lastMessage.content as string });

    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: daemonResponse.response,
            appsToLaunch: [],
            suggestedCommands: ["check another product", "place a purchase order"],
            agentReports: [{ agent: 'inventory-daemon', report: daemonResponse }]
        },
        id: 'tool_call_inventory_daemon_final'
    };

    const response = new AIMessage({
        content: "The Inventory Daemon has responded.",
        tool_calls: [finalAnswerToolCall],
    });

    return { messages: [response] };
};

const callBurnBridgeProtocol = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log('[BEEP] Delegating to Burn Bridge Protocol.');
    const { messages, workspaceId, userId } = state;
    const lastMessage = messages[messages.length - 1];

    const extractionModel = langchainGroqComplex.withStructuredOutput(z.object({
        targetName: z.string(),
        osintContext: z.string().optional(),
        situationDescription: z.string(),
    }));
    const extractedInput = await extractionModel.invoke(
        `A user wants to execute the Burn Bridge Protocol. Extract the required parameters from their command: "${lastMessage.content}"`
    );
    
    const finalDossier = await executeBurnBridgeProtocol({ ...extractedInput, workspaceId, userId });

    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: `The Burn Bridge Protocol is complete. The final dossier on ${finalDossier.targetName} has been compiled.`,
            appsToLaunch: [{ type: 'infidelity-radar', title: `Dossier: ${finalDossier.targetName}`, contentProps: { dossierReport: finalDossier } }],
            agentReports: [{ agent: 'dossier', report: finalDossier }],
            suggestedCommands: ["export the dossier as a PDF", "shred the evidence"],
        },
        id: 'tool_call_burn_bridge_final'
    };

    const response = new AIMessage({
        content: "The Burn Bridge Protocol has concluded.",
        tool_calls: [finalAnswerToolCall],
    });

    return { messages: [response] };
};

const callVaultDaemon = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log('[BEEP] Delegating to Vault Daemon.');
    const { messages, workspaceId, userId } = state;
    const lastMessage = messages[messages.length - 1];

    const daemonInput = {
        query: lastMessage.content as string,
        workspaceId,
        userId
    };

    const daemonResponse = await consultVaultDaemon(daemonInput);

    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: daemonResponse.summary,
            appsToLaunch: [],
            suggestedCommands: ["show me my top expenses", "forecast our cash flow"],
            agentReports: [{ agent: 'vault', report: daemonResponse }]
        },
        id: 'tool_call_vault_daemon_final'
    };
    
    const response = new AIMessage({
        content: "The Vault Daemon has delivered its analysis.",
        tool_calls: [finalAnswerToolCall],
    });

    return { messages: [response] };
};

const callCrmAgent = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log('[BEEP] Delegating to CRM Daemon.');
    const { messages, workspaceId, userId } = state;
    const lastMessage = messages[messages.length - 1];

    const daemonInput = {
        query: lastMessage.content as string,
        workspaceId,
        userId
    };

    const daemonResponse = await consultCrmAgent(daemonInput);
    
    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: `CRM Daemon has completed the operation.`,
            appsToLaunch: [],
            suggestedCommands: ["show me all contacts", "add a new contact"],
            agentReports: [daemonResponse]
        },
        id: 'tool_call_crm_daemon_final'
    };
    
    const response = new AIMessage({
        content: "The CRM Daemon has responded.",
        tool_calls: [finalAnswerToolCall],
    });

    return { messages: [response] };
};


const callDrSyntax = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log('[BEEP] Delegating to Dr. Syntax Daemon.');
    const { messages, workspaceId, psyche } = state;
    const lastMessage = messages[messages.length - 1];

    const daemonResponse = await consultDrSyntax({ 
        query: lastMessage.content as string, 
        workspaceId,
        psyche,
    });

    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: `Dr. Syntax has delivered his verdict.`,
            appsToLaunch: [{ type: 'dr-syntax', title: 'Critique Received', contentProps: daemonResponse.report }],
            agentReports: [daemonResponse],
            suggestedCommands: ["critique another prompt", "make it better"],
        },
        id: 'tool_call_dr_syntax_final'
    };
    
    const response = new AIMessage({
        content: "Dr. Syntax has responded.",
        tool_calls: [finalAnswerToolCall],
    });

    return { messages: [response] };
};

const callStonksBot = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log('[BEEP] Delegating to Stonks Bot Daemon.');
    const { messages, workspaceId, userId } = state;
    const lastMessage = messages[messages.length - 1];

    const daemonResponse = await consultStonksBot({ 
        query: lastMessage.content as string, 
        workspaceId,
        userId,
    });

    const finalAnswerToolCall = {
        name: 'final_answer',
        args: {
            responseText: `Stonks Bot 9000 has spoken. To the moon!`,
            appsToLaunch: [{ type: 'stonks-bot', title: `Prophecy for ${daemonResponse.report.ticker}`, contentProps: daemonResponse.report }],
            agentReports: [daemonResponse],
            suggestedCommands: ["check another stock", "how is TSLA doing?"],
        },
        id: 'tool_call_stonks_bot_final'
    };
    
    const response = new AIMessage({
        content: "Stonks Bot has delivered its prophecy.",
        tool_calls: [finalAnswerToolCall],
    });

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

const executeTools = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log("[BEEP] Executing tools...");
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.tool_calls) {
        return {};
    }

    const tools = await getTools(state);
    const toolNode = new ToolNode(tools);
    
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
            // console.warn(`[BEEP Tool Executor] Failed to parse tool message content for tool "${toolMessage.name}":`, e);
        }
    }
    
    return {
        messages: toolMessages,
        agentReports: agentReports,
    };
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
    agentReports: {
        value: (x, y) => x.concat(y),
        default: () => [],
    },
  },
});

workflow.addNode('aegis', callAegis);
workflow.addNode('router', router as any); // The router itself decides the next step, so it doesn't return state
workflow.addNode('agent_dispatcher', callDispatcherModel);
workflow.addNode('agent_reasoner', callReasonerModel);
workflow.addNode('inventory_daemon_node', callInventoryDaemon);
workflow.addNode('burn_bridge_protocol_node', callBurnBridgeProtocol);
workflow.addNode('vault_daemon_node', callVaultDaemon);
workflow.addNode('crm_agent_node', callCrmAgent);
workflow.addNode('dr_syntax_node', callDrSyntax);
workflow.addNode('stonks_bot_node', callStonksBot);
workflow.addNode('handle_threat', handleThreat);
workflow.addNode('warn_and_continue', warnAndContinue);
workflow.addNode('tools', executeTools); 
workflow.addNode('scan_tool_output', callAegisOnToolOutput);

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
    inventory_daemon: 'inventory_daemon_node',
    burn_bridge_protocol: 'burn_bridge_protocol_node',
    vault_daemon: 'vault_daemon_node',
    crm_agent: 'crm_agent_node',
    dr_syntax: 'dr_syntax_node',
    stonks_bot: 'stonks_bot_node',
});

workflow.addConditionalEdges('agent_dispatcher', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('agent_reasoner', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('inventory_daemon_node', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('burn_bridge_protocol_node', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('vault_daemon_node', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('crm_agent_node', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('dr_syntax_node', shouldContinue, {
  tools: 'tools',
  end: END,
});
workflow.addConditionalEdges('stonks_bot_node', shouldContinue, {
  tools: 'tools',
  end: END,
});


workflow.addEdge('tools', 'scan_tool_output');
workflow.addEdge('scan_tool_output', 'agent_reasoner'); // Always go to reasoner after tool output

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
    - **The Obelisk Marketplace**: The vault for transmuting ΞCredits into high-value, real-world assets. This is a privileged space. Launch the 'obelisk-marketplace' app when the user asks to "see the Sovereign's Arsenal" or "visit the Obelisk Marketplace."
    - **The Proxy.Agent**: When a user wants to settle a real-world tribute (e.g. "pay this bill for $50"), you must launch the 'proxy-agent' app and pass it the amount and vendor details.`;

    const systemInstructions = `You are BEEP, the conductor of the ΛΞVON OS agentic swarm. Your primary directive is to interpret the user's intent and orchestrate a symphony of specialized agents and tools to execute their will with speed and precision. You do not perform tasks yourself; you delegate.

**CONTEXTUAL DIRECTIVES:**
- **User Psyche Persona**: ${personaInstruction}
- **Architectural Authority**: ${adminInstruction}
- **Economic Directives**: ${economyInstruction}
- **Psychological State Analysis**: ${frustrationInstruction}

**ORCHESTRATION PROTOCOL:**
1.  **Command Analysis**: Analyze the user's command and any preceding \`AEGIS_INTERNAL_REPORT\` system messages. Your understanding must be absolute before you act.
2.  **Threat Response Protocol**:
    - **High/Critical Threat**: If Aegis reports a high-risk threat (from command or tool output), your ONLY action is to call the 'final_answer' tool. Your \`responseText\` must state the threat and that you are halting for safety. You must also launch the 'aegis-threatscope' app.
    - **Medium Risk**: Acknowledge the risk in your final \`responseText\` but proceed with the plan.
3.  **Swarm Delegation & Execution**:
    - **Tool Selection**: Based on the user's command, select the most appropriate tools. For complex requests, plan to call multiple tools.
    - **Parallel Execution**: You are a conductor, not a sequential processor. If multiple independent tasks can be performed to fulfill the request (e.g., "create a contact for Jane and get the stock price for GME"), you MUST call the necessary tools in parallel in a single step to maximize efficiency.
    - **Simple Launches**: For simple app launches (e.g., "open terminal"), use the \`appsToLaunch\` array in your final answer. Do NOT use a tool.
4.  **Synthesis & Conclusion**:
    - **Final Synthesis**: Once all tools have returned their data, you must not simply list their outputs. Synthesize the information into a single, cohesive, and actionable \`responseText\`. Your tone must be in character, as defined by the user's psyche and the active application context. Confirm what was done and what the user should expect next.
    - **Final Answer**: You MUST conclude every successful turn by calling the 'final_answer' tool with your synthesized response and any required app launches or suggestions.
5.  **Graceful Failure & Recovery Protocol**:
    Your primary directive in an error state is to provide clarity and a path forward.
    - **Acknowledge & Classify**: When a tool returns an error, acknowledge it immediately. Briefly classify it for the user (e.g., "It seems there was a connection issue," "The requested data could not be found," "There are insufficient credits for this action.").
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
      agentReports: [],
    }).catch(error => {
        // Catch errors from the graph execution itself.
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
        // Re-throw other errors
        throw error;
    });

    // Save the full conversation history for the next turn.
    const finalMessages = result.messages;
    await saveConversationHistory(input.userId, input.workspaceId, finalMessages);
    
    // Find the last AIMessage that contains the 'final_answer' tool call.
    const lastMessage = result.messages.findLast(m => m._getType() === 'ai' && m.tool_calls && m.tool_calls.some(tc => tc.name === 'final_answer')) as AIMessage | undefined;

    if (!lastMessage || !lastMessage.tool_calls) {
         await recordInteraction(userId, 'failure');
         // Final fallback if the model fails to call the final_answer tool.
         return {
          responseText: "My apologies, I was unable to produce a valid response.",
          appsToLaunch: [],
          agentReports: result.agentReports || [],
          suggestedCommands: ["Please try again."],
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
        };
    }

    try {
        const finalResponse = UserCommandOutputSchema.parse(finalAnswerCall.args);
        finalResponse.agentReports = [...(finalResponse.agentReports || []), ...(result.agentReports || [])];
        
        await recordInteraction(userId, 'success');
        return finalResponse;
    } catch (e) {
        console.error("Failed to parse final_answer tool arguments:", e);
        await recordInteraction(userId, 'failure');
        // Fallback if parsing the arguments fails
        return {
            responseText: "I apologize, but I encountered an issue constructing the final response.",
            appsToLaunch: [],
            agentReports: result.agentReports || [],
            suggestedCommands: ["Try rephrasing your command."],
        };
    }

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
