
'use server';

import prisma from '@/lib/prisma';
import { UserPsyche, TransactionType } from '@prisma/client';

const PSYCHE_INSTRUMENT_ALIGNMENT: Record<UserPsyche, Record<string, number>> = {
  [UserPsyche.ZEN_ARCHITECT]: { // Silence, focus, precision
    'vandelay': 5,
    'dr-syntax': 3,
    'orphean-oracle': 3,
    'validator': 2,
    'stonks-bot': -10, // Negative alignment
    'infidelity-radar': -5,
  },
  [UserPsyche.SYNDICATE_ENFORCER]: { // Motion, aggression, results
    'lahey-surveillance': 3,
    'infidelity-radar': 5,
    'stonks-bot': 5,
    'inventory-daemon': 4,
  },
  [UserPsyche.RISK_AVERSE_ARTISAN]: { // Worship, safety, perfection
    'sterileish': 5,
    'barbara': 5,
    'winston-wolfe': 4,
    'rolodex': 3,
    'validator': 3,
    'stonks-bot': -15,
  }
};

/**
 * Calculates the Vow Alignment Score (VAS) for a given user.
 * This score reflects how closely a user's actions align with their chosen psyche.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the user's VAS.
 */
export async function calculateVasForUser(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { psyche: true }
    });

    if (!user) return 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            createdAt: { gte: thirtyDaysAgo },
            type: TransactionType.DEBIT, // Only count actions that cost credits
        }
    });

    if (transactions.length === 0) return 100; // Base score for no activity

    const alignmentScores = PSYCHE_INSTRUMENT_ALIGNMENT[user.psyche];
    let totalScore = 0;

    for (const tx of transactions) {
        // Score based on Micro-App / instrument usage
        if (tx.instrumentId && alignmentScores[tx.instrumentId]) {
            totalScore += alignmentScores[tx.instrumentId];
        }
    }
    
    // Adjust score based on total activity volume, per psyche preference
    if (user.psyche === UserPsyche.ZEN_ARCHITECT) {
        // Penalize high volume of actions
        totalScore -= Math.floor(transactions.length / 5);
    } else if (user.psyche === UserPsyche.SYNDICATE_ENFORCER) {
        // Reward high volume of actions
        totalScore += Math.floor(transactions.length / 3);
    }
    
    // Normalize score to be within a reasonable range (e.g., 100-1000)
    // This is a simple normalization and can be improved.
    const baseScore = 100;
    const vas = baseScore + totalScore * 10;
    
    return Math.max(0, Math.round(vas));
}
