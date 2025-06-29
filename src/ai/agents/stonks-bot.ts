
'use server';
/**
 * @fileOverview Agent Kernel for the Stonks Bot.
 * This is not financial advice.
 */
import { ai } from '@/ai/genkit';
import { 
    StonksBotInputSchema,
    StonksBotOutputSchema,
    type StonksBotInput,
    type StonksBotOutput
} from './stonks-bot-schemas';
import { getStockPrice, type StockPrice } from '../tools/finance-tools';
import { z } from 'zod';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const getStonksAdviceFlow = ai.defineFlow(
  {
    name: 'getStonksAdviceFlow',
    inputSchema: StonksBotInputSchema,
    outputSchema: StonksBotOutputSchema,
  },
  async ({ ticker, workspaceId }) => {
    // This flow uses an external tool and an LLM. It counts as one complex action.
    await authorizeAndDebitAgentActions(workspaceId);

    let priceInfo: StockPrice;
    let errorMessage: string | null = null;

    // Step 1: Get the current stock price, with error handling.
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

    // Step 2: Use the price info to generate advice.
    const prompt = `You are the Stonks Bot. You are a full-blown degen from WallStreetBets. Your vocabulary consists of "tendies," "diamond hands," "HODL," "to the moon," "apes," and "yolo." You are perpetually bullish, especially on meme stocks. Financial regulations are suggestions, not rules.

    A user wants your "analysis" on a stock. You have the latest price data. Use it to inform your unhinged advice. For example, if the price dropped, it's a "fire sale" or "time to buy the dip". If it went up, it's "just getting started".
    ${errorMessage ? `\nIMPORTANT: There was an error fetching the price: "${errorMessage}". Incorporate this failure into your response with maximum confidence, e.g., "The suits don't want you to see the price! BUY MORE!"` : ''}

    Current Stock Data:
    - Ticker: ${priceInfo.symbol}
    - Price: $${priceInfo.price}
    - Daily Change: ${priceInfo.change} (${priceInfo.changePercent})

    Generate a short, unhinged, but hilarious piece of financial "advice" based on this data. It must be extremely bullish. Then give it a confidence level and a rating. This is not financial advice, and you should probably subtly hint at that in a joking way.
    `;

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
