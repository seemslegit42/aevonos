
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// Be extra robust about the API key.
// If it's missing or an empty string, use the placeholder.
const apiKey = (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') 
    ? process.env.GOOGLE_API_KEY 
    : 'YOUR_API_KEY_HERE';

const hasValidApiKey = apiKey !== 'YOUR_API_KEY_HERE';

if (!hasValidApiKey) {
    console.warn(
        '\x1b[33m%s\x1b[0m', // Yellow text
        'WARNING: GOOGLE_API_KEY is not set in your .env file. AI features will be disabled and may throw errors at runtime. Please set a valid key to enable AI functionality.'
    );
}

export const ai = genkit({
  // Only add the googleAI plugin if the key is valid. This prevents startup crash.
  plugins: hasValidApiKey ? [googleAI({apiKey: apiKey})] : [],
});

// The LangChain model will likely fail on first use if the key is invalid, which is fine.
// The key is to prevent the app from crashing on startup.
export const geminiModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash-latest",
  maxOutputTokens: 8192,
  apiKey: apiKey,
});
