
'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) generation flow using Genkit.
 *
 * - generateSpeech - A function that converts text to a spoken audio data URI.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { 
    GenerateSpeechInputSchema, 
    GenerateSpeechOutputSchema,
    type GenerateSpeechInput,
    type GenerateSpeechOutput
} from './tts-schemas';
import { toWav } from '@/lib/audio-utils';


const voiceMap: Record<NonNullable<GenerateSpeechInput['mood']>, string> = {
    neutral: 'Cetus', // Professional, clear
    alert: 'Pherkad', // Deep, serious
    confirmation: 'Polymnia', // Friendly, lighter
};

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async ({ text, mood }) => {
    // If the text is short or just a confirmation, don't generate speech.
    if (!text || text.length < 10 || text.toLowerCase().includes('command received')) {
        return { audioDataUri: '' };
    }
      
    const voiceName = voiceMap[mood || 'neutral'];

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
      prompt: text,
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


export async function generateSpeech(input: GenerateSpeechInput): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}
