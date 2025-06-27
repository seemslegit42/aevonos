import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// Be extra robust about the API key.
// If it's missing or an empty string, use the placeholder.
// The app will crash if an empty string is passed to the constructor.
const apiKey = (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') 
    ? process.env.GOOGLE_API_KEY 
    : 'YOUR_API_KEY_HERE';


export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
  model: 'googleai/gemini-2.0-flash',
});

export const geminiModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash",
  maxOutputTokens: 8192,
  apiKey: apiKey,
});
