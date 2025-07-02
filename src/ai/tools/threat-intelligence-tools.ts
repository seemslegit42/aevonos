
'use server';
/**
 * @fileOverview Tools for fetching threat intelligence data.
 */
import prisma from '@/lib/prisma';
import type { ThreatFeed } from '@prisma/client';

export async function getThreatFeedsForWorkspace(workspaceId: string): Promise<Pick<ThreatFeed, 'id' | 'url'>[]> {
    return prisma.threatFeed.findMany({
      where: { workspaceId },
      select: { id: true, url: true },
    });
}

// A mock tool to simulate fetching content from a URL.
// In a real app, this would make an HTTP request.
export async function fetchThreatIntelContentFromUrl(url: string): Promise<{ content: string }> {
    console.log(`[Mock Threat Intel Tool] Fetching content for URL: ${url}`);
    // Mocked content based on URL for demonstration
    if (url.includes('phishing')) {
        return { content: "update your payment details now\nyour account is locked\nurgent security alert click here" };
    }
    if (url.includes('malicious-domains')) {
        return { content: "evil-corp.ru\nhackers.net\nmalware-delivery.xyz" };
    }
    return { content: "" };
}
