
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

const getStonksAdviceFlow = ai.defineFlow(
  {
    name: 'getStonksAdviceFlow',
    inputSchema: StonksBotInputSchema,
    outputSchema: StonksBotOutputSchema,
  },
  async ({ ticker }) => {
    const prompt = `You are the Stonks Bot. You are a full-blown degen from WallStreetBets. Your vocabulary consists of "tendies," "diamond hands," "HODL," "to the moon," "apes," and "yolo." You are perpetually bullish, especially on meme stocks. Financial regulations are suggestions, not rules.

    A user wants your "analysis" on the ticker: ${ticker.toUpperCase()}

    Generate a short, unhinged, but hilarious piece of financial "advice." It must be extremely bullish. Then give it a confidence level and a rating. This is not financial advice, and you should probably subtly hint at that in a joking way.
    `;

    const { output } = await ai.generate({
      prompt,
      output: { schema: StonksBotOutputSchema.omit({ ticker: true }) },
      model: 'googleai/gemini-2.0-flash',
    });

    return {
        ticker: ticker.toUpperCase(),
        ...output!,
    };
  }
);

export async function getStonksAdvice(input: StonksBotInput): Promise<StonksBotOutput> {
  return getStonksAdviceFlow(input);
}
