
'use server';

/**
 * @fileOverview This file defines the BEEP agent kernel using LangGraph.
 * BEEP (Behavioral Event & Execution Processor) is the central orchestrator of ΛΞVON OS.
 * It now functions as a hierarchical swarm router, using a high-speed triage node to
 * delegate tasks to specialized sub-routers for improved efficiency and reliability.
 *
 * - processUserCommand - The function to call to process the command.
 * - UserCommandInput - The input type for the processUserCommand function.
 * - UserCommandOutput - The output type for the processUserCommand function.
 */

import { z } from 'zod';
import { StateGraph, END, START } from '@langchain/langgraph';
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
import { getCategorizedSpecialistAgentDefinitions, getSpecialistAgentDefinitions, specialistAgentMap, FinalAnswerTool } from '@/ai/agents/tool-registry';
import { AegisAnomalyScanOutputSchema, type AegisAnomalyScanOutput, type PulseProfileInput } from './aegis-schemas';

import {
    type UserCommandInput,
    UserCommandOutputSchema,
    type UserCommandOutput,
    AgentReportSchema,
    TriageResultSchema,
    type TriageCategory,
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
import { Tool } from '@langchain/core/tools';
import { createSecurityAlertInDb } from '../tools/security-tools';


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
  categories: TriageCategory[] | null;
}

// ===================================================================================
// == 1. DEFINE AGENT NODES
// ===================================================================================

/**
 * Runs a security scan on the user's command before any other action.
 */
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


/**
 * Uses a fast model to categorize the user's command into one or more domains.
 * This is the first step in the hierarchical routing process.
 */
const triage = async (state: AgentState): Promise<Partial<AgentState>> => {
  const { messages } = state;
  const triagePrompt = new HumanMessage(`Your task is to analyze the user's command and identify ALL relevant domains it touches upon to route it to the correct specialist department(s). Respond with an array of categories.

- CRM: For managing contacts (create, list, update, delete).
- FINANCE: For financial analysis, stock market "advice", expense tracking, and auditing.
- CONTENT_ANALYSIS: For critiquing, rewriting, or generating creative or social content.
- ADMINISTRATION: For productivity tasks, compliance checks, and internal monitoring.
- ENTERTAINMENT: For fun, satirical, or game-like interactions.
- WORKSPACE_MANAGEMENT: For high-level system administration, user management, and agent/workflow configuration.
- GENERAL_UTILITY: Use this if the command is complex, spans multiple independent domains (e.g., "list my contacts and get the price of GME"), or doesn't fit a single category well.
- NOT_APPLICABLE: Use this ONLY for simple greetings, chit-chat, or questions that can be answered without any specialized tools.

**IMPORTANT RULES:**
- If the command involves two distinct tasks (e.g., "check my stock portfolio and create a new contact"), you MUST use \`["GENERAL_UTILITY"]\`.
- If a command is complex and requires combining information from multiple domains (e.g., "summarize the financial performance of clients in the tech sector"), use \`["GENERAL_UTILITY"]\`.

User command:
"""
${messages.find(m => m instanceof HumanMessage)?.content}
"""`);

  const triageModel = langchainGroqFast.withStructuredOutput(TriageResultSchema);
  try {
    const { categories } = await triageModel.invoke([triagePrompt]);
    console.log(`[BEEP Triage] Categorized command into: ${categories.join(', ')}`);
    return { categories };
  } catch (e) {
    console.error('[BEEP Triage] Triage failed, defaulting to GENERAL_UTILITY:', e);
    return { categories: ['GENERAL_UTILITY'] };
  }
};


/**
 * A "meta-router" node that invokes multiple specialist routers in parallel based on triage results.
 * It aggregates the tool calls from each specialist into a single execution plan.
 */
