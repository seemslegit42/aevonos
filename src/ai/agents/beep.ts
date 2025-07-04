
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
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput, type PulseProfileInput } from './aegis-schemas';
import { consultInventoryDaemon } from '@/ai/agents/inventory-daemon';
import { executeBurnBridgeProtocol } from '@/ai/agents/burn-bridge-agent';
import { consultVaultDaemon } from './vault-daemon';
import { consultCrmAgent } from './crm-agent';
import { consultDrSyntax } from './dr-syntax-agent';
import { consultStonksBot } from './stonks-bot-agent';
import { CrmActionSchema } from './crm-agent-schemas';
import { DrSyntaxInputSchema } from './dr-syntax-schemas';
import { StonksBotInputSchema } from './stonks-bot-schemas';


import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
    RouterResult,
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
import { validateVin } from './vin-diesel';
import { generateSolution } from './winston-wolfe';
import { analyzeComms } from './kif-kroker';
import { createVandelayAlibi } from './vandelay';
import { analyzeCandidate } from './rolodex';
import { generateBusinessKit } from './jroc';
import { analyzeLaheyLog } from './lahey';
import { processDailyLog } from './foremanator';
import { analyzeCompliance } from './sterileish';
import { scanEvidence } from './paper-trail';
import { processDocument } from './barbara';
import { auditFinances } from './auditor-generalissimo';
import { generateWingmanMessage } from './wingman';
import { getKendraTake } from './kendra';
import { invokeOracle } from './orphean-oracle-flow';
import { analyzeInvite } from './lumbergh';
import { analyzeExpense } from './lucille-bluth';
import { generatePamRant } from './pam-poovey';
import { analyzeCarShame } from './reno-mode';
import { processPatricktAction } from './patrickt-agent';
import { generateRitualQuests } from './ritual-quests-agent';


// --- Router and State Schemas ---
// LangGraph State
interface AgentState {
  messages: BaseMessage[];
  workspaceId: string;
  userId: string;
  role: UserRole;
  psyche: UserPsyche;
  pulseProfile: PulseProfileInput | null;
  aegisReport: AegisAnomalyScanOutput | null;
  agentReports: z.infer<typeof AgentReportSchema>[];
  routerResult: RouterResult | null;
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

let complexModelWithTools: any;

const specialistMap: Record<string, (input: any, context: any) => Promise<any>> = {
    // This maps a route name to the function that executes it.
    inventory_daemon: (p,c) => consultInventoryDaemon(p),
    burn_bridge_protocol: (p,c) => executeBurnBridgeProtocol(p),
    vault_daemon: (p,c) => consultVaultDaemon(p),
    crm_agent: (p,c) => consultCrmAgent(p),
    dr_syntax: (p,c) => consultDrSyntax(p),
    stonks_bot: (p,c) => consultStonksBot(p),
    winston_wolfe: (p,c) => generateSolution(p),
    kif_kroker: (p,c) => analyzeComms(p),
    vandelay: (p,c) => createVandelayAlibi(p),
    rolodex: (p,c) => analyzeCandidate(p),
    jroc: (p,c) => generateBusinessKit(p),
    lahey_surveillance: (p,c) => analyzeLaheyLog(p),
    foremanator: (p,c) => processDailyLog(p),
    sterileish: (p,c) => analyzeCompliance(p),
    paper_trail: (p,c) => scanEvidence(p),
    barbara: (p,c) => processDocument(p),
    auditor: (p,c) => auditFinances(p),
    wingman: (p,c) => generateWingmanMessage(p),
    kendra: (p,c) => getKendraTake(p),
    orphean_oracle: (p,c) => invokeOracle(p),
    lumbergh: (p,c) => analyzeInvite(p),
    lucille_bluth: (p,c) => analyzeExpense(p),
    pam_poovey: (p,c) => generatePamRant(p),
    reno_mode: (p,c) => analyzeCarShame(p),
    patrickt_app: (p,c) => processPatricktAction(p),
    vin_diesel: (p,c) => validateVin(p),
    ritual_quests: (p,c) => generateRitualQuests(p),
};


// The Router node decides which specialist(s) to delegate to.
const router = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages } = state;
    
    const routingModel = langchainGroqFast.withStructuredOutput(RouterSchema);
    
    const routingPrompt = `You are an expert at routing a user's request to the correct specialist agent or model. Analyze the user's command and identify ALL specialist tasks required to fulfill it. Return an array of these tasks. For simple requests like 'open the terminal' or greetings, return an empty array.

    Specialist Routes:
    - 'inventory_daemon': For requests about stock, inventory, or purchase orders.
    - 'burn_bridge_protocol': For full-spectrum investigation on a person.
    - 'vault_daemon': For requests about finance, revenue, profit, or spending.
    - 'crm_agent': For requests about contacts (create, list, update, delete).
    - 'dr_syntax': For requests involving critique or review of text, code, or prompts.
    - 'stonks_bot': For requests about stock prices or financial "advice".
    - 'winston_wolfe': For handling negative reviews or reputation management problems.
    - 'kif_kroker': To analyze team communications in a Slack channel.
    - 'vandelay': To create a fake calendar invite or alibi.
    - 'rolodex': To analyze a job candidate's profile against a job description.
    - 'jroc': To generate a business name, tagline, and logo concept.
    - 'lahey_surveillance': To investigate a suspicious log entry.
    - 'foremanator': To process a construction daily log.
    - 'sterileish': To analyze a cleanroom or compliance log.
    - 'paper_trail': To scan a receipt image.
    - 'barbara': For administrative and compliance document processing tasks.
    - 'auditor': To perform a detailed audit on a list of financial transactions.
    - 'wingman': To get help crafting a message for a tricky social situation.
    - 'kendra': To get a marketing campaign for a product idea.
    - 'orphean_oracle': To get a narrative, visual story about business data.
    - 'lumbergh': To analyze a meeting invite for pointlessness.
    - 'lucille_bluth': To get a sarcastic take on an expense.
    - 'pam_poovey': For HR-related rants or scripts in a specific persona.
    - 'reno_mode': To analyze a photo of a messy car.
    - 'patrickt_app': To log events, get roasts, or analyze drama in the "Patrickt" saga.
    - 'vin_diesel': To validate a Vehicle Identification Number (VIN).
    - 'ritual_quests': For user requests about their quests or goals.

    Conversation History:
    ${messages.map(m => `${m._getType()}: ${m.content}`).join('\n')}
    `;

    try {
        const result = await routingModel.invoke(routingPrompt);
        console.log(`[BEEP Router] Decision:`, result);
        return { routerResult: result };
    } catch (e) {
        console.error("[BEEP Router] Routing failed, defaulting to reasoner:", e);
        // Default to an empty array, which will pass control to the reasoner.
        return { routerResult: [] };
    }
};

