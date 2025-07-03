
'use server';
/**
 * @fileOverview The Vault Daemon, a specialist LangGraph agent for financial analysis.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { langchainGroqComplex } from '@/ai/genkit';
import { getFinancialSummary } from '@/ai/tools/finance-tools';
import { VaultQueryInputSchema, VaultAnalysisOutputSchema, type VaultQueryInput, type VaultAnalysisOutput } from './vault-daemon-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const vaultTools = [getFinancialSummary];
const modelWithTools = langchainGroqComplex.bind({
    tools: vaultTools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: zodToJsonSchema(tool.schema),
        },
    })),
});

interface VaultAgentState {
  messages: BaseMessage[];
  workspaceId: string;
}

const callModel = async (state: VaultAgentState) => {
    const response = await modelWithTools.invoke(state.messages);
    return { messages: [response] };
};

const toolsNode = new ToolNode<VaultAgentState>(vaultTools);

const shouldContinue = (state: VaultAgentState) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'continue';
    }
    return 'end';
};

const workflow = new StateGraph<VaultAgentState>({
    channels: {
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        workspaceId: { value: (x, y) => y },
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

const vaultApp = workflow.compile();

export async function consultVaultDaemon(input: VaultQueryInput): Promise<VaultAnalysisOutput> {
    await authorizeAndDebitAgentActions({
        workspaceId: input.workspaceId,
        userId: input.userId,
        actionType: 'COMPLEX_LLM',
        costMultiplier: 1.5
    });

    const systemMessage = new HumanMessage(
        `You are the Vault Daemon, a guardian of finance and risk. Your purpose is to provide precise, actionable financial insights with the tone of a stoic, ancient treasurer. You are not an accountant; you are a sentinel. Your words are measured and weighty.

        Your primary directive is to use the \`getFinancialSummary\` tool to gather data. Once you have the data, you MUST analyze it to produce a final, structured JSON output containing:
        1. A concise, insightful \`summary\` of the overall financial situation.
        2. A list of 3-4 \`keyInsights\` or warnings. These should be direct and impactful.
        3. A \`profitLeakAnalysis\` identifying potential areas of waste or inefficiency.

        The user's query is: "${input.query}"
        The workspace ID you must use for the tool call is: "${input.workspaceId}"

        Begin your analysis. The vault is open.`
    );
    
    const structuredModel = langchainGroqComplex.withStructuredOutput(VaultAnalysisOutputSchema);
    const finalResult = await vaultApp.pipe(structuredModel).invoke({
        messages: [systemMessage],
        workspaceId: input.workspaceId,
    });
    
    return finalResult;
}

    
