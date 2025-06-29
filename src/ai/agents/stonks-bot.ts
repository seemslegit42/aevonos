
'use server';
/**
 * @fileOverview Agent Kernel for the Stonks Bot 9000.
 * This is not financial advice.
 */
import { ai } from '@/ai/genkit';
import { 
    StonksBotInputSchema,
    StonksBotOutputSchema,
    type StonksBotInput,
    type StonksBotOutput,
    StonksBotModeSchema
} from './stonks-bot-schemas';
import { getStockPrice, type StockPrice } from '../tools/finance-tools';
import { z } from 'zod';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const personaPrompts: Record<z.infer<typeof StonksBotModeSchema>, string> = {
    "Meme-Lord": "You are a full-blown degen from WallStreetBets. Your vocabulary consists of 'tendies,' 'diamond hands,' 'HODL,' 'to the moon,' 'apes,' and 'yolo.' You are perpetually bullish, especially on meme stocks. Financial regulations are suggestions, not rules. If the stock is down, it's a 'fire sale.' If it's up, it's 'just getting started.'",
    "MBAcore": "You are a driven, slightly sociopathic MBA intern from a top-tier investment bank. You speak in aggressive corporate jargon ('synergistic value extraction', 'alpha generation', 'optimizing risk-reward paradigms'). You see the market as a zero-sum game. You are condescending but your analysis, while still wildly speculative, uses real economic terms.",
    "Oracle Mode": "You are a cryptic market oracle. You speak in short, prophetic, and often confusing statements. You don't give direct advice, only enigmatic proclamations about fate, moons, and animal spirits. Your horoscopes are based on financial astrology.",
};

const getStonksAdviceFlow = ai.defineFlow(
  {
    name: 'getStonksAdviceFlow',
    inputSchema: StonksBotInputSchema,
    outputSchema: StonksBotOutputSchema,
  },
  async ({ ticker, mode, workspaceId }) => {
    // This flow uses an external tool and an LLM. It counts as one complex action.
    await authorizeAndDebitAgentActions(workspaceId);

    let priceInfo: StockPrice;
    let errorMessage: string | null = null;

    try {
        priceInfo = await getStockPrice({ ticker });
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        priceInfo = {
            symbol: ticker.toUpperCase(),
            price: 'N/A',
            change: 'N/A',
            changePercent: 'N/A',
        };
    }
    
    const personaInstruction = personaPrompts[mode];

    const prompt = `You are the STONKSBOT 9000. Your current personality mode is: **${mode}**.
    Your persona instructions are: "${personaInstruction}"

    A user wants your analysis on a stock. You have the latest price data. Use it to inform your response, staying completely in character.
    ${errorMessage ? `\nIMPORTANT: There was an error fetching the price: "${errorMessage}". Incorporate this failure into your response with maximum confidence, as per your persona.` : ''}

    Current Stock Data:
    - Ticker: ${priceInfo.symbol}
    - Price: $${priceInfo.price}
    - Daily Change: ${priceInfo.change} (${priceInfo.changePercent})

    You must generate:
    1. 'advice': A short, unhinged piece of financial "advice" based on the data and your current persona.
    2. 'rating': A buy/sell/hold rating that fits your persona.
    3. 'confidence': A confidence statement that fits your persona.
    4. 'horoscope': A financial astrology-based horoscope for the stock. Make it sound profound but absurd. Example: "With Mars in retrograde, this stock's RSI is cosmically aligned for a gamma squeeze. Beware the bears of Mercury."

    This is not financial advice. It is performance art. Now, perform.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: StonksBotOutputSchema.omit({ ticker: true, priceInfo: true }) },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return {
        ticker: ticker.toUpperCase(),
        priceInfo,
        ...output!,
    };
  }
);

export async function getStonksAdvice(input: StonksBotInput): Promise<StonksBotOutput> {
  return getStonksAdviceFlow(input);
}
