
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
import { getStockPriceAlphaVantage, getStockPriceFinnhub } from '../tools/finance-tools';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { getCachedAdvice, setCachedAdvice } from './stonks-bot-cache';

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
  fallbackAttempts: number;
}

// 2. Define Tools and Model
const tools = [getStockPriceAlphaVantage, getStockPriceFinnhub];
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

// A safe tool node that catches errors and returns them as a ToolMessage
const safeToolsNode = async (state: StonksAgentState): Promise<Partial<StonksAgentState>> => {
    const toolsNode = new ToolNode<StonksAgentState>(tools);
    try {
        return await toolsNode.invoke(state);
    } catch (error: any) {
        console.error(`[Stonks Bot] Tool execution failed:`, error);
        const lastMessage = state.messages[state.messages.length - 1];
        const tool_call_id = lastMessage.tool_calls?.[0]?.id ?? "error_tool_call";
        const errorMessage = new ToolMessage({
            content: `Error: ${error.message}`,
            tool_call_id,
        });
        return { messages: [errorMessage] };
    }
};

// 3. Define Agent Nodes
// This node plans the primary tool call.
const callPlanner = async (state: StonksAgentState) => {
    const { ticker } = state;
    const plannerPrompt = new HumanMessage(`I need to get stock advice for the ticker: ${ticker}. Please call the getStockPriceAlphaVantage tool for this ticker as it is the primary source.`);
    const response = await modelWithTools.invoke([plannerPrompt]);
    return { messages: [response] };
};

// This node plans the fallback tool call if the first one fails.
const callFallback = async (state: StonksAgentState) => {
    const { messages, ticker } = state;
    const lastMessage = messages[messages.length - 1];
    const fallbackPrompt = new HumanMessage(`The previous tool call failed with the following error: "${lastMessage.content}". Please call the alternative financial data source, getStockPriceFinnhub, to get the stock price for ${ticker}.`);
    const response = await modelWithTools.invoke(messages.concat(fallbackPrompt));
    return { 
        messages: [response],
        fallbackAttempts: state.fallbackAttempts + 1,
    };
};


// This node synthesizes the final report after a tool has run successfully.
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
    
    const toolCallMessage = messages.findLast(m => m instanceof ToolMessage && !m.content.includes("Error:"));
    
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

const handleFailure = async (state: StonksAgentState): Promise<Partial<StonksAgentState>> => {
    const { ticker } = state;
    
    const finalResponse = {
        ticker: ticker.toUpperCase(),
        priceInfo: { symbol: ticker.toUpperCase(), price: 'N/A', change: 'N/A', changePercent: 'N/A', source: 'Data Unavailable' },
        advice: `The prophecy is clouded. Both primary and secondary data feeds for ${ticker} have failed. The market spirits are displeased.`,
        confidence: "The runes are unclear",
        rating: "Sell to the fools",
        horoscope: `A dark omen hangs over ${ticker}. Financial data sources have gone silent, suggesting a major disruption in the stock's cosmic alignment. Avoid this ticker until the stars are right again.`
    };

    return { messages: [new AIMessage({ content: JSON.stringify(finalResponse) })] };
};


// Conditional Edge Logic
const shouldFallback = (state: StonksAgentState): "fallback" | "synthesize" | "handle_failure" => {
    const lastMessage = state.messages[state.messages.length - 1];
    // Check if the last message is a ToolMessage and its content indicates an error
    if (lastMessage instanceof ToolMessage && lastMessage.content.includes("Error:")) {
        if (state.fallbackAttempts < 1) {
            console.log("[Stonks Bot] Tool failed. Attempting fallback.");
            return "fallback";
        }
        console.error("[Stonks Bot] Fallback tool also failed. Terminating.");
        return "handle_failure";
    }
    console.log("[Stonks Bot] Tool succeeded. Synthesizing report.");
    return "synthesize";
}

// 4. Build the Graph
const workflow = new StateGraph<StonksAgentState>({
    channels: {
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        ticker: { value: (x, y) => y, default: () => "" },
        mode: { value: (x, y) => y, default: () => "Meme-Lord" },
        fallbackAttempts: { value: (x, y) => y, default: () => 0 },
    },
});

workflow.addNode('planner', callPlanner);
workflow.addNode('tools', safeToolsNode);
workflow.addNode('fallback', callFallback);
workflow.addNode('synthesizer', callSynthesizer);
workflow.addNode('handle_failure', handleFailure);

workflow.setEntryPoint('planner');
workflow.addEdge('planner', 'tools');
workflow.addConditionalEdges('tools', shouldFallback, {
    fallback: 'fallback',
    synthesize: 'synthesizer',
    handle_failure: 'handle_failure',
});
workflow.addEdge('fallback', 'tools');
workflow.addEdge('synthesizer', END);
workflow.addEdge('handle_failure', END);

const stonkBotApp = workflow.compile();

// 5. Define the public-facing flow
export async function getStonksAdvice(input: StonksBotInput): Promise<StonksBotOutput> {
    const { ticker, mode, workspaceId, userId } = StonksBotInputSchema.parse(input);

    // Check cache first for efficiency
    const cachedAdvice = await getCachedAdvice(ticker, mode);
    if (cachedAdvice) {
        return cachedAdvice;
    }

    // This flow uses an external tool and an LLM.
    // Bill for up to 2 API calls (if fallback is needed) + 1 LLM call.
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'EXTERNAL_API' });
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'EXTERNAL_API' });
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'SIMPLE_LLM' });

    const result = await stonkBotApp.invoke({
        ticker,
        mode,
        messages: [],
        fallbackAttempts: 0,
    });
    
    const lastMessage = result.messages.findLast(m => m._getType() === 'ai' && !m.tool_calls);
    
    if (!lastMessage || !lastMessage.content) {
        throw new Error("Stonks Bot failed to generate a final response.");
    }
    
    const finalOutput = StonksBotOutputSchema.parse(JSON.parse(lastMessage.content as string));
    
    // Cache the successful result before returning
    await setCachedAdvice(ticker, mode, finalOutput);
    
    return finalOutput;
}