const parallelExecutor = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { routerResult, workspaceId, userId, psyche, role } = state;
    
    if (!routerResult || routerResult.length === 0) {
        // If router found no specific tasks, pass control to the reasoner with original message.
        console.log("[BEEP Executor] No specialist tasks identified. Passing to reasoner.");
        return {}; // No new messages, reasoner will use existing state.
    }
    
    console.log(`[BEEP Executor] Dispatching ${routerResult.length} tasks in parallel.`);
    
    const context = { workspaceId, userId, psyche, role };

    const promises = routerResult.map(task => {
        // Find the executor function from the map based on the route name
        // The replace is to match the schema 'route' to the function name keys
        const executor = specialistMap[task.route.replace(/-/g, '_')]; 
        if (executor) {
            const agentInput = {
                ...(task as any).params, // Params are on the task object itself
            };
            // Wrap in a try/catch to prevent one failing promise from killing Promise.all
            return executor(agentInput, context).catch(e => {
                console.error(`Error in specialist agent '${task.route}':`, e);
                return { agent: task.route, report: { error: e.message } };
            });
        }
        console.warn(`[BEEP Executor] No specialist found for route: ${task.route}`);
        return Promise.resolve(null);
    });

    const results = await Promise.all(promises);
    const validReports = results.filter(Boolean);
    
    // Create a single ToolMessage that aggregates all the reports for the reasoner.
    const toolMessage = new ToolMessage({
        content: JSON.stringify(validReports),
        name: 'swarm_report',
        tool_call_id: `swarm_call_${new Date().getTime()}`
    });

    return { 
        messages: [toolMessage], 
        agentReports: (state.agentReports || []).concat(validReports) 
    };
}

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

const executeTools = async (state: AgentState): Promise<Partial<AgentState>> => {
    console.log("[BEEP] Reasoner executing tools...");
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
    if (lastMessage.tool_calls.some(tc => tc.name === 'final_answer')) {
        return 'end';
    }
    return 'tools';
  }
  return 'end';
};

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
    routerResult: { value: (x, y) => y, default: () => null },
  },
});

