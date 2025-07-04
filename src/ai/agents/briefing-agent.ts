'use server';
/**
 * @fileOverview Agent Kernel for generating a daily briefing.
 * This acts as a user's chief of staff, summarizing the day's key points.
 */

import { ai } from '@/ai/genkit';
import { DailyBriefingInputSchema, DailyBriefingOutputSchema, type DailyBriefingInput, type DailyBriefingOutput } from './briefing-schemas';
import prisma from '@/lib/prisma';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { UserRole } from '@prisma/client';

const rolePriorities: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Focus on strategic oversight. Review system health, user activity, and economic pulse. Consider commissioning new agents or workflows.",
    [UserRole.MANAGER]: "Focus on team productivity and project velocity. Check agent muster for errors, review recent activities, and prepare for any upcoming deadlines.",
    [UserRole.OPERATOR]: "Focus on execution. Complete assigned tasks, utilize your agents to streamline workflows, and report any blockers immediately.",
    [UserRole.AUDITOR]: "Focus on compliance and data integrity. Review recent transactions and security alerts for anomalies. Ensure all protocols are being followed."
};

const generateDailyBriefingFlow = ai.defineFlow(
  {
    name: 'generateDailyBriefingFlow',
    inputSchema: DailyBriefingInputSchema,
    outputSchema: DailyBriefingOutputSchema,
  },
  async ({ workspaceId, userId, userFirstName }) => {
    // This is a background/dashboard action, it shouldn't cost the user.
    // However, in a production system, we might bill the workspace for it.
    // For now, we will skip billing for this agent.

    // 1. Fetch data
    const [workspace, securityAlerts, user] = await Promise.all([
        prisma.workspace.findUnique({ where: { id: workspaceId }, select: { credits: true, name: true } }),
        prisma.securityAlert.findMany({ where: { workspaceId }, orderBy: { timestamp: 'desc' }, take: 3 }),
        prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);

    if (!workspace || !user) {
        throw new Error('Workspace or User not found.');
    }
    
    // 2. Format data for the prompt
    let context = '## Daily Briefing Context\n\n';
    context += `Credit Balance: ${Number(workspace.credits).toFixed(2)} Ξ\n`;

    if (securityAlerts.length > 0) {
        context += '\nRecent Security Alerts:\n';
        securityAlerts.forEach(alert => {
            context += `- [${alert.riskLevel.toUpperCase()}] ${alert.type}: ${alert.explanation}\n`;
        });
    } else {
        context += '\nNo new security alerts.\n';
    }
    
    const priorityGuidance = rolePriorities[user.role] || "Review your current tasks and objectives for the day.";
    context += `\nUser Role Guidance: ${priorityGuidance}\n`;

    // 3. Generate the briefing
    const prompt = `You are BEEP, the executive assistant AI for ΛΞVON OS. Your tone is professional, concise, and proactive.

You are preparing a daily morning briefing for ${userFirstName}.
Use the provided context to generate the briefing. Your response must be structured according to the JSON schema.

Key Information for Briefing:
${context}

**Your Tasks:**
1.  **Greeting**: Start with a polite, professional greeting for ${userFirstName}.
2.  **Key Alerts**: Synthesize the most critical information into 2-3 bullet points. If credits are low (below 100), mention it. Summarize the highest risk security alerts. If there are no alerts, state that the system is secure.
3.  **Top Priorities**: Based on the user's role guidance and the current context, suggest 2-3 actionable priorities for their day. Make them sound like agenda items.
4.  **Closing Remark**: End with a brief, encouraging closing remark.

Generate the briefing now.`;
    
    const { output } = await ai.generate({
        prompt,
        model: 'googleai/gemini-1.5-flash-latest',
        output: { schema: DailyBriefingOutputSchema },
    });

    if (!output) {
      throw new Error("Failed to generate daily briefing.");
    }

    return output;
  }
);


export async function generateDailyBriefing(input: DailyBriefingInput): Promise<DailyBriefingOutput> {
  return generateDailyBriefingFlow(input);
}