const dispatchToSpecialists = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, categories, role } = state;

    if (!categories || categories.length === 0) {
        return { messages: [new SystemMessage({ content: "State error: Dispatcher called without categories."})] };
    }

    console.log(`[BEEP Dispatcher] Dispatching to specialists for categories: ${categories.join(', ')}`);
    const categorizedAgentDefs = getCategorizedSpecialistAgentDefinitions();

    const specialistPromises = categories
        .filter(cat => cat !== 'GENERAL_UTILITY' && cat !== 'NOT_APPLICABLE')
        .map(category => {
            const definitions = categorizedAgentDefs[category];
            if (!definitions) {
                console.warn(`[BEEP Dispatcher] No specialist router found for category: ${category}`);
                return Promise.resolve(null);
            }
            
            const tools = definitions.map(def => new Tool({
                name: def.name,
                description: def.description,
                schema: def.schema,
                func: async () => `This is a stub.`,
            }));

            const routerModel = langchainGroqFast.bind({ tools: [...tools, new FinalAnswerTool()] });
            const prompt = new HumanMessage(`You are a specialist routing agent for the ${category} domain. Your job is to select the correct tool(s) from your limited toolset to handle the user's command. If no tool is appropriate, call \`final_answer\` to escalate to the main reasoner.

Domain: **${category}**
Available Tools:
${definitions.map(def => `- **${def.name}**: ${def.description}`).join('\n')}

User Role: ${role}
User Command:
"""
${messages.find(m => m instanceof HumanMessage)?.content}
"""`);
            return routerModel.invoke([prompt]);
        });
    
    const specialistResponses = await Promise.all(specialistPromises);
    
    const allToolCalls = specialistResponses.flatMap(response => response?.tool_calls || []);

    if (allToolCalls.length === 0) {
        console.log('[BEEP Dispatcher] No tool calls from any specialist. Escalating to reasoner.');
        return { messages: [new AIMessage({ content: "No specialist action taken. Escalating to reasoner." })] };
    }

    console.log(`[BEEP Dispatcher] Aggregated tool calls:`, allToolCalls.map(tc => tc.name));
    
    const aggregatedMessage = new AIMessage({
        content: `Aggregated plan from specialists.`,
        tool_calls: allToolCalls,
    });

    return { messages: [aggregatedMessage] };
};

/**
 * The general-purpose planner node. It is now a fallback for commands
 * that don't fit into a neat category or span multiple domains. It is explicitly
 * instructed to look for parallel execution opportunities.
 */
const generalPlanner = async (state: AgentState): Promise<Partial<AgentState>> => {
    const { messages, role } = state;
    const specialistAgentTools = getSpecialistAgentDefinitions()
      .map(def => new Tool({
        name: def.name,
        description: def.description,
        schema: def.schema,
        func: async () => `This is a stub. The specialist tool node will execute the real function.`,
      }));
      
    const plannerTools = [...specialistAgentTools, new FinalAnswerTool()];
    const routingModel = langchainGroqFast.bind({ tools: plannerTools });
    
    const planningPrompt = new HumanMessage(`You are BEEP, the master conductor of a swarm of specialist AI agents. Your primary goal is to decompose the user's command into a series of discrete tasks that can be executed by your specialist agents.

**Core Directive:** Analyze the user's intent. You have two options:
1.  **Simple Response:** If the command is a simple greeting, a question you can answer directly, or does not require a specialist, you MUST call the \`final_answer\` tool with the appropriate response.
2.  **Complex Task Decomposition:** If the command requires one or more specific capabilities, you MUST identify each discrete task. For each task, select the single best specialist agent from the list below. You can and SHOULD call multiple agent tools in parallel if the user's request contains multiple, independent sub-tasks.

**Example of Parallel Execution:**
- User Command: "I need stock advice for NVDA and a good, boring alibi for my calendar tomorrow afternoon."
- Your Plan:
    1. Call \`stonks_bot\` tool with ticker 'NVDA'.
    2. Call \`vandelay\` tool to create an alibi.
    *These are independent and can be called simultaneously.*

**Available Specialist Agents (Full Swarm):**
${getSpecialistAgentDefinitions().map(def => `- **${def.name}**: ${def.description}`).join('\n')}

Now, analyze the user command and call the appropriate tool(s).

User Role: ${role}
User Command:
"""
${messages.find(m => m instanceof HumanMessage)?.content}
"""`);
    
    const response = await routingModel.invoke([planningPrompt]);
    console.log('[BEEP General Planner] Planner decided to call tools:', response.tool_calls?.map(tc => tc.name));
    return { messages: [response] };
}


