
import { z } from 'zod';

export const LoggedEventCategorySchema = z.enum([
    'DRUG_DEALS',
    'FRIEND_BETRAYALS',
    'GIRLFRIEND_DRAMA',
    'CLASSIC_CHAOS',
    'REDEMPTION_ATTEMPTS'
]);
export type LoggedEventCategory = z.infer<typeof LoggedEventCategorySchema>;

export const LoggedEventSchema = z.object({
  id: z.string().cuid(),
  date: z.string().datetime(),
  category: LoggedEventCategorySchema,
  description: z.string(),
  martyrPoints: z.number().int(),
});
export type LoggedEvent = z.infer<typeof LoggedEventSchema>;

export const PatricktAgentInputSchema = z.object({
  action: z.enum(['LOG_EVENT', 'ANALYZE_DRAMA', 'GENERATE_ROAST']),
  eventDescription: z.string().optional().describe('Description of the event to log.'),
  eventCategory: LoggedEventCategorySchema.optional().describe('The category of the event to log.'),
  chatInput: z.string().optional().describe('Chat text to be analyzed for drama level.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
  userId: z.string().describe('The ID of the user performing the action.'),
});
export type PatricktAgentInput = z.infer<typeof PatricktAgentInputSchema>;

export const LogEventOutputSchema = z.object({
    action: z.literal('LOG_EVENT'),
    loggedEvent: LoggedEventSchema,
    confirmationMessage: z.string().describe('A confirmation message for the logged event.')
});

export const AnalyzeDramaOutputSchema = z.object({
    action: z.literal('ANALYZE_DRAMA'),
    dramaLevel: z.number().min(0).max(100).describe('A score from 0 (chill) to 100 (volatile).'),
    prediction: z.string().describe('A short prediction based on the drama level.'),
    notification: z.string().optional().describe('A push notification style warning if drama is high.')
});

export const GenerateRoastOutputSchema = z.object({
    action: z.literal('GENERATE_ROAST'),
    roast: z.string().describe('A savage, Patrickt-style quote.'),
});


export const PatricktAgentOutputSchema = z.discriminatedUnion('action', [
    LogEventOutputSchema,
    AnalyzeDramaOutputSchema,
    GenerateRoastOutputSchema,
]);
export type PatricktAgentOutput = z.infer<typeof PatricktAgentOutputSchema>;
