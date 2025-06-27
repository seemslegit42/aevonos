import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

export const geminiModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash",
  maxOutputTokens: 8192,
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});
