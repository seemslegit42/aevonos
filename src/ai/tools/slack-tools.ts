
'use server';
import { ai } from '@/ai/genkit';
import { GetSlackChannelMessagesInputSchema, GetSlackChannelMessagesOutputSchema } from './slack-schemas';
import { WebClient } from '@slack/web-api';
import { getIntegrationCredentials } from '@/services/integration-service';


export const getSlackChannelMessages = ai.defineTool(
  {
    name: 'getSlackChannelMessages',
    description: 'Fetches recent messages from a Slack channel using the configured integration.',
    inputSchema: GetSlackChannelMessagesInputSchema,
    outputSchema: GetSlackChannelMessagesOutputSchema,
  },
  async ({ channelId, workspaceId }) => {
    const credentials = await getIntegrationCredentials(workspaceId, 'Slack');
    
    if (!credentials?.apiKey) {
      throw new Error('Slack integration has not been configured for this workspace. Please add your Slack API token in the Integration Nexus.');
    }
    
    const slackClient = new WebClient(credentials.apiKey);

    try {
      const result = await slackClient.conversations.history({
        channel: channelId,
        limit: 20, // Fetch the last 20 messages for analysis
      });

      if (!result.ok || !result.messages) {
        throw new Error(`Slack API error: ${result.error || 'Failed to fetch messages.'}`);
      }

      // Filter out non-user messages and map to our schema
      const userMessages = result.messages
        .filter(msg => msg.type === 'message' && msg.user)
        .map(msg => ({
            user: msg.user!,
            text: msg.text || '',
            ts: msg.ts!,
        }));

      return userMessages;

    } catch (error) {
      console.error(`[Slack Tool Error] Failed to fetch messages for channel ${channelId}:`, error);
      // Re-throw the error so the agent knows the tool call failed.
      throw new Error(error instanceof Error ? `Slack API Error: ${error.message}` : 'An unknown error occurred while fetching Slack messages.');
    }
  }
);
