
'use server';
import { getRecentTransactionsForUser as getRecentTransactionsForUserFromDb } from '@/services/ledger-service';

export async function getRecentTransactionsAsText(userId: string, workspaceId: string): Promise<string> {
    try {
        const transactions = await getRecentTransactionsForUserFromDb(userId, workspaceId, 5);
        if (transactions.length === 0) {
            return "No recent financial transactions found for this user.";
        }
        const transactionText = `Recent financial transactions for user ${userId}:\n${transactions.map(tx => `- [${tx.createdAt.toISOString()}] ${tx.type}: ${tx.amount.toFixed(2)} - ${tx.description}`).join('\n')}`;
        return transactionText;
    } catch (e) {
        console.error("Failed to get recent transactions for user:", e);
        return "Error: Could not retrieve recent financial context.";
    }
}
