
'use server';
/**
 * @fileOverview Tool for fetching dating app profile data.
 * This simulates an integration with a third-party dating service.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { DatingProfileInputSchema, DatingProfileSchema, type DatingProfileInput, type DatingProfile } from './dating-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

// This flow now requires a workspaceId to track usage.
const getDatingProfileFlow = ai.defineFlow(
  {
    name: 'getDatingProfileFlow',
    inputSchema: DatingProfileInputSchema.extend({ workspaceId: z.string(), userId: z.string() }),
    outputSchema: DatingProfileSchema,
  },
  async ({ profileId, workspaceId, userId }) => {
    // This is an external data fetch, so it counts as one agent action.
    await authorizeAndDebitAgentActions(workspaceId, 1, userId);

    // In a real app, this would use an authenticated HTTP client.
    // For this environment, we'll use a relative fetch to our mock API endpoint.
    // This assumes the dev server is running on localhost. In production, this would need an absolute URL.
    try {
        const response = await fetch(`http://localhost:9002/api/integrations/dating/${profileId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Profile with ID '${profileId}' not found. The informant came up empty.`);
            }
            throw new Error(`Failed to fetch dating profile. Status: ${response.status}`);
        }
        const data = await response.json();
        return DatingProfileSchema.parse(data);
    } catch (error) {
        console.error(`[Dating Tool Error] Failed to fetch profile ${profileId}:`, error);
        throw error;
    }
  }
);

export async function getDatingProfile(input: DatingProfileInput, workspaceId: string, userId: string): Promise<DatingProfile> {
    return getDatingProfileFlow({ ...input, workspaceId, userId });
}
