
'use server';
/**
 * @fileOverview Tools for fetching financial data.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import 'dotenv/config';
import { FinancialSummarySchema } from '../agents/vault-daemon-schemas';

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
  source: z.string().describe("The source of the data, e.g., 'Alpha Vantage' or 'Finnhub'"),
});
export type StockPrice = z.infer<typeof StockPriceSchema>;

// Define the tool using Genkit
export const getStockPriceAlphaVantage = ai.defineTool(
  {
    name: 'getStockPriceAlphaVantage',
    description: 'Fetches the current stock price from the Alpha Vantage API. This is the primary, preferred source.',
    inputSchema: GetStockPriceInputSchema,
    outputSchema: StockPriceSchema,
  },
  async ({ ticker }) => {
    // START MOCK LOGIC FOR RESILIENCE DEMO
    if (ticker.toUpperCase() === 'FAIL.V') {
        throw new Error('Alpha Vantage API unavailable: Rate limit exceeded.');
    }
    // END MOCK LOGIC
    
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
      console.warn('[Finance Tool] ALPHA_VANTAGE_API_KEY not found. Using mock data for getStockPrice.');
      // Return mock data if API key is not available
      return {
        symbol: ticker.toUpperCase(),
        price: (Math.random() * 500).toFixed(2),
        change: ((Math.random() - 0.5) * 20).toFixed(2),
        changePercent: `${((Math.random() - 0.5) * 10).toFixed(2)}%`,
        source: 'Alpha Vantage (Mock)',
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
        source: 'Alpha Vantage',
      };
    } catch (error) {
      console.error(`[Finance Tool] Error fetching stock price for ${ticker}:`, error);
      // It's better to throw the error so the agent can handle it gracefully.
      throw new Error(`Could not fetch stock price for ${ticker} from Alpha Vantage. The market might be closed or the symbol is invalid.`);
    }
  }
);

export const getStockPriceFinnhub = ai.defineTool(
  {
    name: 'getStockPriceFinnhub',
    description: 'Fetches the current stock price from the Finnhub API. Use this as a fallback if Alpha Vantage fails.',
    inputSchema: GetStockPriceInputSchema,
    outputSchema: StockPriceSchema,
  },
  async ({ ticker }) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
        console.warn('[Finance Tool] FINNHUB_API_KEY not found. Using mock data for Finnhub.');
        return {
            symbol: ticker.toUpperCase(),
            price: (Math.random() * 490 + 10).toFixed(2), // slightly different range
            change: ((Math.random() - 0.5) * 22).toFixed(2),
            changePercent: `${((Math.random() - 0.5) * 11).toFixed(2)}%`,
            source: 'Finnhub (Mock)',
        };
    }
    
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Finnhub API request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (data.c === 0) { // Finnhub returns 0 for invalid tickers
        throw new Error(`No quote found for ticker: ${ticker}. It might be an invalid symbol.`);
      }

      return {
        symbol: ticker.toUpperCase(),
        price: data.c.toFixed(2),
        change: data.d.toFixed(2),
        changePercent: `${data.dp.toFixed(2)}%`,
        source: 'Finnhub',
      };
    } catch (error) {
      console.error(`[Finance Tool] Error fetching stock price from Finnhub for ${ticker}:`, error);
      throw new Error(`Could not fetch stock price for ${ticker} from Finnhub. The market might be closed or the symbol is invalid.`);
    }
  }
);

export const getFinancialSummary = ai.defineTool(
  {
    name: 'getFinancialSummary',
    description: 'Retrieves a comprehensive financial summary for the workspace over the last quarter.',
    inputSchema: z.object({ workspaceId: z.string() }),
    outputSchema: FinancialSummarySchema,
  },
  async ({ workspaceId }) => {
    // In a real app, this would query a database or accounting software.
    // For now, return mock data.
    console.log(`[Finance Tool] Fetching financial summary for workspace ${workspaceId}`);
    return {
      totalRevenue: 157340.50,
      netProfit: 22890.75,
      profitMargin: 0.145,
      majorExpenses: [
        { category: 'SaaS Subscriptions', amount: 8500 },
        { category: 'Cloud Hosting', amount: 12000 },
        { category: 'Contractor Payouts', amount: 45000 },
      ],
      topRevenueStreams: [
        { source: 'Product A Subscriptions', revenue: 95000 },
        { source: 'Consulting Services', revenue: 45000 },
        { source: 'Support Contracts', revenue: 17340.50 },
      ]
    };
  }
);
