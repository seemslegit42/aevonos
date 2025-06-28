import { z } from 'zod';
import { StockPriceSchema } from '../tools/finance-tools';

export const StonksBotInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol, e.g., GME, AMC, TSLA.'),
});
export type StonksBotInput = z.infer<typeof StonksBotInputSchema>;

export const StonksBotOutputSchema = z.object({
  ticker: z.string(),
  priceInfo: StockPriceSchema.describe("The current price information for the stock."),
  advice: z.string().describe('The unhinged, extremely bullish, and financially irresponsible advice from the Stonks Bot.'),
  confidence: z.enum(['To the moon!', 'Diamond hands!', 'Ape strong together!']).describe("The bot's confidence level."),
  rating: z.enum(['HODL', 'BUY THE DIP', 'ALL IN']).describe('The official buy/sell/hold rating.'),
});
export type StonksBotOutput = z.infer<typeof StonksBotOutputSchema>;
