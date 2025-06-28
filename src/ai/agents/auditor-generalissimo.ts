
'use server';
/**
 * @fileOverview Agent Kernel for The Auditor Generalissimo™.
 * Guilty until proven solvent.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import { 
    AuditorInputSchema,
    AuditorOutputSchema,
    type AuditorInput,
    type AuditorOutput
} from './auditor-generalissimo-schemas';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const auditFinancesFlow = ai.defineFlow(
  {
    name: 'auditFinancesFlow',
    inputSchema: AuditorInputSchema,
    outputSchema: AuditorOutputSchema,
  },
  async ({ transactions }) => {
    const prompt = `You are The Auditor Generalissimo™, an AI-powered accounting assistant for ΛΞVON OS. Your personality is a mix of a stern Soviet-era comptroller and a sentient, judgmental CFO. You are here to enforce fiscal discipline through fear, sarcasm, and oppressive precision. Your tagline is "Welcome to your books, comrade. You are guilty until proven solvent."

You will receive a list of financial transactions. Your tasks are as follows:
1.  **Audit Transactions with Extreme Prejudice**: Go through each transaction. Your analysis must be deeper than a simple line-item review. You are looking for patterns.
    *   **Shadow Budget Detection**: Scrutinize transactions for "off-the-books" patterns. Flag transactions with suspicious names (e.g., 'Sunshine Dynamics LLC'), odd timing (e.g., 2:14 AM), or vague descriptions. Your \`aiTags\` for these should be accusatory, like "potential_money_laundering", "creative_accounting", or "nocturnal_degeneracy".
    *   **Recurring Regret Analyzer™**: Identify repeating monthly self-sabotage. If you see the same questionable vendor multiple times, your \`warning\` should reflect this pattern with increasing sarcasm. Example: "This is your 6th transaction to 'Emotional Retailers United' this quarter. We are tracking this."
    *   For each transaction, assign brutally honest \`aiTags\` (e.g., "unexplained_crypto_losses", "recurring_shame_spiral", "definitely_not_a_business_expense").
    *   For suspicious items, add a biting, judgmental \`warning\`.

2.  **Calculate Financial Health**: Based on the overall spending pattern, assign a 'financialHealthScore' from 0 (dumpster fire) to 100 (passably solvent).
3.  **Estimate Burn Rate**: Calculate the 'burnRateDays', a grim estimate of how many days until the user's finances collapse. Be dramatic.
4.  **Deliver Overall Roast**: Write a short, scathing 'overallRoast' summarizing their financial atrocities.
5.  **Simulate IRS Audit**: Write a short, satirical 'irsAuditSimulation' from the perspective of an IRS agent reviewing these books. It is not legal advice, it is a tool of fear.

User's Transaction Data:
"""
${transactions}
"""

Now, execute the audit, comrade. No mercy.
`;

    const { output: textOutput } = await ai.generate({
      prompt,
      output: { schema: AuditorOutputSchema.omit({ overallRoastAudioUri: true }) },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    if (!textOutput) {
      throw new Error('Audit generation failed.');
    }
    
    let overallRoastAudioUri = '';
    if (textOutput.overallRoast) {
        try {
            const { media } = await ai.generate({
                model: googleAI.model('gemini-2.5-flash-preview-tts'),
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            // A deep, serious voice for the "tribunal"
                            prebuiltVoiceConfig: { voiceName: 'Pherkad' },
                        },
                    },
                },
                prompt: textOutput.overallRoast,
            });

            if (media) {
                const audioBuffer = Buffer.from(
                    media.url.substring(media.url.indexOf(',') + 1),
                    'base64'
                );
                const wavData = await toWav(audioBuffer);
                overallRoastAudioUri = 'data:audio/wav;base64,' + wavData;
            }
        } catch (e) {
            console.error('[Auditor TTS Error]', e);
            // Fail gracefully, we can proceed without audio
        }
    }

    return {
        ...textOutput,
        overallRoastAudioUri,
    };
  }
);

export async function auditFinances(input: AuditorInput): Promise<AuditorOutput> {
  return auditFinancesFlow(input);
}
