'use server';
/**
 * @fileOverview Schemas for the Text-to-Speech (TTS) generation flow.
 */

import { z } from 'zod';

export const GenerateSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

export const GenerateSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;