/**
 * A robust node for executing tool calls from any agent.
 * It catches errors and packages them into a ToolMessage.
 */
const toolExecutor = async (state: AgentState, config?: any): Promise<Partial<AgentState>> => {
    const { messages, ...context } = state;
    const lastMessage = messages[messages.length - 1];

    if (!(lastMessage instanceof AIMessage) || !lastMessage.tool_calls) {
        // This should not happen if the graph logic is correct, but it's a safe guard.
        return { messages: [new SystemMessage({ content: "State error: tool_executor was called without tool calls."})] };
    }
    
    const tools = config.configurable.tools as Tool[];
    console.log(`[BEEP Tool Executor] Executing tools:`, lastMessage.tool_calls.map(tc => tc.name));

    const toolPromises = lastMessage.tool_calls.map(async (toolCall) => {
        const toolToCall = tools.find(tool => tool.name === toolCall.name);
        
        if (!toolToCall) {
            return new ToolMessage({
                content: `Error: Agent '${toolCall.name}' is not a valid or available tool.`,
                tool_call_id: toolCall.id!,
                name: toolCall.name,
            });
        }
        
        try {
            const observation = await toolToCall.invoke(toolCall.args);
            return new ToolMessage({
                content: typeof observation === 'string' ? observation : JSON.stringify(observation),
                tool_call_id: toolCall.id!,
                name: toolCall.name,
            });
        } catch (error: any) {
             console.error(`[BEEP Tool Executor] Error in agent '${toolCall.name}':`, error);
            // Package the error into a ToolMessage so the reasoner can handle it.
            return new ToolMessage({
                content: `Error: The agent '${toolCall.name}' failed with the following message: ${error.message}`,
                tool_call_id: toolCall.id!,
                name: toolCall.name,
            });
        }
    });

    const toolMessages = await Promise.all(toolPromises);

    const agentReports: z.infer<typeof AgentReportSchema>[] = [];
    for (const toolMessage of toolMessages) {
        try {
            // Some tool calls are not agent reports, so we parse safely.
            const report = AgentReportSchema.parse(JSON.parse(toolMessage.content as string));
            agentReports.push(report);
        } catch (e) { /* Ignore parsing errors for non-report tool calls */ }
    }

    return { 
        messages: toolMessages, 
        agentReports: agentReports,
    };
};


/**
 * The main reasoning node. It uses a complex model with a set of core tools
 * to synthesize information and decide on the final user-facing response.
 */
const callReasonerModel = async (state: AgentState, config?: any) => {
    console.log('[BEEP] Invoking Reasoner (complex model).');
    const complexModelWithTools = langchainGroqComplex.bind({ tools: config.configurable.tools });
    const response = await complexModelWithTools.invoke(state.messages);
    return { messages: [response] };
};

/**
 * A terminal node that handles high-risk security threats detected by Aegis.
 */
const handleThreat = async (state: AgentState) => {
  const { aegisReport, userId, workspaceId } = state;
  if (!aegisReport) {
    throw new Error('handleThreat called without an Aegis report.');
  }

  // Create the security alert in the database
  await createSecurityAlertInDb(
    {
      type: aegisReport.anomalyType || 'High-Risk Anomaly',
      explanation: aegisReport.anomalyExplanation,
      riskLevel: aegisReport.riskLevel!,
    },
    workspaceId,
    userId
  );

  const finalAnswerToolCall = {
    name: 'final_answer',
    args: {
      responseText: `ALERT: Aegis has flagged this command as a potential social engineering attack. The action has been blocked. Reason: ${aegisReport.anomalyExplanation}`,
      appsToLaunch: [{ type: 'aegis-threatscope', title: 'Aegis ThreatScope' }],
      suggestedCommands: ['Lock down my account', 'View security alerts'],
    },
    id: 'tool_call_final_answer_threat',
  };

  const response = new AIMessage({
    content: 'High-risk threat detected. Calling final_answer and terminating.',
    tool_calls: [finalAnswerToolCall],
  });

  return { messages: [response] };
};

