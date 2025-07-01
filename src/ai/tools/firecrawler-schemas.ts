
import { z } from 'zod';

export const FirecrawlerScanInputSchema = z.object({
  url: z.string().url().describe('The URL to scrape.'),
});
export type FirecrawlerScanInput = z.infer<typeof FirecrawlerScanInputSchema>;

// The response from firecrawler-js has a specific shape. Let's model it.
const FirecrawlerSuccessReportSchema = z.object({
    success: z.literal(true),
    data: z.object({
        content: z.string(),
        markdown: z.string().optional(),
        metadata: z.record(z.any()),
        mode: z.string(),
    }),
});

const FirecrawlerErrorReportSchema = z.object({
    success: z.literal(false),
    error: z.string(),
});

export const FirecrawlerReportSchema = z.union([FirecrawlerSuccessReportSchema, FirecrawlerErrorReportSchema])
    .describe('The raw JSON report returned from the Firecrawler API.');
export type FirecrawlerReport = z.infer<typeof FirecrawlerReportSchema>;
