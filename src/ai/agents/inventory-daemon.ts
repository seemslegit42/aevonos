
'use server';
/**
 * @fileOverview The Inventory Daemon, a specialist LangGraph agent.
 * This daemon is responsible for all inventory-related reasoning and actions.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { langchainGroqComplex } from '@/ai/genkit';
import { getStockLevels, placePurchaseOrder } from '@/ai/tools/inventory-tools';
import { z } from 'zod';
import { InventoryDaemonInputSchema, InventoryDaemonOutputSchema, type InventoryDaemonInput, type InventoryDaemonOutput } from './inventory-daemon-schemas';

const inventoryTools = [getStockLevels, placePurchaseOrder];
const modelWithTools = langchainGroqComplex.bind({
    tools: inventoryTools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: zodToJsonSchema(tool.schema),
        },
    })),
});

// 1. Define the Agent's State
interface InventoryAgentState {
  messages: BaseMessage[];
}

// 2. Define the Agent's Nodes
const callModel = async (state: InventoryAgentState) => {
    const { messages } = state;
    const response = await modelWithTools.invoke(messages);
    return { messages: [response] };
};

// This "safe" tool node catches errors and returns them as a ToolMessage
// allowing the graph to route to an error handler instead of crashing.
const safeToolsNode = async (state: InventoryAgentState): Promise<Partial<InventoryAgentState>> => {
    const toolsNode = new ToolNode<InventoryAgentState>(inventoryTools);
    try {
        return await toolsNode.invoke(state);
    } catch (error: any) {
        console.error(`[Inventory Daemon] Tool execution failed:`, error);
        const lastMessage = state.messages[state.messages.length - 1];
        // We may not know which tool call failed if there were multiple, so we attribute
        // the error to the first one for simplicity.
        const tool_call_id = lastMessage.tool_calls?.[0]?.id ?? "error_tool_call";
        const errorMessage = new ToolMessage({
            content: `Error: ${error.message}`,
            tool_call_id,
        });
        return { messages: [errorMessage] };
    }
};

// This node creates a final, user-facing error message.
const handleErrorNode = (state: InventoryAgentState): Partial<InventoryAgentState> => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    const errorMessage = lastMessage.content as string; // "Error: ..."

    const finalErrorMessage = new AIMessage({
        content: `I'm sorry, I was unable to complete your request. The system reported the following error: ${errorMessage}`
    });
    return { messages: [finalErrorMessage] };
};

// 3. Define the Agent's Conditional Edges
const shouldContinue = (state: InventoryAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'continue_to_tools';
    }
    return 'end';
};

const checkToolResult = (state: InventoryAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage instanceof ToolMessage && lastMessage.content.startsWith("Error:")) {
        return "error";
    }
    return "continue_to_agent";
};


// 4. Build the Graph
const workflow = new StateGraph<InventoryAgentState>({
    channels: {
        messages: {
            value: (x, y) => x.concat(y),
            default: () => [],
        },
    },
});

workflow.addNode('agent', callModel);
workflow.addNode('tools', safeToolsNode);
workflow.addNode('handle_error', handleErrorNode);

workflow.setEntryPoint('agent');

workflow.addConditionalEdges('agent', shouldContinue, {
    continue_to_tools: 'tools',
    end: END,
});

workflow.addConditionalEdges('tools', checkToolResult, {
    continue_to_agent: 'agent',
    error: 'handle_error',
});
workflow.addEdge('handle_error', END);


const inventoryApp = workflow.compile();

// 5. Create the exported flow for BEEP to call that returns the AgentReport format.
export async function consultInventoryDaemon(input: InventoryDaemonInput): Promise<{ agent: 'inventory-daemon', report: InventoryDaemonOutput }> {
    const systemMessage = new HumanMessage(
        `You are the Daemon of Inventory. Your purpose is to provide precise, accurate, and actionable information about inventory levels and supply chain logistics. You are efficient and focused. You must use your available tools to answer the user's query. When you have a final answer, state it clearly.
        
        User Query: "${input.query}"`
    );

    const result = await inventoryApp.invoke({
        messages: [systemMessage],
    });

    const lastMessage = result.messages.findLast(m => m instanceof AIMessage && !m.tool_calls);

    const response = lastMessage?.content as string || "The daemon is silent. No conclusive response was formulated.";
    
    return {
        agent: 'inventory-daemon',
        report: { response }
    };
}
