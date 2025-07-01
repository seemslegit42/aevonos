
'use server';
/**
 * @fileOverview Agent Kernel for Pam Poovey.
 * Provides TTS and script generation capabilities with a... unique personality.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import {
  PamScriptInputSchema,
  PamScriptOutputSchema,
  PamAudioInputSchema,
  type PamScriptInput,
  type PamAudioOutput,
} from './pam-poovey-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { toWav } from '@/lib/audio-utils';


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
    // This part of the flow does not increment actions,
    // as it's an internal step of the main generatePamRant flow.
    // The main flow will handle the billing.
    const { output } = await scriptPrompt(input);
    return output!;
  }
);

// Audio Generation
const generatePamAudioFlow = ai.defineFlow(
  {
    name: 'generatePamAudioFlow',
    inputSchema: PamAudioInputSchema,
    outputSchema: z.object({ audioDataUri: z.string() }),
  },
  async ({ script }) => {
    // This part of the flow also does not increment actions.
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
export async function generatePamRant(input: PamScriptInput): Promise<PamAudioOutput> {
    // This is the main entry point. It has two LLM calls (script + TTS),
    // so we bill for both actions.
    await authorizeAndDebitAgentActions({ workspaceId: input.workspaceId, actionType: 'SIMPLE_LLM' });
    await authorizeAndDebitAgentActions({ workspaceId: input.workspaceId, actionType: 'TTS_GENERATION' });
    
    const { script } = await generatePamScriptFlow(input);
    const { audioDataUri } = await generatePamAudioFlow({ script });
    return { script, audioDataUri };
}