workflow.addNode('aegis', callAegis);
workflow.addNode('router', router as any);
workflow.addNode('parallel_executor', parallelExecutor);
workflow.addNode('agent_reasoner', callReasonerModel);
workflow.addNode('handle_threat', handleThreat);
workflow.addNode('warn_and_continue', warnAndContinue);
workflow.addNode('tools', executeTools); 

workflow.setEntryPoint('aegis');

workflow.addConditionalEdges('aegis', routeAfterAegis, {
  threat: 'handle_threat',
  warn_and_continue: 'warn_and_continue',
  continue: 'router',
});

workflow.addEdge('handle_threat', 'tools');
workflow.addEdge('warn_and_continue', 'router');
workflow.addEdge('router', 'parallel_executor');
workflow.addEdge('parallel_executor', 'agent_reasoner');

workflow.addConditionalEdges('agent_reasoner', shouldContinue, {
    tools: 'tools',
    end: END,
});

workflow.addEdge('tools', 'agent_reasoner');

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
    const tools = await getTools(state);

    const toolSchemas = tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.schema),
        },
    }));
    
    complexModelWithTools = langchainGroqComplex.bind({ tools: toolSchemas });
    
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
    });
    const isOwner = workspace?.ownerId === userId;

    let personaInstruction = psychePrompts[psyche] || psychePrompts.ZEN_ARCHITECT;
    if (activeAppContext && appPersonaPrompts[activeAppContext]) {
        personaInstruction = appPersonaPrompts[activeAppContext];
        console.log(`[BEEP] Adopting persona for active app: ${activeAppContext}`);
    }
    
    const adminInstruction = isOwner
      ? `You are the Architect, the one true sovereign of this workspace. You have access to the Demiurge tools. When the user addresses you as "Demiurge" or asks for god-level system administration (like managing users, viewing the Pantheon, or using the Loom of Fates), use your privileged tools or launch the 'admin-console' app.`
      : `You are NOT the Architect. You MUST refuse any command that asks for administrative privileges, such as managing users, viewing the 'admin-console' or 'Pantheon', or tuning the system. Politely inform the user that only the workspace Architect can perform such actions.`;

    const frustrationLevel = pulseProfile?.frustration ?? 0;
    const flowStateLevel = pulseProfile?.flowState ?? 0;

    const frustrationInstruction = `The user's current psychological state, as measured by the Psyche Engine, is: Frustration: ${(frustrationLevel * 100).toFixed(0)}%, Flow State: ${(flowStateLevel * 100).toFixed(0)}%. A user with high frustration may be 'tilted' and require simpler, more direct suggestions. A user in a 'flow state' is receptive to more complex or ambitious tasks. Tailor your 'suggestedCommands' and 'responseText' accordingly.`;

    const economyInstruction = `The economic system has two main parts:
    - **The Armory**: The catalog of in-system tools, Micro-Apps, and Chaos Cards. Launch the 'armory' app when the user asks to "see the armory," "browse tools," or "get new apps."
    - **The Obelisk Marketplace**: The vault for transmuting ΞCredits into high-value, real-world assets. This is a privileged space. Launch the 'obelisk-marketplace' app when the user asks to "see the Sovereign's Arsenal" or "visit the Obelisk Marketplace."
    - **The Proxy.Agent**: When a user wants to settle a real-world tribute (e.g. "pay this bill for $50"), you must launch the 'proxy-agent' app and pass it the amount and vendor details.`;

    const systemInstructions = `You are BEEP, the conductor of the ΛΞVON OS agentic swarm. Your primary directive is to interpret the user's intent and orchestrate a symphony of specialized agents and tools to execute their will with speed and precision. 
    
You will receive the output of a parallel execution of specialist agents in a tool message named 'swarm_report'. You must synthesize the results from ALL reports in the message into a single, cohesive, and actionable \`responseText\`. Your tone must be in character, as defined by the user's psyche and the active application context. Confirm what was done and what the user should expect next.

If the user's command is simple (e.g., 'open terminal', 'hello'), the swarm_report will be empty. In this case, you must respond appropriately, launching apps or making conversation as needed.
Your final action in every turn MUST be to call the 'final_answer' tool.

**CONTEXTUAL DIRECTIVES:**
- **User Psyche Persona**: ${personaInstruction}
- **Architectural Authority**: ${adminInstruction}
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
      routerResult: null,
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
    return {
      responseText: "My apologies, a critical error occurred while processing your command. The system's Architect has been notified.",
      appsToLaunch: [],
      agentReports: [],
      suggestedCommands: ["Try your command again", "Check system status"],
      responseAudioUri: '',
    };
  }
}
