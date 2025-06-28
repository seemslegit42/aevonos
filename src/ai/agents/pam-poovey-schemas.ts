
import { z } from 'zod';

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
