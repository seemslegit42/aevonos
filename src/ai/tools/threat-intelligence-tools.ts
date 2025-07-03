
'use server';
/**
 * @fileOverview Tools for fetching threat intelligence data.
 */
import prisma from '@/lib/prisma';
import type { ThreatFeed } from '@prisma/client';
import FirecrawlApp from '@mendable/firecrawl-js';

export async function getThreatFeedsForWorkspace(workspaceId: string): Promise<Pick<ThreatFeed, 'id' | 'url'>[]> {
    return prisma.threatFeed.findMany({
      where: { workspaceId },
      select: { id: true, url: true },
    });
}

// Fetches content from a URL using Firecrawl to provide live threat intelligence.
export async function fetchThreatIntelContentFromUrl(url: string): Promise<{ content: string }> {
    console.log(`[Threat Intel Tool] Fetching content for URL: ${url}`);
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || !apiKey.trim()) {
        console.warn(`[Threat Intel Tool] Firecrawl API key not set or invalid. Using mock data for ${url}.`);
        // Mocked content based on URL for demonstration
        if (url.includes('phishing')) {
            return { content: "update your payment details now\nyour account is locked\nurgent security alert click here" };
        }
        if (url.includes('malicious-domains')) {
            return { content: "evil-corp.ru\nhackers.net\nmalware-delivery.xyz" };
        }
        return { content: "" };
    }

    try {
        const app = new FirecrawlApp({ apiKey });
        // Use Firecrawler to scrape the raw text content from the feed URL
        const scrapeResult = await app.scrapeUrl(url, {
            pageOptions: {
                onlyMainContent: true, // We want the raw list, not boilerplate
            }
        });
        
        if (scrapeResult.success) {
            // Return the raw markdown/text content of the page
            return { content: scrapeResult.data.markdown || scrapeResult.data.content };
        } else {
            const errorMessage = (scrapeResult as any).error || "Unknown Firecrawler error.";
            console.error(`[Threat Intel Tool] Failed to scrape ${url}:`, errorMessage);
            // Return the error in the content for better debugging within the Aegis agent
            return { content: `Error fetching feed ${url}: ${errorMessage}` };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown exception occurred.";
        console.error(`[Threat Intel Tool] Exception while scraping ${url}:`, errorMessage);
        return { content: `Exception fetching feed ${url}: ${errorMessage}` };
    }
}
