
'use server';

import { z } from 'zod';

export const SlackMessageSchema = z.object({
  user: z.string(),
  text: z.string(),
  ts: z.string(),
});

export const GetSlackChannelMessagesInputSchema = z.object({
  channelId: z.string().describe('The ID of the Slack channel to fetch messages from.'),
});

export const GetSlackChannelMessagesOutputSchema = z.array(SlackMessageSchema);
