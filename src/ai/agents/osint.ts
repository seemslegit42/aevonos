
'use server';
/**
 * @fileOverview Agent Kernel for the OSINT Digital Bloodhound.
 * Scours open-source intelligence to build a profile on a target.
 * This agent is a specialist daemon in the Groq Swarm, using LangGraph for multi-step reasoning.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { BaseMessage, HumanMessage, ToolMessage, AIMessage } from '@langchain/core/messages';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

import { langchainGroqComplex } from '@/ai/genkit';
import { OsintInputSchema, OsintOutputSchema, type OsintInput, type OsintOutput } from './osint-schemas';
import {
    checkEmailBreaches,
    checkBurnerPhoneNumber,
    searchIntelX,
    scrapeSocialMediaProfile,
} from '../tools/osint-tools';
import { runFirecrawlerScan } from '../tools/firecrawler-tools';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import type { Tool } from '@langchain/core/tools';


// 1. Define the Agent's State
interface OsintAgentState {
  messages: BaseMessage[];
}

// 2. Define the new 'final_answer' tool for OSINT
class FinalAnswerOsintTool extends Tool {
    name = 'final_answer_osint';
    description = 'Call this tool when the OSINT investigation is complete and you have all the necessary information to generate the final report.';
    schema = OsintOutputSchema;
    
    async _call(input: z.infer<typeof OsintOutputSchema>): Promise<string> {
        return JSON.stringify(input);
    }
}

// 3. Define Tools and Model
const osintTools = [
    checkEmailBreaches,
    checkBurnerPhoneNumber,
    searchIntelX,
    runFirecrawlerScan,
    scrapeSocialMediaProfile,
    new FinalAnswerOsintTool()
];

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


// 4. Define Agent Nodes
const callModel = async (state: OsintAgentState) => {
    const { messages } = state;
    const response = await modelWithTools.invoke(messages);
    return { messages: [response] };
};

// A safe tool node that catches errors and returns them as a ToolMessage
const safeToolsNode = async (state: OsintAgentState): Promise<Partial<OsintAgentState>> => {
    const toolsNode = new ToolNode<OsintAgentState>(osintTools);
    try {
        return await toolsNode.invoke(state);
    } catch (error: any) {
        console.error(`[OSINT Agent] Tool execution failed:`, error);
        const lastMessage = state.messages[state.messages.length - 1];
        // Attribute the error to the first tool call for simplicity.
        const tool_call_id = lastMessage.tool_calls?.[0]?.id ?? "error_tool_call";
        const errorMessage = new ToolMessage({
            content: `Tool execution failed with error: ${error.message}. You MUST inform the user about this failure and suggest a next step. Do not try to call the tool again. Synthesize your existing findings and call final_answer_osint.`,
            tool_call_id,
        });
        return { messages: [errorMessage] };
    }
};


// 5. Define Graph Logic
const shouldContinue = (state: OsintAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        if (lastMessage.tool_calls.some(tc => tc.name === 'final_answer_osint')) {
            return 'end';
        }
        return 'continue';
    }
    return 'end';
};

// 6. Build the Graph
const workflow = new StateGraph<OsintAgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
  },
});

workflow.addNode('agent', callModel);
workflow.addNode('tools', safeToolsNode);
workflow.setEntryPoint('agent');
workflow.addConditionalEdges('agent', shouldContinue, {
    continue: 'tools',
    end: END,
});
workflow.addEdge('tools', 'agent');

const osintApp = workflow.compile();


// 7. Create the exported flow
export async function performOsintScan(input: OsintInput): Promise<OsintOutput> {
    const { targetName, context, workspaceId, userId } = OsintInputSchema.parse(input);

    await authorizeAndDebitAgentActions({
        workspaceId,
        userId,
        actionType: 'COMPLEX_LLM',
        costMultiplier: 3.0, 
    });

    const initialPrompt = new HumanMessage(`You are an OSINT (Open-Source Intelligence) analysis agent. Your callsign is "Bloodhound". Your mission is to conduct a comprehensive investigation on the provided target and synthesize your findings into a final report.

**Mission Briefing:**
- **Target Name**: "${targetName}"
- **Initial Context**: "${context || 'No additional context provided.'}"

**Execution Plan:**
1.  **Analyze** the initial context. Use the provided tools to gather intelligence. You can and should chain tool calls. For example, scrape a website, extract an email, then check that email for breaches.
2.  **Reason** about the results of each tool call. Does the information from one tool open up new avenues for investigation with another tool?
3.  **Synthesize** all gathered intelligence. Do not just list tool outputs. Create a coherent narrative.
4.  **Conclude**: Once you are confident you have exhausted all leads or gathered sufficient intelligence, you MUST call the \`final_answer_osint\` tool with the complete, structured report. This is your final action.

Begin the investigation now.`);


    const result = await osintApp.invoke({
        messages: [initialPrompt],
    });

    const finalMessage = result.messages.findLast(m => 
        m instanceof AIMessage &&
        m.tool_calls &&
        m.tool_calls.some(tc => tc.name === 'final_answer_osint')
    ) as AIMessage | undefined;

    if (!finalMessage || !finalMessage.tool_calls) {
        throw new Error("OSINT daemon failed to produce a final report.");
    }

    const finalAnswerCall = finalMessage.tool_calls.find(tc => tc.name === 'final_answer_osint');
    if (!finalAnswerCall) {
        throw new Error("OSINT daemon finished without calling final_answer_osint.");
    }
    
    return OsintOutputSchema.parse(finalAnswerCall.args);
}
