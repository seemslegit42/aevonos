
'use server';
/**
 * @fileOverview Service for handling billing and usage tracking.
 */
import prisma from '@/lib/prisma';

/**
 * Atomically increments the agentActionsUsed counter for a given workspace.
 * @param workspaceId The ID of the workspace to update.
 * @param amount The number of actions to add. Defaults to 1.
 */
export async function incrementAgentActions(workspaceId: string, amount: number = 1): Promise<void> {
    if (!workspaceId) {
        console.warn("[Billing Service] Attempted to increment agent actions without a workspaceId. Skipping.");
        return;
    }
    try {
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                agentActionsUsed: {
                    increment: amount,
                },
            },
        });
    } catch (error) {
        console.error(`[Billing Service] Failed to increment actions for workspace ${workspaceId}:`, error);
        // We don't re-throw the error to avoid failing the entire agent flow
        // just because of a billing issue. We log it for monitoring.
    }
}
