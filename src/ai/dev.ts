import { config } from 'dotenv';
config();

import '@/ai/flows/anomaly-detection.ts';
// import '@/ai/flows/summarize-session.ts';
import '@/ai/flows/initial-prompt-generation.ts';
import '@/ai/agents/dr-syntax.ts';
