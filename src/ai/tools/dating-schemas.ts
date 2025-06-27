import { z } from 'zod';

export const DatingProfileInputSchema = z.object({
  profileId: z.string().describe('The unique identifier of the dating profile to fetch.'),
});
export type DatingProfileInput = z.infer<typeof DatingProfileInputSchema>;

export const DatingProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    age: z.number(),
    bio: z.string(),
    interests: z.array(z.string()),
    promptResponses: z.array(z.object({
        prompt: z.string(),
        response: z.string(),
    })),
});
export type DatingProfile = z.infer<typeof DatingProfileSchema>;
