
import { z } from 'zod';

export const FinancialSummarySchema = z.object({
  totalRevenue: z.number(),
  netProfit: z.number(),
  profitMargin: z.number(),
  majorExpenses: z.array(z.object({ category: z.string(), amount: z.number() })),
  topRevenueStreams: z.array(z.object({ source: z.string(), revenue: z.number() })),
});

export const VaultQueryInputSchema = z.object({
  query: z.string().describe("The user's natural language query about their finances."),
  workspaceId: z.string(),
  userId: z.string(),
});
export type VaultQueryInput = z.infer<typeof VaultQueryInputSchema>;

export const VaultAnalysisOutputSchema = z.object({
  summary: z.string().describe("A concise, insightful summary of the financial situation."),
  keyInsights: z.array(z.string()).describe("A list of 3-4 key, actionable insights or warnings."),
  profitLeakAnalysis: z.string().optional().describe("An analysis of potential profit leaks or inefficiencies."),
});
export type VaultAnalysisOutput = z.infer<typeof VaultAnalysisOutputSchema>;
