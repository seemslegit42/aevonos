import { z } from 'zod';

export const OsintInputSchema = z.object({
  targetName: z.string().describe('The full name of the individual to investigate.'),
  context: z.string().optional().describe('Any additional context about the target, e.g., email, known associates, last known location.'),
});
export type OsintInput = z.infer<typeof OsintInputSchema>;

export const SocialProfileSchema = z.object({
    platform: z.enum(['LinkedIn', 'X', 'Instagram', 'Facebook', 'Venmo']),
    username: z.string(),
    url: z.string().url(),
    recentActivity: z.string().describe('A summary of recent public activity.'),
    privacyLevel: z.enum(['Public', 'Private', 'Suspiciously Private']),
});

export const OsintOutputSchema = z.object({
  summary: z.string().describe('A top-level intelligence summary of the findings.'),
  riskFactors: z.array(z.string()).describe('A list of specific OSINT-derived risk factors.'),
  socialProfiles: z.array(SocialProfileSchema).describe('A list of discovered social media profiles.'),
  publicRecords: z.array(z.string()).describe('A summary of findings from public records searches.'),
  digitalFootprint: z.object({
      overallVisibility: z.enum(['Low', 'Medium', 'High', 'Ghost']),
      keyObservations: z.array(z.string()),
  }),
});
export type OsintOutput = z.infer<typeof OsintOutputSchema>;
