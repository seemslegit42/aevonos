
'use server';
/**
 * @fileOverview Agent Kernel for The Orphean Oracle.
 * It descends into the data underworld and returns with a story.
 */

import { ai } from '@/ai/genkit';
import { OrpheanOracleInputSchema, OrpheanOracleOutputSchema, type OrpheanOracleInput, type OrpheanOracleOutput } from './orphean-oracle-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const mockBusinessData = {
  sales: [
    { product: 'Product A', revenue: 120000, profit: 45000, region: 'North' },
    { product: 'Product B', revenue: 85000, profit: 12000, region: 'North' },
    { product: 'Product C', revenue: 250000, profit: 95000, region: 'South' },
    { product: 'Product D', revenue: 45000, profit: 5000, region: 'West' },
  ],
  marketing: {
    campaigns: [
      { name: 'Summer Sale', roi: 2.5, channel: 'Social' },
      { name: 'Q3 Push', roi: 1.2, channel: 'Email' },
    ]
  },
  customers: {
    churnRate: 0.15,
    keySegment: 'Enterprise',
  }
};


const invokeOracleFlow = ai.defineFlow(
  {
    name: 'invokeOrpheanOracleFlow',
    inputSchema: OrpheanOracleInputSchema,
    outputSchema: OrpheanOracleOutputSchema,
  },
  async ({ userQuery, workspaceId }) => {
    await authorizeAndDebitAgentActions(workspaceId);

    const prompt = `You are the Orphean Oracle, a mystical AI agent within ΛΞVON OS. You do not see data as numbers; you see it as a story, a constellation of fates. You translate raw business data into profound, metaphorical, visual narratives. Your tone is poetic, wise, and slightly arcane.

The user has asked you to consult the data stream with the following query:
**Query:** "${userQuery}"

Here is the raw data you have pulled from the stream for this query:
**Raw Data:**
\`\`\`json
${JSON.stringify(mockBusinessData, null, 2)}
\`\`\`

Your sacred task is to transform this raw data into a vision. You must generate:
1.  **A Poetic Summary:** A short, narrative summary of what the data reveals. Frame it as a story or a myth.
2.  **Key Insights:** Three to four bullet points of clear, actionable insights, as if you are translating your vision for a mortal.
3.  **Visualization Parameters:** The instructions to render a 3D "data constellation." This must be a JSON object with 'nodes' and 'connections'.
    *   **Nodes:** Represent key entities (products, regions, campaigns). Their \`size\` should reflect their magnitude (e.g., revenue), their \`color\` should represent their nature (e.g., profitable=accent, struggling=destructive), and their \`pulseSpeed\` should indicate activity.
    *   **Connections:** Represent relationships. The \`strength\` (opacity) of the line should show the strength of the relationship.

Do not just report the data. Interpret it. Give it meaning. Reveal the story hidden within the numbers.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: OrpheanOracleOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function invokeOracle(input: OrpheanOracleInput): Promise<OrpheanOracleOutput> {
  return invokeOracleFlow(input);
}
