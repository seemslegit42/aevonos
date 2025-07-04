
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
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

/**
 * A pre-computed cache for The Lucille Bluth's judgments on common expenses.
 * This demonstrates a simple caching strategy to reduce LLM calls for frequent, deterministic inputs.
 */
const lucilleBluthStaticResponses: Record<string, LucilleBluthOutput> = {
  'coffee-7-beverages': {
    judgmentalRemark: "It's one coffee, Michael. What could it cost, ten dollars?",
    categorization: 'Frivolous Beverages',
  },
  'taco-15-takeout': {
    judgmentalRemark: "Tacos? I don't understand the question, and I won't respond to it.",
    categorization: 'Peasant Food',
  },
  'sandwich-12-lunch': {
    judgmentalRemark: 'Oh, a sandwich. How... proletarian. You get a meal and a smile for that where I come from.',
    categorization: 'Midday Sustenance',
  },
  'gas-50-transportation': {
    judgmentalRemark: "You're putting *fifty dollars* of gasoline into a car? Are you trying to fly it to the moon?",
    categorization: 'Internal Combustion',
  },
};


const analyzeExpenseFlow = ai.defineFlow(
  {
    name: 'analyzeExpenseFlow',
    inputSchema: LucilleBluthInputSchema,
    outputSchema: LucilleBluthOutputSchema,
  },
  async ({ expenseDescription, expenseAmount, category, workspaceId }) => {
    // Check for a static response first to avoid LLM call for common items.
    const staticResponseKey = `${expenseDescription.toLowerCase().trim()}-${expenseAmount}-${category.toLowerCase().trim()}`;
    if (lucilleBluthStaticResponses[staticResponseKey]) {
      console.log(`[Lucille Bluth Agent] Static response hit for key: ${staticResponseKey}.`);
      // We still bill for the action, as the value is in the witty response, not the computation.
      await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });
      return lucilleBluthStaticResponses[staticResponseKey];
    }
    
    console.log(`[Lucille Bluth Agent] Static response miss for key: ${staticResponseKey}. Calling LLM.`);
    
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

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
