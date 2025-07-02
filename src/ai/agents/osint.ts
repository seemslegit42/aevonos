
'use server';
/**
 * @fileOverview Agent Kernel for the OSINT Digital Bloodhound.
 * Scours open-source intelligence to build a profile on a target.
 * This agent is a specialist daemon in the Groq Swarm, using LangGraph for multi-step reasoning.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { BaseMessage, HumanMessage, ToolMessage, SystemMessage } from '@langchain/core/messages';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AIMessage } from '@langchain/core/messages';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { OsintInputSchema, OsintOutputSchema, type OsintInput, type OsintOutput } from './osint-schemas';
import {
    checkEmailBreaches,
    checkBurnerPhoneNumber,
    searchIntelX,
    scrapeSocialMediaProfile,
} from '../tools/osint-tools';
import { runFirecrawlerScan } from '../tools/firecrawler-tools';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { langchainGroqComplex } from '@/ai/genkit';

// 1. Define the Agent's State
interface OsintAgentState {
  messages: BaseMessage[];
  targetName: string;
  context: string;
}

const osintTools = [checkEmailBreaches, checkBurnerPhoneNumber, searchIntelX, runFirecrawlerScan, scrapeSocialMediaProfile];
const modelWithTools = langchainGroqComplex.bind({
    tools: osintTools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: zodToJsonSchema(tool.schema),
        },
    })),
});

// 2. Define Agent Nodes

// This node initiates the process by deciding which tools to call based on the input.
const callPlanner = async (state: OsintAgentState) => {
  const { targetName, context } = state;

  const planningPrompt = `You are an OSINT mission planner. Your task is to analyze the initial target information and decide which intelligence gathering tools to deploy.
  
  Target Name: "${targetName}"
  Context: "${context}"

  Available tools: checkEmailBreaches, checkBurnerPhoneNumber, searchIntelXLeaks, runFirecrawlerScan, scrapeSocialMediaProfile.
  
  Based on the context, decide which tools to call. For example:
  - If an email is present, call checkEmailBreaches and searchIntelXLeaks.
  - If a phone number is present, call checkBurnerPhoneNumber.
  - If a social media URL (LinkedIn, Instagram, X/Twitter, TikTok, GitHub) is present, use the 'scrapeSocialMediaProfile' tool.
  - For any other generic URL, use the 'runFirecrawlerScan' tool.

  Formulate your plan as a series of tool calls.`;

  const response = await modelWithTools.invoke([new HumanMessage(planningPrompt)]);
  return { messages: [response] };
};


// A "safe" tool node that catches errors during execution and returns them as ToolMessages.
// This prevents the graph from crashing and allows the synthesizer to handle the failure gracefully.
const safeToolsNode = async (state: OsintAgentState): Promise<Partial<OsintAgentState>> => {
    const toolsNode = new ToolNode<OsintAgentState>(osintTools);
    try {
        return await toolsNode.invoke(state);
    } catch (error: any) {
        console.error(`[OSINT Daemon] Tool execution failed:`, error);
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage || !lastMessage.tool_calls) {
            return { messages: [new SystemMessage("OSINT tool call failed without a clear tool call ID.")] };
        }
        // Create an error message for each failed tool call to maintain graph structure.
        const errorMessages = lastMessage.tool_calls.map(tc => new ToolMessage({
            content: `Error: Could not run tool ${tc.name}. Reason: ${error.message}`,
            tool_call_id: tc.id
        }));
        return { messages: errorMessages };
    }
};


// This node synthesizes the final report after all tools have run.
const callSynthesizer = async (state: OsintAgentState) => {
    const { messages, targetName } = state;

    // Extract tool results from the message history
    const toolResults = messages.filter(msg => msg instanceof ToolMessage).map(msg => ({
        tool: msg.name,
        output: JSON.parse(msg.content as string)
    }));

    const synthesisPrompt = `You are an OSINT (Open-Source Intelligence) analysis agent. Your callsign is "Bloodhound". You synthesize raw data from various sources into a coherent intelligence report. Your tone is factual, analytical, and direct.

    You have been provided with raw data findings for a target from multiple OSINT tools. Your task is to review this raw data and populate all fields of the OsintOutputSchema correctly and professionally.
    If any tool calls resulted in an error, you MUST mention the failure in your summary and risk factors, and leave the corresponding data field (e.g., 'breaches', 'socialProfiles') as an empty array. Your report must still be complete and conform to the schema.

    Target Name: ${targetName}
    
    Raw Intelligence Data from tool calls:
    """
    ${JSON.stringify(toolResults, null, 2)}
    """

    Synthesize this raw data into the final intelligence report. Ensure the summary is concise and the risk factors are clearly stated. Determine the overall digital visibility. For socialProfiles, extract follower counts if available, otherwise default to 0.`;
    
    const structuredModel = langchainGroqComplex.withStructuredOutput(OsintOutputSchema);
    const finalReport = await structuredModel.invoke(synthesisPrompt);

    // Add a final message with the result to end the graph.
    return { messages: [new AIMessage({ content: JSON.stringify(finalReport) })] };
};

// 4. Build the Graph
const workflow = new StateGraph<OsintAgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    targetName: { value: (x, y) => y, default: () => "" },
    context: { value: (x, y) => y, default: () => "" },
  },
});

workflow.addNode('planner', callPlanner);
workflow.addNode('tools', safeToolsNode); // Use the safe tool node
workflow.addNode('synthesizer', callSynthesizer);

workflow.setEntryPoint('planner');
workflow.addEdge('planner', 'tools');
workflow.addEdge('tools', 'synthesizer'); // Always proceed to the synthesizer, even on error.
workflow.addEdge('synthesizer', END);

const osintApp = workflow.compile();

// 5. Create the exported flow
export async function performOsintScan(input: OsintInput): Promise<OsintOutput> {
    const { targetName, context, workspaceId, userId } = OsintInputSchema.parse(input);

    await authorizeAndDebitAgentActions({
        workspaceId,
        userId,
        actionType: 'COMPLEX_LLM',
        costMultiplier: 3.0, // OSINT is a premium, multi-step process
    });

    const result = await osintApp.invoke({
        targetName,
        context: context || '',
        messages: [],
    });

    const finalMessage = result.messages.findLast(m => m._getType() === 'ai' && !m.tool_calls);
    if (!finalMessage) {
        throw new Error("OSINT daemon failed to produce a final report.");
    }
    
    return OsintOutputSchema.parse(JSON.parse(finalMessage.content as string));
}
