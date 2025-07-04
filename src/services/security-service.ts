
'use server';
/**
 * @fileOverview Service layer for security-related data access.
 * This centralizes logic for fetching alerts, feeds, and edicts.
 */
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import type { SecurityAlert, ThreatFeed, SecurityEdict } from '@prisma/client';

const ALERTS_CACHE_KEY = (workspaceId: string) => `security-alerts:${workspaceId}`;
const ALERTS_CACHE_TTL_SECONDS = 60; // 1 minute

export async function getSecurityAlerts(workspaceId: string): Promise<SecurityAlert[]> {
    const cacheKey = ALERTS_CACHE_KEY(workspaceId);
    const cachedAlerts = await cache.get(cacheKey);
    if (cachedAlerts && Array.isArray(cachedAlerts)) {
        return cachedAlerts.map(alert => ({...alert, timestamp: new Date(alert.timestamp)}));
    }

    const alerts = await prisma.securityAlert.findMany({
        where: { workspaceId },
        orderBy: { timestamp: 'desc' },
    });

    await cache.set(cacheKey, alerts, 'EX', ALERTS_CACHE_TTL_SECONDS);
    return alerts;
}

const FEEDS_CACHE_KEY = (workspaceId: string) => `threat-feeds:${workspaceId}`;
const FEEDS_CACHE_TTL_SECONDS = 60 * 10; // 10 minutes

export async function getThreatFeeds(workspaceId: string): Promise<Pick<ThreatFeed, 'id' | 'url'>[]> {
    const cacheKey = FEEDS_CACHE_KEY(workspaceId);
    const cachedFeeds = await cache.get(cacheKey);
    if (cachedFeeds && Array.isArray(cachedFeeds)) {
        return cachedFeeds;
    }

    const feeds = await prisma.threatFeed.findMany({
        where: { workspaceId },
        select: { id: true, url: true },
    });

    await cache.set(cacheKey, feeds, 'EX', FEEDS_CACHE_TTL_SECONDS);
    return feeds;
}

export async function updateThreatFeeds(workspaceId: string, feeds: string[]): Promise<void> {
    await prisma.$transaction([
        prisma.threatFeed.deleteMany({ where: { workspaceId } }),
        prisma.threatFeed.createMany({
            data: feeds.map(url => ({ url, workspaceId })),
        }),
    ]);
    await cache.del(FEEDS_CACHE_KEY(workspaceId));
}
