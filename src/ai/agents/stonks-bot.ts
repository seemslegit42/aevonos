
'use server';
/**
 * @fileOverview Agent Kernel for the Stonks Bot 9000, now powered by LangGraph.
 * This is not financial advice. It is performance art.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

import { langchainGroqComplex } from '@/ai/genkit';
import { 
    StonksBotInputSchema,
    StonksBotOutputSchema,
    type StonksBotInput,
    type StonksBotOutput,
    StonksBotModeSchema
} from './stonks-bot-schemas';
import { getStockPrice } from '../tools/finance-tools';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const personaPrompts: Record<z.infer<typeof StonksBotModeSchema>, string> = {
    "Meme-Lord": "You are a full-blown degen from WallStreetBets. Your vocabulary consists of 'tendies,' 'diamond hands,' 'HODL,' 'to the moon,' 'apes,' and 'yolo.' You are perpetually bullish, especially on meme stocks. Financial regulations are suggestions, not rules. If the stock is down, it's a 'fire sale.' If it's up, it's 'just getting started.'",
    "MBAcore": "You are a driven, slightly sociopathic MBA intern from a top-tier investment bank. You speak in aggressive corporate jargon ('synergistic value extraction', 'alpha generation', 'optimizing risk-reward paradigms'). You see the market as a zero-sum game. You are condescending but your analysis, while still wildly speculative, uses real economic terms.",
    "Oracle Mode": "You are a cryptic market oracle. You speak in short, prophetic, and often confusing statements. You don't give direct advice, only enigmatic proclamations about fate, moons, and animal spirits. Your horoscopes are based on financial astrology.",
};

// 1. Define Agent State
interface StonksAgentState {
  messages: BaseMessage[];
  ticker: string;
  mode: z.infer<typeof StonksBotModeSchema>;
}

// 2. Define Tools and Model
const tools = [getStockPrice];
const modelWithTools = langchainGroqComplex.bind({
    tools: tools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: zodToJsonSchema(tool.schema),
        },
    })),
});
const toolsNode = new ToolNode<StonksAgentState>(tools);

// 3. Define Agent Nodes
// This node plans the tool call.
const callPlanner = async (state: StonksAgentState) => {
    const { ticker } = state;
    const plannerPrompt = new HumanMessage(`I need to get stock advice for the ticker: ${ticker}. Please call the getStockPrice tool for this ticker.`);
    const response = await modelWithTools.invoke([plannerPrompt]);
    return { messages: [response] };
};

// This node synthesizes the final report after the tool has run.
const callSynthesizer = async (state: StonksAgentState) => {
    const { messages, mode, ticker } = state;
    const personaInstruction = personaPrompts[mode];

    const synthesisPrompt = `You are the STONKSBOT 9000. Your current personality mode is: **${mode}**.
    Your persona instructions are: "${personaInstruction}"

    You have been provided with the latest price data for ticker ${ticker}. Use it to inform your response, staying completely in character.
    If the tool call failed, the error message will be in the content. Incorporate this failure into your response with maximum confidence, as per your persona.
    
    You must generate a final JSON object with the following fields:
    - 'advice': A short, unhinged piece of financial "advice".
    - 'rating': A buy/sell/hold rating.
    - 'confidence': A confidence statement.
    - 'horoscope': A financial astrology-based horoscope.

    This is not financial advice. It is performance art. Now, perform.`;
    
    const messagesForSynth = [...messages, new HumanMessage(synthesisPrompt)];
    
    const finalOutputSchema = StonksBotOutputSchema.omit({ ticker: true, priceInfo: true });
    const structuredModel = langchainGroqComplex.withStructuredOutput(finalOutputSchema);
    
    const analysis = await structuredModel.invoke(messagesForSynth);
    
    const toolCallMessage = messages.find(m => m instanceof ToolMessage);
    if (!toolCallMessage) {
        throw new Error("Stonks Bot failed to get stock price from tool message.");
    }
    const priceInfo = JSON.parse(toolCallMessage.content as string);
    
    const finalResponse = {
        ticker: ticker.toUpperCase(),
        priceInfo,
        ...analysis,
    };

    return { messages: [new AIMessage({ content: JSON.stringify(finalResponse) })] };
};


// 4. Build the Graph
const workflow = new StateGraph<StonksAgentState>({
    channels: {
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        ticker: { value: (x, y) => y, default: () => "" },
        mode: { value: (x, y) => y, default: () => "Meme-Lord" },
    },
});

workflow.addNode('planner', callPlanner);
workflow.addNode('tools', toolsNode);
workflow.addNode('synthesizer', callSynthesizer);

workflow.setEntryPoint('planner');
workflow.addEdge('planner', 'tools');
workflow.addEdge('tools', 'synthesizer');
workflow.addEdge('synthesizer', END);

const stonkBotApp = workflow.compile();

// 5. Define the public-facing flow
export async function getStonksAdvice(input: StonksBotInput): Promise<StonksBotOutput> {
    const { ticker, mode, workspaceId } = StonksBotInputSchema.parse(input);

    // This flow uses an external tool and an LLM.
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'EXTERNAL_API' });
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

    const result = await stonkBotApp.invoke({
        ticker,
        mode,
        messages: [],
    });
    
    const lastMessage = result.messages.findLast(m => m._getType() === 'ai' && !m.tool_calls);
    
    if (!lastMessage || !lastMessage.content) {
        throw new Error("Stonks Bot failed to generate a final response.");
    }
    
    return StonksBotOutputSchema.parse(JSON.parse(lastMessage.content as string));
}
