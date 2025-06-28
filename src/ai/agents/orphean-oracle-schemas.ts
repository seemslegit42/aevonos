
'use server';

import { z } from 'zod';

const NodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  size: z.number().min(0.1),
  color: z.string().describe('An HSL color string, e.g., "hsl(275, 86%, 37%)"'),
  pulseSpeed: z.number().describe('The speed of the pulsating animation.'),
});

const ConnectionSchema = z.object({
  source: z.string(),
  target: z.string(),
  strength: z.number().min(0.1).max(1.0).describe('The opacity/strength of the connection line.'),
});

export const OrpheanOracleInputSchema = z.object({
  userQuery: z.string().describe('The user\'s analytical question about their business.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type OrpheanOracleInput = z.infer<typeof OrpheanOracleInputSchema>;

export const OrpheanOracleOutputSchema = z.object({
  summary: z.string().describe('A short, poetic, narrative summary of the data\'s story.'),
  keyInsights: z.array(z.string()).describe('A list of 3-4 key, actionable insights discovered in the data.'),
  visualizationData: z.object({
    nodes: z.array(NodeSchema),
    connections: z.array(ConnectionSchema),
  }).describe('The parameters for rendering the 3D data constellation.'),
});
export type OrpheanOracleOutput = z.infer<typeof OrpheanOracleOutputSchema>;