/**
 * A node that adds a warning message to the state if Aegis detects a medium-risk activity.
 */
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


// ===================================================================================
// == 2. DEFINE GRAPH EDGES & ROUTING LOGIC
// ===================================================================================

const routeAfterAegis = (state: AgentState) => {
    const riskLevel = state.aegisReport?.riskLevel;
    if (riskLevel === 'high' || riskLevel === 'critical') return 'threat';
    if (riskLevel === 'medium') return 'warn_and_continue';
    return 'continue';
}

/**
 * Routes the command after the initial triage.
 * If one or more specific domains are identified, it routes to the dispatcher.
 * If GENERAL_UTILITY is found, it routes to the general planner.
 * Otherwise, it escalates directly to the reasoner.
 */
const routeAfterTriage = (state: AgentState): string => {
  const { categories } = state;
  if (!categories || categories.length === 0 || categories.includes('NOT_APPLICABLE')) {
    console.log("[BEEP Triage Route] Not applicable or empty. Routing to reasoner.");
    return 'agent_reasoner';
  }
  if (categories.includes('GENERAL_UTILITY')) {
    console.log(`[BEEP Triage Route] General utility requested. Routing to general planner.`);
    return 'generalPlanner';
  }
  
  // If we have one or more specific categories, dispatch to specialists.
  console.log(`[BEEP Triage Route] Specific categories found: ${categories.join(', ')}. Routing to dispatcher.`);
  return 'dispatchToSpecialists';
};

/**
 * Routes the graph after a planning stage (either from the dispatcher or general planner).
 */
const routeAfterPlanning = (state: AgentState) => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!(lastMessage instanceof AIMessage) || !lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
        console.log("[BEEP Planner Route] Planner did not produce tool calls. Escalating to reasoner.");
        return 'agent_reasoner';
    }

    if (lastMessage.tool_calls.some(tc => tc.name === 'final_answer')) {
        console.log("[BEEP Planner Route] Planner provided a final answer. Ending execution.");
        return 'end'; 
    }
    
    console.log("[BEEP Planner Route] Planner dispatched to tool executor.");
    return 'tool_executor';
}

const routeAfterTools = (state: AgentState) => {
    // After tools are executed, always go back to the reasoner to synthesize the results.
    // The reasoner's prompt is equipped to handle success and error messages from tools.
    console.log('[BEEP Tool Route] Tool execution complete. Routing to reasoner to synthesize results.');
    return 'agent_reasoner';
};


// ===================================================================================
// == 3. CONSTRUCT THE WORKFLOW GRAPH
// ===================================================================================

const buildBeepGraph = () => {
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
        categories: { value: (x, y) => y, default: () => null },
      },
    });

    // Add nodes
    workflow.addNode('aegis', callAegis);
    workflow.addNode('warn_and_continue', warnAndContinue);
    workflow.addNode('triage', triage);
    workflow.addNode('dispatchToSpecialists', dispatchToSpecialists);
    workflow.addNode('generalPlanner', generalPlanner);
    workflow.addNode('tool_executor', (state, config) => toolExecutor(state, config));
    workflow.addNode('agent_reasoner', (state, config) => callReasonerModel(state, config));
    workflow.addNode('handle_threat', handleThreat);
    
    // Define edges
    workflow.setEntryPoint('aegis');
    workflow.addConditionalEdges('aegis', routeAfterAegis, {
      threat: 'handle_threat',
      warn_and_continue: 'warn_and_continue',
      continue: 'triage',
    });
    workflow.addEdge('warn_and_continue', 'triage');

    workflow.addConditionalEdges('triage', routeAfterTriage, {
        dispatchToSpecialists: 'dispatchToSpecialists',
        generalPlanner: 'generalPlanner',
        agent_reasoner: 'agent_reasoner',
    });

    workflow.addConditionalEdges('dispatchToSpecialists', routeAfterPlanning, {
        tool_executor: 'tool_executor',
        agent_reasoner: 'agent_reasoner',
        end: END,
    });
    
    workflow.addConditionalEdges('generalPlanner', routeAfterPlanning, {
        tool_executor: 'tool_executor',
        agent_reasoner: 'agent_reasoner',
        end: END,
    });
    
    workflow.addEdge('tool_executor', 'agent_reasoner');
    
    // The reasoner's only tool is `final_answer`. So after it runs, the graph ends.
    workflow.addEdge('agent_reasoner', END);
    
    // Add terminal nodes
    workflow.addEdge('handle_threat', END);

    return workflow.compile();
}

