
'use server';
/**
 * @fileOverview Service for handling gamification, including accolades and ranks.
 */
import prisma from '@/lib/prisma';
import { UserRank } from '@prisma/client';

const XP_FOR_ACCOLADE = 50; // Default XP value if not specified on accolade

const RANK_THRESHOLDS: Record<UserRank, number> = {
    [UserRank.NEOPHYTE]: 0,
    [UserRank.ARCHITECT]: 500,
    [UserRank.FORGE_PRIEST]: 2000,
    [UserRank.DEMIURGE]: 10000,
};

/**
 * Grants an accolade to a user if they don't already have it.
 * Awards XP and updates the user's rank if they cross a threshold.
 * @param userId The ID of the user to grant the accolade to.
 * @param accoladeKey The unique key of the accolade to grant.
 */
export async function grantAccolade(userId: string, accoladeKey: string): Promise<void> {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Check if the user already has this accolade
            const existingLink = await tx.user.findFirst({
                where: {
                    id: userId,
                    accolades: { some: { key: accoladeKey } },
                },
            });

            // If the user already has it, we're done.
            if (existingLink) {
                return;
            }

            // 2. Find the accolade to be granted
            const accolade = await tx.accolade.findUnique({
                where: { key: accoladeKey },
            });

            if (!accolade) {
                console.warn(`[Gamification Service] Accolade with key "${accoladeKey}" not found. Cannot grant.`);
                return;
            }

            // 3. Get current user data
            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                console.warn(`[Gamification Service] User with ID "${userId}" not found. Cannot grant accolade.`);
                return;
            }

            // 4. Create the link and update the user's XP
            const newXp = user.xp + accolade.xpValue;

            // Determine the new rank
            let newRank = user.rank;
            for (const rank in RANK_THRESHOLDS) {
                if (newXp >= RANK_THRESHOLDS[rank as UserRank]) {
                    newRank = rank as UserRank;
                }
            }

            // 5. Update user atomically
            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: {
                        increment: accolade.xpValue,
                    },
                    rank: newRank,
                    accolades: {
                        connect: { id: accolade.id },
                    },
                },
            });

             console.log(`[Gamification Service] Granted accolade "${accolade.name}" to user ${userId}. New XP: ${newXp}, New Rank: ${newRank}`);
        });
    } catch (error) {
        console.error(`[Gamification Service] Failed to grant accolade "${accoladeKey}" to user ${userId}:`, error);
        // We don't re-throw here because a gamification failure should not crash a core business logic flow.
    }
}
