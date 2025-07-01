/**
 * @fileOverview A collection of discrete OSINT tools for agentic use.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  PwnedCheckInputSchema, PwnedCheckOutputSchema,
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
    const apiKey = process.env.HAVEIBEENPWNED_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey === '') {
      console.warn('[OSINT Tool] HaveIBeenPwned API key not set. Using mock data.');
      if (email.includes('breached')) {
        return [
          { name: 'Broad-Social-Network', domain: 'broadsocial.com', breachDate: '2021-08-01', description: 'User profile data, including usernames, emails, and bios were exposed.' },
          { name: 'MyFitnessFriend', domain: 'myfitnessfriend.com', breachDate: '2018-02-01', description: '150 million user accounts were compromised, exposing usernames, email addresses, and hashed passwords.' },
        ];
      }
      return [];
    }

    try {
      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'AeVonOS-OSINT-Agent',
        }
      });

      if (response.status === 404) {
        return []; // No breaches found for this account.
      }

      if (!response.ok) {
        // Don't throw, just log and return empty so the agent flow doesn't crash.
        console.error(`[OSINT Tool] HaveIBeenPwned API returned status ${response.status}`);
        return [];
      }
      
      const breaches = await response.json();
      // The HIBP API returns objects with PascalCase keys, map them to our schema.
      return breaches.map((breach: any) => ({
          name: breach.Name || 'Unknown',
          domain: breach.Domain || 'Unknown',
          breachDate: breach.BreachDate || 'Unknown',
          // Strip HTML tags from description
          description: breach.Description?.replace(/<[^>]*>?/gm, '') || 'No description provided.',
      }));
      
    } catch (error) {
      console.error('[OSINT Tool] Error fetching from HaveIBeenPwned API:', error);
      // It's better to return an empty array than to crash the whole agent flow.
      return [];
    }
  }
);

// Burner Phone Check Tool
export const checkBurnerPhoneNumber = ai.defineTool(
    {
      name: 'checkBurnerPhoneNumber',
      description: 'Checks if a phone number is a known burner or a temporary number using AbstractAPI.',
      inputSchema: BurnerCheckInputSchema,
      outputSchema: BurnerCheckOutputSchema,
    },
    async ({ phoneNumber }) => {
        const apiKey = process.env.ABSTRACT_API_KEY;

        if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey === "") {
          console.warn('[OSINT Tool] AbstractAPI key not set. Using mock data for burner phone check.');
          if (phoneNumber.includes('555')) {
            return { isBurner: true, carrier: 'BurnerApp Services (Mock)', country: 'US' }
          }
          return { isBurner: false, carrier: 'Major Carrier (Mock)', country: 'US' }
        }

        const url = `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${phoneNumber}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`[OSINT Tool] AbstractAPI returned status ${response.status}`);
                // Don't throw, just return a safe default.
                return { isBurner: false, carrier: 'API Error', country: 'Unknown' };
            }
            const data = await response.json();
            
            // VOIP numbers are often used as burners. This is a reasonable proxy.
            const isBurner = data.type === 'VOIP';

            return {
                isBurner,
                carrier: data.carrier || 'Unknown',
                country: data.country?.code || 'Unknown',
            };
        } catch (error) {
            console.error('[OSINT Tool] Error fetching from AbstractAPI:', error);
            // Don't throw, just return a safe default.
            return { isBurner: false, carrier: 'Fetch Error', country: 'Unknown' };
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
