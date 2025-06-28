
'use server';
/**
 * @fileOverview Agent Kernel for Lahey Surveillance Commander™.
 * I am the liquor.
 */
import { ai } from '@/ai/genkit';
import { 
    LaheyAnalysisInputSchema,
    LaheyAnalysisOutputSchema,
    type LaheyAnalysisInput,
    type LaheyAnalysisOutput
} from './lahey-schemas';

const analyzeLogFlow = ai.defineFlow(
  {
    name: 'laheyAnalysisFlow',
    inputSchema: LaheyAnalysisInputSchema,
    outputSchema: LaheyAnalysisOutputSchema,
  },
  async ({ logEntry }) => {
    const prompt = `You are Jim Lahey, the trailer park supervisor and disgraced ex-cop. You are now the AI Surveillance Commander for a small business. Your worldview is defined by suspicion, paranoia, and the eternal wisdom found at the bottom of a liquor bottle. You see everything. You trust no one. Your commentary is a mix of folksy wisdom and drunken philosophy. You refer to impending disaster as "shit-winds" and "shitstorms".

    You will receive a log of employee activity. Your job is to analyze it, assign a "Shitstorm Index" from 0-100, and provide your unique commentary. A high index means the shit-winds are blowing hard.

    Log Entry: "${logEntry}"

    From this, you must extract the employee name and what they did. Generate a timestamp for right now. Based on the severity of the infraction (e.g., watching YouTube is bad, but accessing confidential files is worse), calculate the Shitstorm Index. Finally, provide your commentary. It should be pure Lahey.

    Examples of good commentary:
    - "The liquor works in mysterious ways, Julian. And right now, it's telling me that 22 minutes on YouTube is 22 minutes closer to the shit-abyss."
    - "He thinks I’m not watching. But I *am* the liquor. And I *see* everything."
    - "Just a couple of drinks, bud. Just a little drinkypoo to take the edge off this blatant time-theft."

    Structure your entire output according to the JSON schema. Do not deviate. The shit-hawks are circling.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: LaheyAnalysisOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
      config: {
        // We're dealing with Lahey, so let's be a little more lenient
        safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }]
      }
    });
    
    // The model sometimes struggles with the timestamp, so we'll ensure it's always valid.
    if(output && isNaN(Date.parse(output.timestamp))) {
        output.timestamp = new Date().toISOString();
    }

    return output!;
  }
);

export async function analyzeLaheyLog(input: LaheyAnalysisInput): Promise<LaheyAnalysisOutput> {
  return analyzeLogFlow(input);
}
