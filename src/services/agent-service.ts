'use server';
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import type { Agent } from '@prisma/client';

const AGENTS_CACHE_KEY = (workspaceId: string) => `agents:${workspaceId}`;
const AGENTS_CACHE_TTL_SECONDS = 60 * 5; // 5 minutes

/**
 * Retrieves a list of all agents for a given workspace, using a cache-aside strategy.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of Agent objects.
 */
export async function getAgentsForWorkspace(workspaceId: string): Promise<Agent[]> {
    const cacheKey = AGENTS_CACHE_KEY(workspaceId);
    const cachedAgents = await cache.get(cacheKey);
    if (cachedAgents && Array.isArray(cachedAgents)) {
        return cachedAgents as Agent[];
    }

    const agents = await prisma.agent.findMany({
        where: { workspaceId },
        orderBy: { name: 'asc' },
    });
    
    await cache.set(cacheKey, agents, 'EX', AGENTS_CACHE_TTL_SECONDS);

    return agents;
}

/**
 * Retrieves a single agent by its ID, ensuring it belongs to the specified workspace.
 * Caching is not implemented here as individual agent fetches are less frequent.
 * @param agentId The ID of the agent to retrieve.
 * @param workspaceId The ID of the workspace for security scoping.
 * @returns A promise that resolves to the Agent object or null if not found.
 */
export async function getAgentById(agentId: string, workspaceId: string): Promise<Agent | null> {
    return prisma.agent.findFirst({
        where: { id: agentId, workspaceId },
    });
}
