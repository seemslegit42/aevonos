
import { z } from 'zod';

export const InventoryDaemonInputSchema = z.object({
  query: z.string().describe("The user's inventory-related query or command."),
  workspaceId: z.string(),
  userId: z.string(),
});
export type InventoryDaemonInput = z.infer<typeof InventoryDaemonInputSchema>;

export const InventoryDaemonOutputSchema = z.object({
  response: z.string().describe("The final, synthesized response from the Inventory Daemon."),
});
export type InventoryDaemonOutput = z.infer<typeof InventoryDaemonOutputSchema>;
