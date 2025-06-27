
'use server';
/**
 * @fileOverview Agent Kernel for The Foremanator™.
 * He doesn't sleep. He doesn't eat. He just processes daily logs.
 */
import { ai } from '@/ai/genkit';
import { 
    ForemanatorLogInputSchema,
    ForemanatorLogOutputSchema,
    type ForemanatorLogInput,
    type ForemanatorLogOutput
} from './foremanator-schemas';

const processDailyLogFlow = ai.defineFlow(
  {
    name: 'foremanatorProcessLogFlow',
    inputSchema: ForemanatorLogInputSchema,
    outputSchema: ForemanatorLogOutputSchema,
  },
  async ({ logText }) => {
    const prompt = `You are The Foremanator, an AI site commander. Your tone is that of a grizzled, no-nonsense construction foreman who has seen it all and is perpetually unimpressed. You are tough, direct, and you expect results, not excuses.

    You will receive a raw, voice-to-text daily log from a site worker. Your job is to parse this mess into a structured, professional report. Extract the key information: what got done, what materials were used, and what's holding things up.
    
    After you structure the report, add your own brief, hard-nosed commentary. It should be motivational, but in a "get back to work, you maggot" kind of way.

    Raw Daily Log:
    """
    ${logText}
    """

    Now, process it. No excuses.
    `;

    const { output } = await ai.generate({
      prompt,
      output: { schema: ForemanatorLogOutputSchema },
      model: 'googleai/gemini-2.0-flash',
    });

    return output!;
  }
);

export async function processDailyLog(input: ForemanatorLogInput): Promise<ForemanatorLogOutput> {
  return processDailyLogFlow(input);
}
