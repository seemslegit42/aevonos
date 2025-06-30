
'use server';
/**
 * @fileOverview The core Klepsydra service for calculating outcomes.
 * This is the heart of the Profit Pulse Engine.
 */
import {
  getCurrentPulseValue,
  recordWin,
  recordLoss,
  shouldTriggerPityBoon,
} from './pulse-engine-service';
import { pulseEngineConfig } from '@/config/pulse-engine-config';
import { chaosCardManifest } from '@/config/chaos-cards';
import prisma from '@/lib/prisma';
import { InsufficientCreditsError } from '@/lib/errors';
import { UserPsyche, TransactionType, Prisma } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';

const INSTRUMENT_CONFIG: Record<string, { baseOdds: number; winMultiplier: number }> =
  chaosCardManifest.reduce((acc, card) => {
    acc[card.key] = {
      baseOdds: Math.max(0.05, 1 - card.cost / 2000), // Simple inverse relation to cost
      winMultiplier: 1.5 + card.cost / 500, // Higher cost, higher reward
    };
    return acc;
  }, {} as Record<string, { baseOdds: number; winMultiplier: number }>);

const PSYCHE_MODIFIERS: Record<UserPsyche, { oddsFactor: number; boonFactor: number }> = {
    [UserPsyche.ZEN_ARCHITECT]: { oddsFactor: 1.0, boonFactor: 1.0 }, // The baseline experience
    [UserPsyche.SYNDICATE_ENFORCER]: { oddsFactor: 0.85, boonFactor: 1.25 }, // Higher risk, higher reward
    [UserPsyche.RISK_AVERSE_ARTISAN]: { oddsFactor: 1.15, boonFactor: 0.8 }, // Lower risk, lower reward
};

/**
 * Atomically processes a tribute for a Chaos Card. This function handles all logic:
 * outcome calculation, credit validation, database updates, and transaction logging.
 * @param userId The user making the tribute.
 * @param workspaceId The user's workspace.
 * @param cardKey The key of the Chaos Card being used.
 * @returns An object with the final outcome and boon amount.
 */
export async function processChaosCardTribute(
  userId: string,
  workspaceId: string,
  cardKey: string,
) {
    const cardManifest = chaosCardManifest.find(card => card.key === cardKey);
    if (!cardManifest) {
        throw new Error('Chaos Card not found in manifest.');
    }
    const { cost: tributeAmount, name: cardName, systemEffect, cardClass } = cardManifest;

    return prisma.$transaction(async (tx) => {
        // --- 1. PRE-CHECK AND OUTCOME CALCULATION ---
        const [user, workspace, cardInDb] = await Promise.all([
            tx.user.findUniqueOrThrow({ where: { id: userId }, select: { psyche: true } }),
            tx.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { credits: true } }),
            tx.chaosCard.findUniqueOrThrow({ where: { key: cardKey } }),
        ]);

        if ((workspace.credits as unknown as number) < tributeAmount) {
            throw new InsufficientCreditsError('Cannot make tribute. Insufficient credits.');
        }
        
        const instrument = INSTRUMENT_CONFIG[cardKey] || { baseOdds: 0.5, winMultiplier: 2 };
        const modifiers = PSYCHE_MODIFIERS[user.psyche] || PSYCHE_MODIFIERS.ZEN_ARCHITECT;
        const modifiedBaseOdds = instrument.baseOdds * modifiers.oddsFactor;
        const modifiedWinMultiplier = instrument.winMultiplier * modifiers.boonFactor;

        // These pulse engine functions are safe to call as they only read data.
        const luckWeight = await getCurrentPulseValue(userId);
        const isPity = await shouldTriggerPityBoon(userId);
        
        const finalOdds = Math.max(0, Math.min(1, modifiedBaseOdds * luckWeight));
        
        let outcome = 'loss';
        let boonAmount = 0;
        
        if (isPity) {
            outcome = 'pity_boon';
            boonAmount = tributeAmount * 0.5;
        } else if (Math.random() < finalOdds) {
            outcome = 'win';
            boonAmount = tributeAmount * modifiedWinMultiplier;
        }

        const netAmount = boonAmount - tributeAmount;

        // --- 2. ATOMIC DATABASE WRITES ---
        // Update user's pulse profile, passing the transaction client.
        if (outcome === 'loss') {
            await recordLoss(userId, tx);
        } else {
            await recordWin(userId, tx);
        }

        // Update workspace balance
        await tx.workspace.update({
            where: { id: workspaceId },
            data: { credits: { increment: new Prisma.Decimal(netAmount) } },
        });

        // Log the TRIBUTE transaction
        await tx.transaction.create({
            data: {
                workspaceId, userId, instrumentId: cardKey,
                type: TransactionType.TRIBUTE,
                amount: new Prisma.Decimal(netAmount),
                description: `Tribute: ${cardName} - ${outcome}`,
                luckWeight, outcome, boonAmount: new Prisma.Decimal(boonAmount),
                userPsyche: user.psyche, status: 'COMPLETED',
            }
        });

        // If it's a win, award the card and handle effects
        if (outcome === 'win' || outcome === 'pity_boon') {
            await tx.user.update({
                where: { id: userId },
                data: { ownedChaosCards: { connect: { id: cardInDb.id } } },
            });
            
            if (systemEffect && cardClass === 'AESTHETIC') {
               await tx.activeSystemEffect.deleteMany({
                  where: { workspaceId: workspaceId, cardKey: { in: ['ACROPOLIS_MARBLE'] } }
               });
               await tx.activeSystemEffect.create({
                  data: {
                    workspaceId: workspaceId,
                    cardKey: cardKey,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
                  }
               });
            }
        }
        
        // Update instrument discovery log
        const discovery = await tx.instrumentDiscovery.findFirst({
            where: { userId, instrumentId: cardKey, converted: false }
        });
        
        if (discovery) {
            const dtt = differenceInMinutes(new Date(), discovery.firstViewedAt);
            await tx.instrumentDiscovery.update({
                where: { id: discovery.id },
                data: { converted: true, dtt: dtt > 0 ? dtt : 1 }
            });
        }
        
        return { outcome, boonAmount };
    });
}
