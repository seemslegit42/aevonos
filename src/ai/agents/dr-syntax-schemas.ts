import {z} from 'zod';

export const DrSyntaxInputSchema = z.object({
  content: z
    .string()
    .describe('The content (prompt, code, or copy) to be critiqued.'),
  contentType: z
    .enum(['prompt', 'code', 'copy'])
    .describe('The type of content being submitted.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type DrSyntaxInput = z.infer<typeof DrSyntaxInputSchema>;

export const DrSyntaxOutputSchema = z.object({
  critique: z
    .string()
    .describe(
      'A sarcastic and aggressive, yet effective, critique of the content.'
    ),
  suggestion: z
    .string()
    .describe('A suggested improvement for the content, if applicable.'),
  rating: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'A rating from 1 to 10 on the quality of the content, 1 being abysmal.'
    ),
});
export type DrSyntaxOutput = z.infer<typeof DrSyntaxOutputSchema>;
