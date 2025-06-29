
import { z } from 'zod';

export const LucilleBluthInputSchema = z.object({
  expenseDescription: z.string().describe('The description of the expense, e.g., "Latte" or "Taco Tuesday".'),
  expenseAmount: z.number().describe('The amount of the expense.'),
  category: z.string().describe('The spending category, e.g., "Coffee", "Takeout".'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type LucilleBluthInput = z.infer<typeof LucilleBluthInputSchema>;

export const LucilleBluthOutputSchema = z.object({
  judgmentalRemark: z.string().describe("Lucille's witty, judgmental, and condescending remark about the expense."),
  categorization: z.string().describe("Lucille's suggested categorization, usually with a sarcastic flair, e.g., 'Frivolous Beverages'.").optional(),
});
export type LucilleBluthOutput = z.infer<typeof LucilleBluthOutputSchema>;
