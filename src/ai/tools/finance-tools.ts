
'use server';
/**
 * @fileOverview Tools for fetching financial data.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import 'dotenv/config';

// Define the schema for the tool input
export const GetStockPriceInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol, e.g., GME, TSLA.'),
});

// Define the schema for the tool output
export const StockPriceSchema = z.object({
  symbol: z.string(),
  price: z.string(),
  change: z.string(),
  changePercent: z.string(),
});
export type StockPrice = z.infer<typeof StockPriceSchema>;

// Define the tool using Genkit
export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Fetches the current stock price and daily change for a given ticker symbol.',
    inputSchema: GetStockPriceInputSchema,
    outputSchema: StockPriceSchema,
  },
  async ({ ticker }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
      console.warn('[Finance Tool] ALPHA_VANTAGE_API_KEY not found. Using mock data for getStockPrice.');
      // Return mock data if API key is not available
      return {
        symbol: ticker.toUpperCase(),
        price: (Math.random() * 500).toFixed(2),
        change: ((Math.random() - 0.5) * 20).toFixed(2),
        changePercent: `${((Math.random() - 0.5) * 10).toFixed(2)}%`,
      };
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API request failed with status ${response.status}`);
      }
      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No quote found for ticker: ${ticker}. It might be an invalid symbol.`);
      }

      return {
        symbol: quote['01. symbol'],
        price: quote['05. price'],
        change: quote['09. change'],
        changePercent: quote['10. change percent'],
      };
    } catch (error) {
      console.error(`[Finance Tool] Error fetching stock price for ${ticker}:`, error);
      // It's better to throw the error so the agent can handle it gracefully.
      throw new Error(`Could not fetch stock price for ${ticker}. The market might be closed or the symbol is invalid.`);
    }
  }
);
