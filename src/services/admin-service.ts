
'use server';
/**
 * @fileOverview Service layer for administrative functionalities.
 * This service centralizes data access logic for admin-related API endpoints,
 * ensuring separation of concerns and reusability.
 */
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { AgentStatus, PlanTier } from '@prisma/client';
import type { User, Workspace } from '@prisma/client';

const OVERVIEW_CACHE_KEY = (workspaceId: string) => `admin:overview:${workspaceId}`;
const OVERVIEW_CACHE_TTL = 60; // 1 minute

/**
 * Retrieves high-level overview statistics for a given workspace.
 * Caches the result to improve performance on frequently accessed dashboards.
 * @param workspaceId The ID of the workspace to get stats for.
 * @returns An object containing key metrics for the admin dashboard.
 */
export async function getOverviewStats(workspaceId: string) {
  const cacheKey = OVERVIEW_CACHE_KEY(workspaceId);
  const cachedStats = await cache.get(cacheKey);
  if (cachedStats) {
      return cachedStats;
  }

  const [userCount, agentCount, activeAgentCount, workspace] = await prisma.$transaction([
    prisma.user.count({ where: { workspaces: { some: { id: workspaceId } } } }),
    prisma.agent.count({ where: { workspaceId } }),
    prisma.agent.count({ where: { workspaceId, status: AgentStatus.active } }),
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true, planTier: true },
    }),
  ]);

  if (!workspace) {
    throw new Error('Workspace not found.');
  }

  const stats = {
    userCount,
    agentCount,
    activeAgentCount,
    creditBalance: Number(workspace.credits),
    planTier: workspace.planTier,
  };
  
  await cache.set(cacheKey, stats, 'EX', OVERVIEW_CACHE_TTL);

  return stats;
}


const WORKSPACE_USERS_CACHE_KEY = (workspaceId: string) => `admin:users:${workspaceId}`;
const WORKSPACE_USERS_CACHE_TTL = 60 * 5; // 5 minutes

/**
 * Retrieves a list of all users within a given workspace.
 * Caches the result to improve performance.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of user data objects.
 */
export async function getWorkspaceUsers(workspaceId: string) {
  const cacheKey = WORKSPACE_USERS_CACHE_KEY(workspaceId);
  const cachedUsers = await cache.get(cacheKey);
  if (cachedUsers) {
      return cachedUsers;
  }

  const users = await prisma.user.findMany({
    where: {
      workspaces: {
        some: { id: workspaceId },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      lastLoginAt: true,
      psyche: true,
      agentAlias: true,
    },
    orderBy: {
      email: 'asc',
    },
  });
  
  await cache.set(cacheKey, users, 'EX', WORKSPACE_USERS_CACHE_TTL);
  
  return users;
}

/**
 * Retrieves the founding vows and goals for all users in a workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of objects containing user and vow data.
 */
export async function getWorkspaceVows(workspaceId: string) {
  return prisma.user.findMany({
    where: {
      workspaces: {
        some: { id: workspaceId },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      psyche: true,
      foundingVow: true,
      foundingGoal: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}
