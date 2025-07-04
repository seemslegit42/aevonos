
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
import { getUsageDetailsForAgent, requestCreditTopUpInDb } from '@/services/billing-service';
import { getDatingProfile } from '@/ai/tools/dating-tools';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { createManualTransaction } from '@/services/ledger-service';
import { getSystemStatus, findUsersByVow, manageSyndicateAccess } from '@/ai/tools/demiurge-tools';
import { transmuteCredits } from '@/ai/tools/proxy-tools';


// Schema Imports
import { RequestCreditTopUpInputSchema } from '@/ai/tools/billing-schemas';
import { DatingProfileInputSchema } from '@/ai/tools/dating-schemas';
import { CreateSecurityAlertInputSchema } from '@/ai/tools/security-schemas';
import { CreateManualTransactionInputSchema } from '@/ai/tools/ledger-schemas';
import { FindUsersByVowInputSchema, ManageSyndicateInputSchema } from '@/ai/tools/demiurge-tools';
import { TransmuteCreditsInputSchema } from '../tools/proxy-schemas';


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
 * Creates and returns a context-aware array of tools for the BEEP agent.
 * @param context The current agent execution context.
 * @returns An array of LangChain Tool instances.
 */
export async function getTools(context: AgentContext): Promise<Tool[]> {
    const { userId, workspaceId, psyche, role } = context;

    const allTools: Tool[] = [
        new FinalAnswerTool(),

        new Tool({
            name: 'getUsageDetails',
            description: 'Gets the current billing and agent action usage details. Use this when the user asks about their usage, limits, plan, or billing.',
            schema: z.object({}),
            func: () => getUsageDetailsForAgent(workspaceId, userId),
        }),
        
        new Tool({
            name: 'requestCreditTopUp',
            description: 'Logs a user\'s request to top up their credit balance via an out-of-band payment method like an e-Transfer. Use this when the user says "add credits", "buy credits", "top up my account", etc. Extract the amount from their command.',
            schema: RequestCreditTopUpInputSchema,
            func: (toolInput) => requestCreditTopUpInDb(toolInput, userId, workspaceId),
        }),
        
        new Tool({
            name: 'createManualTransaction',
            description: 'Creates a manual credit or debit transaction on the user\'s workspace account. Use this for explicit user requests like "charge me 10 credits for this" or "process a refund of 5 credits".',
            schema: CreateManualTransactionInputSchema,
            func: (toolInput) => createManualTransaction(toolInput, workspaceId, userId),
        }),
        
        new Tool({
            name: 'getDatingProfile',
            description: 'Fetches a dating app profile by its ID. Use this when the user wants to get information about a specific person on a dating app before crafting a message. For example, "get profile 123 from Hinge."',
            schema: DatingProfileInputSchema,
            func: (toolInput) => getDatingProfile(toolInput, workspaceId, userId),
        }),

        new Tool({
            name: 'createSecurityAlert',
            description: 'Creates a security alert in the Aegis system. Use this when the Aegis anomaly scan returns a positive result for a threat. You must provide the type, explanation, and risk level of the alert based on the Aegis report.',
            schema: CreateSecurityAlertInputSchema,
            func: (toolInput) => createSecurityAlertInDb(toolInput, workspaceId, userId),
        }),
    ];

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true }
    });
    const isOwner = workspace?.ownerId === userId;

    if (isOwner) {
        allTools.push(
            new Tool({
                name: 'getSystemStatus',
                description: "Retrieves the current operational status of the entire ΛΞVON OS, including system load and agent performance. Only for the Architect.",
                schema: z.object({}),
                func: getSystemStatus,
            }),
            new Tool({
                name: 'findUsersByVow',
                description: "Finds users based on a keyword from their 'founding vow' or 'sacrifice' made during the Rite of Invocation. Only for the Architect.",
                schema: FindUsersByVowInputSchema,
                func: findUsersByVow,
            }),
             new Tool({
                name: 'manageSyndicateAccess',
                description: "Performs high-level administrative actions on a group of users (a 'Syndicate' or 'Covenant'). Only for the Architect.",
                schema: ManageSyndicateInputSchema,
                func: manageSyndicateAccess,
            }),
            new Tool({
                name: 'transmuteCredits',
                description: 'Transmutes ΞCredits to settle a real-world tribute (payment). The user must confirm the details. For Sovereigns only.',
                schema: TransmuteCreditsInputSchema,
                func: (toolInput) => transmuteCredits(toolInput, workspaceId, userId),
            })
        );
    }
    
    return allTools;
}
