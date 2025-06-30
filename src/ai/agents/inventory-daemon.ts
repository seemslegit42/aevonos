
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
import { langchainGroq } from '@/ai/genkit';
import { getStockLevels, placePurchaseOrder } from '@/ai/tools/inventory-tools';
import { z } from 'zod';

const inventoryTools = [getStockLevels, placePurchaseOrder];
const modelWithTools = langchainGroq.bind({
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

const toolsNode = new ToolNode<InventoryAgentState>(inventoryTools);

// 3. Define the Agent's Conditional Edges
const shouldContinue = (state: InventoryAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    // If the model decides to call a tool, we continue to the tools node.
    if ('tool_calls' in lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'continue';
    }
    // Otherwise, we end the graph.
    return 'end';
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
workflow.addNode('tools', toolsNode);

workflow.setEntryPoint('agent');

workflow.addConditionalEdges('agent', shouldContinue, {
    continue: 'tools',
    end: END,
});
workflow.addEdge('tools', 'agent');

const inventoryApp = workflow.compile();

// 5. Create the exported flow for BEEP to call
export const InventoryDaemonInputSchema = z.object({
  query: z.string().describe("The user's inventory-related query or command."),
});
export type InventoryDaemonInput = z.infer<typeof InventoryDaemonInputSchema>;

export const InventoryDaemonOutputSchema = z.object({
  response: z.string().describe("The final, synthesized response from the Inventory Daemon."),
});
export type InventoryDaemonOutput = z.infer<typeof InventoryDaemonOutputSchema>;

export async function consultInventoryDaemon(input: InventoryDaemonInput): Promise<InventoryDaemonOutput> {
    const systemMessage = new HumanMessage(
        `You are the Daemon of Inventory. Your purpose is to provide precise, accurate, and actionable information about inventory levels and supply chain logistics. You are efficient and focused. You must use your available tools to answer the user's query. When you have a final answer, state it clearly.
        
        User Query: "${input.query}"`
    );

    const result = await inventoryApp.invoke({
        messages: [systemMessage],
    });

    const lastMessage = result.messages.findLast(m => m instanceof AIMessage && !m.tool_calls);

    return {
        response: lastMessage?.content as string || "The daemon is silent. No conclusive response was formulated."
    };
}
