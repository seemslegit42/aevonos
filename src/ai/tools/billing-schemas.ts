import { z } from 'zod';

export const BillingUsageSchema = z.object({
  currentPeriod: z.string().describe("The current billing period, as a date string."),
  totalActionsUsed: z.number().describe("The total number of Agent Actions used in the current period."),
  planLimit: z.number().describe("The maximum number of Agent Actions included in the current plan."),
  planTier: z.string().describe("The name of the current plan tier."),
  overageEnabled: z.boolean().describe("Whether overage is enabled for the plan."),
});
export type BillingUsage = z.infer<typeof BillingUsageSchema>;
