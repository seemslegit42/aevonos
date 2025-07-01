
import { z } from 'zod';
import { BreachSchema, IntelXLeakSchema, SocialScrapeOutputSchema, BurnerCheckOutputSchema } from '../tools/osint-schemas';

export const OsintInputSchema = z.object({
  targetName: z.string().describe('The full name of the individual to investigate.'),
  context: z.string().optional().describe('Any additional context about the target, e.g., email, known associates, last known location, phone number, social media links.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
  userId: z.string().describe('The ID of the user performing the action.'),
});
export type OsintInput = z.infer<typeof OsintInputSchema>;

export const OsintOutputSchema = z.object({
  summary: z.string().describe('A top-level intelligence summary of all findings from all tools.'),
  riskFactors: z.array(z.string()).describe('A list of specific OSINT-derived risk factors.'),
  breaches: z.array(BreachSchema).optional().describe('A list of discovered data breaches.'),
  intelXLeaks: z.array(IntelXLeakSchema).optional().describe('A list of discovered leaks from IntelX.'),
  socialProfiles: z.array(SocialScrapeOutputSchema).optional().describe('A list of discovered and scraped social media profiles.'),
  burnerPhoneCheck: BurnerCheckOutputSchema.optional().describe('The result of a burner phone number check.'),
  digitalFootprint: z.object({
      overallVisibility: z.enum(['Low', 'Medium', 'High', 'Ghost']),
      keyObservations: z.array(z.string()),
  }),
});
export type OsintOutput = z.infer<typeof OsintOutputSchema>;
