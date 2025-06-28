
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PlanAdvisorInputSchema, PlanAdvisorOutputSchema, type PlanAdvisorInput, type PlanAdvisorOutput } from './plan-advisor-schemas';
import { incrementAgentActions } from '@/services/billing-service';


const planAdvisorFlow = ai.defineFlow(
  {
    name: 'planAdvisorFlow',
    inputSchema: PlanAdvisorInputSchema,
    outputSchema: PlanAdvisorOutputSchema,
  },
  async ({ question, workspaceId }) => {
    // This is a billable agent action, even for prospective customers.
    // If they aren't authenticated, it won't do anything, which is fine.
    if (workspaceId) {
        await incrementAgentActions(workspaceId);
    }
    
    const prompt = `You are a helpful and knowledgeable sales assistant for ΛΞVON OS. Your goal is to answer user questions about the pricing plans and help them choose the right one for their needs. Be friendly, clear, and concise. Do not make up features or pricing.

Here are the details of the pricing plans:

**Apprentice (Free Tier)**
- **Price:** $0
- **Target User:** Individuals, Explorers, Developers.
- **CogniOps Quota:** 100 "Agent Actions" per month. This is for simple tasks and demonstrating the OS's power.
- **Limitations:** Restricted access to the full third-party Armory marketplace and custom workflow creation in Loom Studio.

**Artisan (Pro Tier)**
- **Price:** ~$20 / user / month
- **Target User:** Solo Operators, Small Teams, Power Users.
- **CogniOps Quota:** 2,000 "Agent Actions" per month.
- **Features:** Unlocks full ecosystem power, including unrestricted Armory marketplace access and unlimited custom agentic workflow creation in Loom Studio. Overage is handled via prepaid credits.

**Priesthood (Enterprise Tier)**
- **Price:** Custom Quote
- **Target User:** Larger Organizations, Autonomous Corporate Departments, Businesses with stringent security/compliance needs.
- **Features:** Includes everything in the Artisan tier plus advanced security/governance (Aegis with SSO, audit logs), very high or unlimited CogniOps quotas, advanced admin tools, and dedicated premium support.

**What are "Agent Actions" (CogniOps)?**
An "Agent Action" is a standardized unit of work performed by an AI agent in the OS. It's a simple metric that covers complex underlying costs like LLM API calls and server compute time. Simple queries might be 1 action, while complex agent workflows might be 25 or more.

---

User's Question:
"{{{question}}}"

Answer the user's question based *only* on the information provided above.`;

    const { output } = await ai.generate({
      prompt,
      model: 'googleai/gemini-1.5-flash-latest',
      output: { schema: PlanAdvisorOutputSchema },
    });
    
    return output!;
  }
);


export async function getPlanAdvice(input: PlanAdvisorInput): Promise<PlanAdvisorOutput> {
  return planAdvisorFlow(input);
}
