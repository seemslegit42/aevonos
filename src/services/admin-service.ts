
'use server';
/**
 * @fileOverview Service layer for administrative functionalities.
 * This service centralizes data access logic for admin-related API endpoints,
 * ensuring separation of concerns and reusability.
 */
import prisma from '@/lib/prisma';
import { AgentStatus, PlanTier } from '@prisma/client';
import type { User, Workspace } from '@prisma/client';

/**
 * Retrieves high-level overview statistics for a given workspace.
 * @param workspaceId The ID of the workspace to get stats for.
 * @returns An object containing key metrics for the admin dashboard.
 */
export async function getOverviewStats(workspaceId: string) {
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

  return {
    userCount,
    agentCount,
    activeAgentCount,
    creditBalance: Number(workspace.credits),
    planTier: workspace.planTier,
  };
}

/**
 * Retrieves a list of all users within a given workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of user data objects.
 */
export async function getWorkspaceUsers(workspaceId: string) {
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
      role: true,
      lastLoginAt: true,
      psyche: true,
      agentAlias: true,
    },
    orderBy: {
      email: 'asc',
    },
  });
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
