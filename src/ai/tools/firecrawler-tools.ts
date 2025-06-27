
/**
 * @fileOverview A tool for running scans with the Firecrawler API.
 */
import { ai } from '@/ai/genkit';
import { FirecrawlerScanInputSchema, FirecrawlerReportSchema } from './firecrawler-schemas';
import FirecrawlApp from '@mendable/firecrawl-js';


export const runFirecrawlerScan = ai.defineTool(
  {
    name: 'runFirecrawlerScan',
    description: 'Scrapes a URL to extract its main content and metadata. Useful for analyzing social media profiles or websites provided by the user.',
    inputSchema: FirecrawlerScanInputSchema,
    outputSchema: FirecrawlerReportSchema,
  },
  async ({ url }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        console.warn('[Firecrawler Tool] This tool is currently mocked because no API key was provided. It does not perform a live web scrape.');

        // Return a generic success response to allow the OSINT agent to function.
        return {
            "success": true,
            "data": {
                "content": `# Mock Scrape of ${url}\n\nThis is placeholder content. The live Firecrawler tool has been temporarily disabled.`,
                "markdown": `# Mock Scrape of ${url}\n\nThis is placeholder content. The live Firecrawler tool has been temporarily disabled.`,
                "metadata": {
                    "title": `Mock Scrape of ${url}`,
                    "description": "This is a mocked response from the Firecrawler tool.",
                    "ogTitle": "Mock Scrape",
                    "ogDescription": "Content has been mocked."
                },
                "mode": "scrape"
            }
        }
    }
    
    try {
        const app = new FirecrawlApp({ apiKey });
        const scrapeResult = await app.scrapeUrl(url, {
            pageOptions: {
                onlyMainContent: true
            }
        });
        
        if (scrapeResult.success) {
            return {
                success: true,
                data: {
                    content: scrapeResult.data.content,
                    markdown: scrapeResult.data.markdown,
                    metadata: scrapeResult.data.metadata,
                    mode: 'scrape',
                }
            };
        } else {
             // The type for scrapeResult is `any`, so we have to check for error structure
            const errorMessage = (scrapeResult as any).error || "Unknown error from Firecrawler API.";
            console.error(`[Firecrawler Tool] Failed to scrape ${url}:`, errorMessage);
            return {
                success: false,
                error: errorMessage,
            };
        }
    } catch (error) {
        console.error(`[Firecrawler Tool] Exception while scraping ${url}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown exception occurred.",
        };
    }
  }
);
