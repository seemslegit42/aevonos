import { config } from 'dotenv';
config();

import '@/ai/agents/aegis.ts';
import '@/ai/agents/echo.ts';
import '@/ai/flows/initial-prompt-generation.ts';
import '@/ai/agents/dr-syntax.ts';
