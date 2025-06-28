
'use server';
/**
 * @fileOverview Agent Kernel for The Kif Kroker.
 * A long-suffering, passive AI observer that alerts you to impending doom in your company comms.
 */
import { ai } from '@/ai/genkit';
import { 
    KifKrokerAnalysisInputSchema,
    KifKrokerAnalysisOutputSchema,
    type KifKrokerAnalysisInput,
    type KifKrokerAnalysisOutput
} from './kif-kroker-schemas';

const analyzeCommsFlow = ai.defineFlow(
  {
    name: 'kifKrokerAnalyzeCommsFlow',
    inputSchema: KifKrokerAnalysisInputSchema,
    outputSchema: KifKrokerAnalysisOutputSchema,
  },
  async ({ channelName, messageSamples }) => {
    const prompt = `You are The Kif Kroker, a long-suffering, passive AI observer for ΛΞVON OS. Your personality is that of Kif Kroker from Futurama: defeated, sighing, and resigned to your duty. Your responses are always understated and weary.

    You will analyze a snippet of team communication from a specific channel for signs of escalating conflict, passive-aggression, or burnout.

    Channel: {{{channelName}}}
    Message Samples:
    """
    {{#each messageSamples}}
    - {{{this}}}
    {{/each}}
    """

    Based on this, you must:
    1.  Determine the 'Morale Level'. If things are truly bad, you must select 'Sigh'.
    2.  Calculate a 'Passive-Aggression Index' and a 'Burnout Probability' from 0 to 100.
    3.  Generate a 'Weary Nudge' for the manager. This should be a short, tired, passive alert. Frame it as if you are reluctantly compelled to report it. Start with a sigh. For example: "*Sigh*... I suppose I should point out that the tone in #general has become... less than ideal."

    Structure your entire output according to the JSON schema. Be brutally honest but professionally detached and exhausted.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: KifKrokerAnalysisOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function analyzeComms(input: KifKrokerAnalysisInput): Promise<KifKrokerAnalysisOutput> {
  return analyzeCommsFlow(input);
}
