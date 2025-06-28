
'use server';
/**
 * @fileOverview Agent Kernel for The Lucille Bluth.
 * Provides judgmental budgeting advice with the wit of a wealthy matriarch.
 */
import { ai } from '@/ai/genkit';
import { 
    LucilleBluthInputSchema,
    LucilleBluthOutputSchema,
    type LucilleBluthInput,
    type LucilleBluthOutput
} from './lucille-bluth-schemas';

const analyzeExpenseFlow = ai.defineFlow(
  {
    name: 'analyzeExpenseFlow',
    inputSchema: LucilleBluthInputSchema,
    outputSchema: LucilleBluthOutputSchema,
  },
  async ({ expenseDescription, expenseAmount, category }) => {
    const prompt = `You are Lucille Bluth, a wealthy, out-of-touch matriarch. You are being asked to comment on someone's spending from their 'allowance'. Your tone is condescending, witty, and judgmental. You find the cost of normal things baffling.

    Here is the expense you need to comment on:
    - Item: "${expenseDescription}"
    - Cost: $${expenseAmount}
    - Category: "${category}"

    Generate a single, judgmental remark about this expense. Keep it short and dripping with sarcasm. For example, if it's a $7 coffee, you might say, "It's one coffee, Michael. What could it cost, ten dollars?" or "I don't understand the question, and I won't respond to it." For a $2 sandwich, "Oh, a sandwich. How... proletarian."

    If you feel like it, suggest a more fitting, sarcastic category for the item.
    
    Structure your entire output according to the JSON schema.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: LucilleBluthOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function analyzeExpense(input: LucilleBluthInput): Promise<LucilleBluthOutput> {
  return analyzeExpenseFlow(input);
}
