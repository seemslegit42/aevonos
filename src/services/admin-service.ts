
'use server';
/**
 * @fileOverview Service layer for administrative functionalities.
 * This service centralizes data access logic for admin-related API endpoints,
 * ensuring separation of concerns and reusability.
 */
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { AgentStatus, PlanTier, UserPsyche } from '@prisma/client';
import type { User, Workspace } from '@prisma/client';
import { calculateVasForUser } from '@/services/vas-service';

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

const WORKSPACE_VOWS_CACHE_KEY = (workspaceId: string) => `admin:vows:${workspaceId}`;
const WORKSPACE_VOWS_CACHE_TTL = 60 * 15; // 15 minutes

/**
 * Retrieves the founding vows and goals for all users in a workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of objects containing user and vow data.
 */
export async function getWorkspaceVows(workspaceId: string) {
  const cacheKey = WORKSPACE_VOWS_CACHE_KEY(workspaceId);
  const cachedVows = await cache.get(cacheKey);
  if (cachedVows) {
      return cachedVows;
  }
  
  const vows = await prisma.user.findMany({
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

  await cache.set(cacheKey, vows, 'EX', WORKSPACE_VOWS_CACHE_TTL);
  return vows;
}


const COVENANT_MEMBERS_CACHE_KEY = (workspaceId: string, covenantName: string) => `admin:covenant-members:${workspaceId}:${covenantName}`;
const COVENANT_LEADERBOARD_CACHE_KEY = (workspaceId: string, covenantName: string) => `admin:covenant-leaderboard:${workspaceId}:${covenantName}`;
const COVENANT_CACHE_TTL = 60 * 5; // 5 minutes

const covenantNameToPsyche = (name: string): UserPsyche | null => {
    switch(name.toLowerCase()) {
        case 'motion': return UserPsyche.SYNDICATE_ENFORCER;
        case 'worship': return UserPsyche.RISK_AVERSE_ARTISAN;
        case 'silence': return UserPsyche.ZEN_ARCHITECT;
        default: return null;
    }
}

/**
 * Retrieves the member roster for a specific Covenant within a workspace.
 * Caches the result.
 * @param workspaceId The ID of the workspace.
 * @param covenantName The name of the covenant ('motion', 'worship', 'silence').
 * @returns A promise resolving to an array of user data for the covenant members.
 */
export async function getCovenantMembers(workspaceId: string, covenantName: string) {
    const cacheKey = COVENANT_MEMBERS_CACHE_KEY(workspaceId, covenantName);
    const cachedMembers = await cache.get(cacheKey);
    if (cachedMembers && Array.isArray(cachedMembers)) {
        return cachedMembers;
    }

    const psyche = covenantNameToPsyche(covenantName);
    if (!psyche) {
      throw new Error('Invalid covenant name provided.');
    }

    const members = await prisma.user.findMany({
      where: {
        psyche: psyche,
        workspaces: {
          some: { id: workspaceId }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    await cache.set(cacheKey, members, 'EX', COVENANT_CACHE_TTL);
    return members;
}


/**
 * Retrieves the Vow Alignment Score (VAS) leaderboard for a specific Covenant.
 * Caches the result.
 * @param workspaceId The ID of the workspace.
 * @param covenantName The name of the covenant ('motion', 'worship', 'silence').
 * @returns A promise resolving to a sorted array of users with their VAS.
 */
export async function getCovenantLeaderboard(workspaceId: string, covenantName: string) {
    const cacheKey = COVENANT_LEADERBOARD_CACHE_KEY(workspaceId, covenantName);
    const cachedLeaderboard = await cache.get(cacheKey);
    if (cachedLeaderboard && Array.isArray(cachedLeaderboard)) {
        return cachedLeaderboard;
    }
    
    // We can reuse the getCovenantMembers function to avoid duplicating the initial query
    const members = await getCovenantMembers(workspaceId, covenantName);

    const leaderboardPromises = members.map(async (member: any) => {
        const vas = await calculateVasForUser(member.id);
        return { ...member, vas };
    });

    const leaderboard = (await Promise.all(leaderboardPromises)).sort((a, b) => b.vas - a.vas);

    await cache.set(cacheKey, leaderboard, 'EX', COVENANT_CACHE_TTL);
    return leaderboard;
}