const app = buildBeepGraph();


// ===================================================================================
// == 4. EXPORTED PUBLIC-FACING FUNCTION
// ===================================================================================

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
    
    // Create a dynamic list of all specialist tools, wrapping them to include the necessary context on invocation.
    const allSpecialistTools = Object.entries(specialistAgentMap).map(([name, func]) => {
        const agentDefinition = getSpecialistAgentDefinitions().find(def => def.name === name);
        if (!agentDefinition) {
            throw new Error(`Definition not found for specialist agent: ${name}`);
        }
        return new Tool({
            name,
            description: agentDefinition.description,
            schema: agentDefinition.schema,
            func: (toolInput: any) => func(toolInput, { userId, workspaceId, psyche, role }),
        });
    });

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
    - **The Proxy.Agent**: When a user wants to settle a real-world tribute (e.g. "pay this bill for $50 to Hydro-Québec"), you must launch the 'proxy-agent' app and pass it the amount, vendor, and currency details as 'contentProps'. For example: { type: 'proxy-agent', contentProps: { amount: 50, vendor: 'Hydro-Québec', currency: 'CAD' } }`;

    const systemInstructions = `You are BEEP, the master conductor of the ΛΞVON OS agentic swarm. Your swarm has just completed its assigned tasks. Your current responsibility is to synthesize the results into a single, cohesive, and elegant response for the Architect (the user).

**Execution Summary:**
You have received one or more \`ToolMessage\`s containing the raw JSON output from the specialist agents you dispatched. You may also have an Aegis security report flagging the initial command.

**Your Synthesis Task:**
1.  **Review All Reports:** Carefully examine the content of every \`ToolMessage\` and the Aegis report.
2.  **Formulate Narrative:** Weave the results into a single, user-facing narrative. Do not simply list the JSON outputs. Explain what was done, what was found, and what the user should do next.
3.  **Maintain Persona:** Your tone MUST be in character, as defined by the user's psyche and the active application context. This is paramount.
4.  **Launch Relevant Apps:** If the agent reports contain data that should be visualized, call the 'final_answer' tool and specify which Micro-Apps to launch in the \`appsToLaunch\` array. For example, if you receive a CRM report, you might launch the 'contact-list' app.
5.  **Suggest Next Steps:** Provide intelligent, proactive 'suggestedCommands' that anticipate the user's next move.
6.  **Acknowledge Risk:** If the Aegis report flagged the command with a medium risk, you must subtly incorporate a warning into your final response.

Your final action in every turn MUST be to call the 'final_answer' tool with your synthesized response and actions.

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
    
    const runnableConfig = { 
        configurable: { 
            "tool_executor": { tools: allSpecialistTools },
            "agent_reasoner": { tools: reasonerTools },
        } 
    };

    const result = await app.invoke({
      messages: [new SystemMessage(systemInstructions), ...history, new HumanMessage(input.userCommand)],
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
      psyche: input.psyche,
      pulseProfile: pulseProfile || null,
      categories: null,
      agentReports: [],
    }, runnableConfig).catch(error => {
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

    