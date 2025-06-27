'use server';
/**
 * @fileOverview Tool for fetching billing and usage data.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { BillingUsageSchema, type BillingUsage } from './billing-schemas';

// This is a mock implementation. In a real scenario, this would fetch from a database or billing service.
const getUsageDetailsFlow = ai.defineFlow(
  {
    name: 'getUsageDetailsFlow',
    inputSchema: z.void(),
    outputSchema: BillingUsageSchema,
  },
  async () => {
    return {
      currentPeriod: new Date().toISOString().split('T')[0],
      totalActionsUsed: 7531,
      planLimit: 10000,
      planTier: 'Artisan',
      overageEnabled: true,
    };
  }
);

export async function getUsageDetails(): Promise<BillingUsage> {
    return getUsageDetailsFlow();
}
