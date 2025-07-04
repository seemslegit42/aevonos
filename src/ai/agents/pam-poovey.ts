
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

/**
 * A pre-computed cache for Pam Poovey's rants.
 * This demonstrates a simple caching strategy to reduce LLM calls for frequent, deterministic inputs.
 * NOTE: The audio data URIs are placeholders. A real implementation would generate these once and store them.
 */
const pamPooveyStaticResponses: Record<string, PamAudioOutput> = {
  onboarding: {
    script: "Alright, new meat. Welcome to the... place. Don't touch my stuff, don't look at me before I've had coffee, and for the love of god, the bear claws are mine. Any questions? Too bad.",
    audioDataUri: 'data:audio/wav;base64,PLACEHOLDER_FOR_ONBOARDING_AUDIO',
  },
  attendance_policy: {
    script: "The policy is, get your ass in the chair. Or don't. I'm not your mom. But if you're not here, you don't get paid. And you can't buy bear claws without money. See how that works?",
    audioDataUri: 'data:audio/wav;base64,PLACEHOLDER_FOR_ATTENDANCE_AUDIO',
  },
  firing_someone: {
    script: "So, yeah... we're letting you go. It's not you, it's... well, no, it's definitely you. Pack your crap. Try not to cry on the ficus. Security!",
    audioDataUri: 'data:audio/wav;base64,PLACEHOLDER_FOR_FIRING_AUDIO',
  },
};


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
      console.error('TTS media generation failed, no media returned.');
      return { audioDataUri: '' };
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
    const { topic, workspaceId } = input;
    
    // Check for a static response first.
    // The placeholder check ensures we only use this for demos where audio isn't generated.
    if (pamPooveyStaticResponses[topic] && pamPooveyStaticResponses[topic].audioDataUri.length > 50) { 
      console.log(`[Pam Poovey Agent] Static response hit for key: ${topic}.`);
      await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });
      await authorizeAndDebitAgentActions({ workspaceId, actionType: 'TTS_GENERATION' });
      return pamPooveyStaticResponses[topic];
    }
    
    console.log(`[Pam Poovey Agent] Static response miss for key: ${topic}. Generating live response.`);

    // This is the main entry point. It has two LLM calls (script + TTS),
    // so we bill for both actions.
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'TTS_GENERATION' });
    
    const { script } = await generatePamScriptFlow(input);
    const { audioDataUri } = await generatePamAudioFlow({ script });
    return { script, audioDataUri };
}
