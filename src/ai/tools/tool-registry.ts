

/**
 * @fileOverview This file defines the central tool registry for the BEEP agent.
 * It uses a factory pattern to create context-aware tool instances.
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { UserPsyche, UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';

import {
    UserCommandOutputSchema,
} from '../agents/beep-schemas';

// Tool Imports
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';

// Schema Imports
import { CreateSecurityAlertInputSchema } from '@/ai/tools/security-schemas';


// Context for multi-tenancy and personalization
interface AgentContext {
    userId: string;
    workspaceId: string;
    psyche: UserPsyche;
    role: UserRole;
}

// This tool is a container for the final structured output.
// The model is instructed to call this tool when its work is complete.
class FinalAnswerTool extends Tool {
  name = 'final_answer';
  description = 'Call this tool when you have gathered all necessary information and are ready to provide the final response to the user. The output should conform to the UserCommandOutputSchema.';
  schema = UserCommandOutputSchema.omit({ agentReports: true, responseAudioUri: true }); // Agent reports are aggregated by the graph.
  
  async _call(input: z.infer<typeof this.schema>) {
    // This tool doesn't "do" anything except structure the output.
    // The return value is not used in the main graph loop.
    return JSON.stringify(input);
  }
}

/**
 * Creates and returns a context-aware array of tools for the BEEP agent's REASONER.
 * The Reasoner should only have access to essential tools, not tools that duplicate
 * the functionality of specialist agents.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getTools(context: AgentContext): Promise<Tool[]> {
    const { userId, workspaceId } = context;

    const allTools: Tool[] = [
        new FinalAnswerTool(),
        
        new Tool({
            name: 'createSecurityAlert',
            description: 'Creates a security alert in the Aegis system. Use this when the Aegis anomaly scan returns a positive result for a threat. You must provide the type, explanation, and risk level of the alert based on the Aegis report.',
            schema: CreateSecurityAlertInputSchema,
            func: (toolInput) => createSecurityAlertInDb(toolInput, workspaceId, userId),
        }),
    ];
    
    return allTools;
}
