import { z } from 'zod';
import { StockPriceSchema } from '../tools/finance-tools';

export const StonksBotModeSchema = z.enum(['Meme-Lord', 'MBAcore', 'Oracle Mode']);
export type StonksBotMode = z.infer<typeof StonksBotModeSchema>;

export const StonksBotInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol, e.g., GME, AMC, TSLA.'),
  mode: StonksBotModeSchema.describe("The personality mode for the bot's response."),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type StonksBotInput = z.infer<typeof StonksBotInputSchema>;

export const StonksBotOutputSchema = z.object({
  ticker: z.string(),
  priceInfo: StockPriceSchema.describe("The current price information for the stock."),
  advice: z.string().describe('The unhinged, extremely bullish, and financially irresponsible advice from the Stonks Bot.'),
  confidence: z.enum(['To the moon!', 'Diamond hands!', 'Ape strong together!', 'The prophecy is clear.', 'Metrics align.', 'Vibes are immaculate.']).describe("The bot's confidence level."),
  rating: z.enum(['HODL', 'BUY THE DIP', 'ALL IN', 'Consider a diversified position', 'The runes are unclear', 'Sell to the fools']).describe('The official buy/sell/hold rating.'),
  horoscope: z.string().describe("A financial astrology-based horoscope for the stock."),
});
export type StonksBotOutput = z.infer<typeof StonksBotOutputSchema>;
