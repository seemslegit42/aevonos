
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from "@langchain/groq";

// Be extra robust about the API key.
// If it's missing or an empty string, use the placeholder.
const googleApiKey = (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') 
    ? process.env.GOOGLE_API_KEY 
    : 'YOUR_API_KEY_HERE';

if (googleApiKey === 'YOUR_API_KEY_HERE') {
    console.warn(
        '\x1b[33m%s\x1b[0m', // Yellow text
        'WARNING: GOOGLE_API_KEY is not set in your .env file. AI features will be disabled and may throw errors at runtime. Please set a valid key to enable AI functionality.'
    );
}

export const ai = genkit({
  // Only add the googleAI plugin if the key is valid. This prevents startup crash.
  plugins: googleApiKey !== 'YOUR_API_KEY_HERE' ? [googleAI({apiKey: googleApiKey})] : [],
});

// The LangChain model for Gemini, used for specialized multimodal tasks.
export const langchainGemini = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash-latest",
  maxOutputTokens: 8192,
  apiKey: googleApiKey,
});

// --- Groq Model Swarm ---
const groqApiKey = (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '')
    ? process.env.GROQ_API_KEY
    : 'YOUR_GROQ_API_KEY_HERE';

if (groqApiKey === 'YOUR_GROQ_API_KEY_HERE') {
    console.warn(
        '\x1b[33m%s\x1b[0m', // Yellow text
        'WARNING: GROQ_API_KEY is not set. Groq-powered features will be disabled.'
    );
}

// Pass a dummy key if the real one is missing to prevent startup crash.
// The SDK will handle the invalid key gracefully at runtime.
const effectiveGroqApiKey = groqApiKey === 'YOUR_GROQ_API_KEY_HERE' ? 'gsk_dummy_key_to_prevent_crash' : groqApiKey;


// The fast model for simple commands and routing.
export const langchainGroqFast = new ChatGroq({
    apiKey: effectiveGroqApiKey,
    model: "llama3-8b-8192", 
});

// The complex model for reasoning, analysis, and generation.
export const langchainGroqComplex = new ChatGroq({
    apiKey: effectiveGroqApiKey,
    model: "mixtral-8x7b-32768",
});
