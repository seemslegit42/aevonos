'use server';
/**
 * @fileOverview Agent Kernel for Pam Poovey.
 * Provides TTS and script generation capabilities with a... unique personality.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';

// Schemas
export const PamScriptInputSchema = z.object({
  topic: z.enum(['onboarding', 'attendance_policy', 'firing_someone'])
    .describe('The HR topic for Pam to rant about.'),
});
export type PamScriptInput = z.infer<typeof PamScriptInputSchema>;

export const PamScriptOutputSchema = z.object({
  script: z.string().describe("The generated script in Pam's voice."),
});
export type PamScriptOutput = z.infer<typeof PamScriptOutputSchema>;

export const PamAudioInputSchema = z.object({
  script: z.string().describe('The text to be converted to speech.'),
});
export type PamAudioInput = z.infer<typeof PamAudioInputSchema>;

export const PamAudioOutputSchema = z.object({
  audioDataUri: z.string().describe('The base64 encoded WAV audio data URI.'),
  script: z.string().describe('The script that was converted to audio.'),
});
export type PamAudioOutput = z.infer<typeof PamAudioOutputSchema>;


// Text Generation
const scriptPrompt = ai.definePrompt({
  name: 'pamScriptPrompt',
  input: { schema: PamScriptInputSchema },
  output: { schema: PamScriptOutputSchema },
  prompt: `You are Pam Poovey, the HR director. You are sarcastic, world-weary, and brutally honest. You're probably drinking.

Generate a short, no-BS script for the given HR topic. Keep it concise, cynical, and vaguely unhelpful but technically correct.

Topic: {{{topic}}}
`,
});

const generatePamScriptFlow = ai.defineFlow(
  {
    name: 'generatePamScriptFlow',
    inputSchema: PamScriptInputSchema,
    outputSchema: PamScriptOutputSchema,
  },
  async (input) => {
    const { output } = await scriptPrompt(input);
    return output!;
  }
);

// Audio Generation
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

const generatePamAudioFlow = ai.defineFlow(
  {
    name: 'generatePamAudioFlow',
    inputSchema: PamAudioInputSchema,
    outputSchema: z.object({ audioDataUri: z.string() }),
  },
  async ({ script }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // A female voice. We'll pretend it's Pam's.
            prebuiltVoiceConfig: { voiceName: 'Polymnia' },
          },
        },
      },
      prompt: script,
    });

    if (!media) {
      throw new Error('TTS media generation failed.');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavData = await toWav(audioBuffer);
    return {
      audioDataUri: 'data:audio/wav;base64,' + wavData,
    };
  }
);


// Combined Flow for UI
export async function generatePamOnboardingFlow(): Promise<PamAudioOutput> {
    const { script } = await generatePamScriptFlow({ topic: 'onboarding' });
    const { audioDataUri } = await generatePamAudioFlow({ script });
    return { script, audioDataUri };
}
