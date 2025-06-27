import { z } from 'zod';

export const FirecrawlerScanInputSchema = z.object({
  query: z.string().describe('The search query for Firecrawler, e.g., an email, name, or domain.'),
});
export type FirecrawlerScanInput = z.infer<typeof FirecrawlerScanInputSchema>;

// Firecrawler can return a wide variety of data. Using z.any() for flexibility.
// In a real production scenario, this would be a more detailed Zod schema matching the Firecrawler API response.
export const FirecrawlerReportSchema = z.record(z.any()).describe('The raw JSON report returned from the Firecrawler API.');
export type FirecrawlerReport = z.infer<typeof FirecrawlerReportSchema>;
