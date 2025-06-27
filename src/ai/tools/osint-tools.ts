'use server';
/**
 * @fileOverview A collection of discrete OSINT tools for agentic use.
 * These are functional harnesses that return mock data.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  PwnedCheckInputSchema, PwnedCheckOutputSchema,
  SocialScrapeInputSchema, SocialScrapeOutputSchema,
  BurnerCheckInputSchema, BurnerCheckOutputSchema,
  IntelXSearchInputSchema, IntelXSearchOutputSchema,
} from './osint-schemas';

// HaveIBeenPwned Tool
export const checkEmailBreaches = ai.defineTool(
  {
    name: 'checkEmailBreaches',
    description: 'Checks a given email address against a database of known data breaches (HaveIBeenPwned).',
    inputSchema: PwnedCheckInputSchema,
    outputSchema: PwnedCheckOutputSchema,
  },
  async ({ email }) => {
    if (email.includes('breached')) {
      return [
        { name: 'Broad-Social-Network', domain: 'broadsocial.com', breachDate: '2021-08-01', description: 'User profile data, including usernames, emails, and bios were exposed.' },
        { name: 'MyFitnessFriend', domain: 'myfitnessfriend.com', breachDate: '2018-02-01', description: '150 million user accounts were compromised, exposing usernames, email addresses, and hashed passwords.' },
      ];
    }
    return [];
  }
);

// Social Media Scraping Tool
export const scrapeSocialMediaProfile = ai.defineTool(
    {
      name: 'scrapeSocialMediaProfile',
      description: 'Scrapes a public social media profile (Instagram, TikTok, GitHub, LinkedIn) for key information.',
      inputSchema: SocialScrapeInputSchema,
      outputSchema: SocialScrapeOutputSchema,
    },
    async ({ profileUrl }) => {
        let platform = 'Unknown';
        if (profileUrl.includes('instagram')) platform = 'Instagram';
        if (profileUrl.includes('tiktok')) platform = 'TikTok';
        if (profileUrl.includes('github')) platform = 'GitHub';
        if (profileUrl.includes('linkedin')) platform = 'LinkedIn';
        
        return {
            platform,
            username: `mockuser_${platform.toLowerCase()}`,
            fullName: 'Mock User',
            bio: 'This is a mock bio from a scraped social media profile. Living my best life. #blessed',
            recentPosts: ['Posted a picture of a cat.', 'Shared a motivational quote.', 'Checked in at a local coffee shop.'],
            followerCount: 1234,
        }
    }
);

// Burner Phone Check Tool
export const checkBurnerPhoneNumber = ai.defineTool(
    {
      name: 'checkBurnerPhoneNumber',
      description: 'Checks if a phone number is a known burner or a temporary number.',
      inputSchema: BurnerCheckInputSchema,
      outputSchema: BurnerCheckOutputSchema,
    },
    async ({ phoneNumber }) => {
        if (phoneNumber.includes('555')) {
            return {
                isBurner: true,
                carrier: 'BurnerApp Services',
                country: 'US',
            }
        }
        return {
            isBurner: false,
            carrier: 'Major Carrier',
            country: 'US',
        }
    }
);

// IntelX Tool
export const searchIntelX = ai.defineTool(
    {
      name: 'searchIntelXLeaks',
      description: 'Searches the IntelX.io database for data leaks associated with a search term (email, username, etc.).',
      inputSchema: IntelXSearchInputSchema,
      outputSchema: IntelXSearchOutputSchema,
    },
    async ({ searchTerm }) => {
        if (searchTerm.includes('leaked')) {
            return [
                { source: 'DarkForum Archives', date: '2022-01-15', details: 'Leaked database contains username, email, and unsalted MD5 password hash.'},
                { source: 'Telegram Chat Logs', date: '2023-05-20', details: 'User mentioned search term in a public chat discussing questionable activities.'},
            ]
        }
        return [];
    }
);
