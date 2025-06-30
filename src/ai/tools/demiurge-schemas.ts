
import { z } from 'zod';

export const SystemStatusSchema = z.object({
  systemLoad: z.number().describe('Current system load percentage.'),
  activeAgents: z.number().int().describe('Number of currently active agents.'),
  laggingDaemons: z.array(z.string()).describe('A list of any agent types experiencing high latency.'),
});

export const FindUsersByVowInputSchema = z.object({
  vowKeyword: z.string().describe("The keyword to search for within users' founding vows or sacrifices."),
});

export const FoundUserSchema = z.object({
    id: z.string(),
    email: z.string(),
    foundingVow: z.string().nullable(),
});
export const FindUsersByVowOutputSchema = z.array(FoundUserSchema);

export const ManageSyndicateInputSchema = z.object({
  syndicateName: z.string().describe("The name of the Covenant, Syndicate, or user group to manage."),
  action: z.enum(['revoke_access', 'grant_boon', 'send_whisper']).describe("The administrative action to perform."),
  details: z.string().optional().describe("Additional details for the action, e.g., the boon amount or whisper message."),
});

export const ManageSyndicateOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().describe("A confirmation message detailing the action taken."),
});
